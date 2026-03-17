import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import paginate from "../utils/pagination.js";

const getAdmins = async (req, res) => {
  try {
    const { search } = req.query;

    const result = await paginate(prisma.admin, req, {
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch admins",
      error: error.message,
    });
  }
};

const getSingleAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    res.status(200).json({ status: "success", data: admin });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch admin",
      error: error.message,
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const adminExists = await prisma.admin.findUnique({ where: { email } });
    if (adminExists) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: { email, name, password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    const adminExists = await prisma.admin.findUnique({ where: { id } });
    if (!adminExists) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    if (email && email !== adminExists.email) {
      const emailTaken = await prisma.admin.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({
          status: "error",
          message: "Email already exists",
        });
      }
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(name && { name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Admin updated successfully",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update admin",
      error: error.message,
    });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const adminExists = await prisma.admin.findUnique({ where: { id } });
    if (!adminExists) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    await prisma.admin.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    await prisma.admin.update({
      where: { id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to change password",
      error: error.message,
    });
  }
};

export {
  getAdmins,
  getSingleAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  changeAdminPassword,
};
