import { prisma } from "../config/db.js";

const getRoles = async (req, res) => {
  try {
    const result = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};

const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    const existingRole = await prisma.role.findFirst({
      where: { name },
    });

    if (existingRole) {
      return res.status(400).json({
        status: "error",
        message: "Role name already exists",
      });
    }

    await prisma.role.create({
      data: { name },
    });

    res.status(201).json({
      status: "success",
      message: "Role created successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create role",
      error: error.message,
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const roleExists = await prisma.role.findUnique({
      where: { id },
    });

    if (!roleExists) {
      return res.status(404).json({
        status: "error",
        message: "Role not found",
      });
    }

    if (name && name !== roleExists.name) {
      const nameTaken = await prisma.role.findFirst({
        where: { name },
      });

      if (nameTaken) {
        return res.status(400).json({
          status: "error",
          message: "Role name already exists",
        });
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: { ...(name && { name }) },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update role",
      error: error.message,
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const roleExists = await prisma.role.findUnique({
      where: { id },
    });

    if (!roleExists) {
      return res.status(404).json({
        status: "error",
        message: "Role not found",
      });
    }

    await prisma.role.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete role",
      error: error.message,
    });
  }
};

export { getRoles, createRole, updateRole, deleteRole };
