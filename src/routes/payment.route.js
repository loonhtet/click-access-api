import { Router } from "express";
import {
  getPayments,
  getSinglePayment,
  createPayment,
  updatePayment,
  togglePaymentStatus,
  deletePayment,
} from "../controllers/payment.controller.js";
import {
  paymentSchema,
  updatePaymentSchema,
} from "../schemas/payment.schema.js";
import validate from "../utils/validate.js";

const paymentRouter = Router();

paymentRouter.get("/", getPayments);
paymentRouter.get("/:id", getSinglePayment);
paymentRouter.post("/", validate(paymentSchema), createPayment);
paymentRouter.put("/:id", validate(updatePaymentSchema), updatePayment);
paymentRouter.patch("/:id/toggle", togglePaymentStatus);
paymentRouter.delete("/:id", deletePayment);

export default paymentRouter;
