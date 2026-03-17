import z from "zod/v3";

const adminAuthSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

const adminForgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address"),
});

const adminVerifyOTPSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address"),
  otp: z
    .string({ required_error: "OTP is required" })
    .length(6, "OTP must be 6 digits"),
});

const adminResetPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address"),
  otp: z
    .string({ required_error: "OTP is required" })
    .length(6, "OTP must be 6 digits"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password must not exceed 50 characters"),
});

export {
  adminAuthSchema,
  adminForgotPasswordSchema,
  adminVerifyOTPSchema,
  adminResetPasswordSchema,
};
