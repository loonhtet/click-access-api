import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  adminSendOTP,
  adminVerifyOTP,
  adminResetPassword,
} from "../controllers/auth.admin.controller.js";
import validate from "../utils/validate.js";
import {
  adminAuthSchema,
  adminForgotPasswordSchema,
  adminVerifyOTPSchema,
  adminResetPasswordSchema,
} from "../schemas/auth.admin.schema.js";

const adminAuthRouter = Router();

adminAuthRouter.post("/login", validate(adminAuthSchema), adminLogin);
adminAuthRouter.post("/logout", adminLogout);
adminAuthRouter.post(
  "/forgot-password",
  validate(adminForgotPasswordSchema),
  adminSendOTP,
);
adminAuthRouter.post(
  "/verify-otp",
  validate(adminVerifyOTPSchema),
  adminVerifyOTP,
);
adminAuthRouter.post(
  "/reset-password",
  validate(adminResetPasswordSchema),
  adminResetPassword,
);

export default adminAuthRouter;
