import { prisma } from "../config/db.js";
import paginate from "../utils/pagination.js";

const orderSelect = {
  id: true,
  quantity: true,
  totalAmount: true,
  notes: true,
  transactionId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true, email: true },
  },
  product: {
    select: {
      id: true,
      name: true,
      type: true,
      price: true,
      duration: true,
      durationUnit: true,
    },
  },
  payment: {
    select: {
      id: true,
      method: true,
      bankName: true,
      accountName: true,
      accountNumber: true,
    },
  },
  key: {
    select: { id: true, key: true, status: true, expiresAt: true },
  },
};

const getOrders = async (req, res) => {
  try {
    const { status, userId, productId, paymentId, search } = req.query;

    const whereClause = {
      ...(status && { status: status.toUpperCase() }),
      ...(userId && { userId }),
      ...(productId && { productId }),
      ...(paymentId && { paymentId }),
      ...(search && {
        OR: [
          { transactionId: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [result, totalPending, totalCompleted, totalCancelled] =
      await Promise.all([
        paginate(prisma.order, req, {
          where: whereClause,
          select: orderSelect,
          orderBy: { createdAt: "desc" },
        }),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "COMPLETED" } }),
        prisma.order.count({ where: { status: "CANCELLED" } }),
      ]);

    res.status(200).json({
      status: "success",
      data: result.data,
      pagination: result.pagination,
      counts: {
        total: result.pagination.total,
        totalPending,
        totalCompleted,
        totalCancelled,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: orderSelect,
    });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const { userId, productId, paymentId, quantity, notes } = req.body;

    const [user, product, payment] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.payment.findUnique({ where: { id: paymentId } }),
    ]);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }
    if (!product.isActive) {
      return res
        .status(400)
        .json({ status: "error", message: "Product is not available" });
    }
    if (!payment) {
      return res
        .status(404)
        .json({ status: "error", message: "Payment not found" });
    }
    if (!payment.isActive) {
      return res
        .status(400)
        .json({ status: "error", message: "Payment method is not available" });
    }

    const qty = quantity ?? 1;
    const totalAmount = parseFloat(product.price) * qty;

    const order = await prisma.order.create({
      data: {
        userId,
        productId,
        paymentId,
        quantity: qty,
        totalAmount,
        notes: notes ?? null,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: { id: order.id },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId, notes } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({
        status: "error",
        message: "Cannot update a cancelled order",
      });
    }

    if (order.status === "COMPLETED" && status !== "CANCELLED") {
      return res.status(400).json({
        status: "error",
        message: "A completed order can only be cancelled",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          ...(status && { status: status.toUpperCase() }),
          ...(transactionId !== undefined && { transactionId }),
          ...(notes !== undefined && { notes }),
        },
      });

      // Auto-create a key when order is completed
      if (status?.toUpperCase() === "COMPLETED" && !order.key) {
        const { duration, durationUnit } = order.product;

        const expiresAt = new Date();
        if (durationUnit === "MONTH") {
          expiresAt.setMonth(expiresAt.getMonth() + duration);
        } else if (durationUnit === "YEAR") {
          expiresAt.setFullYear(expiresAt.getFullYear() + duration);
        }

        await tx.key.create({
          data: {
            orderId: id,
            userId: order.userId,
            key: crypto.randomUUID(),
            expiresAt,
          },
        });
      }
    });

    res.status(200).json({
      status: "success",
      message: "Order updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update order",
      error: error.message,
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    if (order.status === "COMPLETED") {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete a completed order",
      });
    }

    await prisma.order.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

export {
  getOrders,
  getSingleOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
