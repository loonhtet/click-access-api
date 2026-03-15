import { prisma } from "../config/db.js";
import paginate from "../utils/pagination.js";

const getPayments = async (req, res) => {
  try {
    const { method, isActive } = req.query;

    const whereClause = {
      ...(method && { method: method.toUpperCase() }),
      ...(isActive !== undefined && { isActive: isActive === "true" }),
    };

    const [result, totalActive, totalInactive] = await Promise.all([
      paginate(prisma.payment, req, {
        where: whereClause,
        select: {
          id: true,
          method: true,
          bankName: true,
          accountName: true,
          accountNumber: true,
          qrImage: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where: { isActive: true } }),
      prisma.payment.count({ where: { isActive: false } }),
    ]);

    res.status(200).json({
      status: "success",
      data: result.data,
      pagination: result.pagination,
      counts: {
        total: result.pagination.total,
        totalActive,
        totalInactive,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

const getSinglePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        method: true,
        bankName: true,
        accountName: true,
        accountNumber: true,
        qrImage: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const { method, bankName, accountName, accountNumber, qrImage } = req.body;

    const payment = await prisma.payment.create({
      data: {
        method: method.toUpperCase(),
        bankName: bankName ?? null,
        accountName: accountName ?? null,
        accountNumber: accountNumber ?? null,
        qrImage: qrImage ?? null,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Payment created successfully",
      data: { id: payment.id },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, bankName, accountName, accountNumber, qrImage, isActive } =
      req.body;

    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    const updateData = {
      ...(method && { method: method.toUpperCase() }),
      ...(bankName !== undefined && { bankName }),
      ...(accountName !== undefined && { accountName }),
      ...(accountNumber !== undefined && { accountNumber }),
      ...(qrImage !== undefined && { qrImage }),
      ...(isActive !== undefined && { isActive }),
    };

    await prisma.payment.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: "success",
      message: "Payment updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

const togglePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    await prisma.payment.update({
      where: { id },
      data: { isActive: !payment.isActive },
    });

    res.status(200).json({
      status: "success",
      message: `Payment ${!payment.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to toggle payment status",
      error: error.message,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    const hasOrders = await prisma.order.count({ where: { paymentId: id } });

    if (hasOrders > 0) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete a payment that has existing orders",
      });
    }

    await prisma.payment.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};

export {
  getPayments,
  getSinglePayment,
  createPayment,
  updatePayment,
  togglePaymentStatus,
  deletePayment,
};
