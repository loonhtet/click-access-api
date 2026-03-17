import { prisma } from "../config/db.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "../services/email.service.js";

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    const token = generateToken(admin.id, res);

    res.status(200).json({
      status: "success",
      message: "Admin logged in successfully",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
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

const adminLogout = async (req, res) => {
  res.clearCookie("jwtToken", { httpOnly: true });
  res.status(200).json({
    status: "success",
    message: "Admin logged out successfully",
  });
};

const adminSendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Email does not exist",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.admin.update({
      where: { id: admin.id },
      data: { resetOTP: otp, resetOTPExpiry: otpExpiry },
    });

    await sendEmail({
      to: admin.email,
      type: "otp",
      variables: { otp, name: admin.name },
    });

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

const adminVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await prisma.admin.findFirst({
      where: {
        email,
        resetOTP: otp,
        resetOTPExpiry: { gte: new Date() },
      },
    });

    if (!admin) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      data: { email: admin.email },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Invalid or expired OTP",
      error: error.message,
    });
  }
};

const adminResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await prisma.admin.findFirst({
      where: {
        email,
        resetOTP: otp,
        resetOTPExpiry: { gte: new Date() },
      },
    });

    if (!admin) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired OTP",
      });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: await bcrypt.hash(newPassword, 10),
        resetOTP: null,
        resetOTPExpiry: null,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not reset password",
      error: error.message,
    });
  }
};

export {
  adminLogin,
  adminLogout,
  adminSendOTP,
  adminVerifyOTP,
  adminResetPassword,
};
