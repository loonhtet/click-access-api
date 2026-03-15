import { prisma } from "../config/db.js";
import paginate from "../utils/pagination.js";

const getProducts = async (req, res) => {
  try {
    const { type, isActive, search } = req.query;

    const whereClause = {
      ...(type && { type: type.toUpperCase() }),
      ...(isActive !== undefined && { isActive: isActive === "true" }),
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
    };

    const [result, totalActive, totalInactive] = await Promise.all([
      paginate(prisma.product, req, {
        where: whereClause,
        select: {
          id: true,
          type: true,
          name: true,
          price: true,
          duration: true,
          durationUnit: true,
          features: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
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
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        name: true,
        price: true,
        duration: true,
        durationUnit: true,
        features: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { type, name, price, duration, durationUnit, features } = req.body;

    const validTypes = ["VPN"];
    const validDurationUnits = ["MONTH", "YEAR"];

    if (!validTypes.includes(type?.toUpperCase())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product type",
      });
    }

    if (!validDurationUnits.includes(durationUnit?.toUpperCase())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid duration unit. Must be MONTH or YEAR",
      });
    }

    const product = await prisma.product.create({
      data: {
        type: type.toUpperCase(),
        name,
        price,
        duration,
        durationUnit: durationUnit.toUpperCase(),
        features: features ?? [],
      },
    });

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: { id: product.id },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, durationUnit, features, isActive } =
      req.body;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    if (
      durationUnit &&
      !["MONTH", "YEAR"].includes(durationUnit.toUpperCase())
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid duration unit. Must be MONTH or YEAR",
      });
    }

    const updateData = {
      ...(name && { name }),
      ...(price !== undefined && { price }),
      ...(duration !== undefined && { duration }),
      ...(durationUnit && { durationUnit: durationUnit.toUpperCase() }),
      ...(features && { features }),
      ...(isActive !== undefined && { isActive }),
    };

    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    res.status(200).json({
      status: "success",
      message: `Product ${!product.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to toggle product status",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    const hasOrders = await prisma.order.count({ where: { productId: id } });

    if (hasOrders > 0) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete a product that has existing orders",
      });
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

export {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};
