import { prisma } from "../config/db.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    const token = generateToken(user.id, res);

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not login",
      error: error.message,
    });
  }
};

const userLogout = async (req, res) => {
  res.clearCookie("jwtToken", { httpOnly: true });
  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
};

export { userLogin, userLogout };
