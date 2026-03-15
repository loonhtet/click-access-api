import { Router } from "express";
import {
  getOrders,
  getSingleOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";
import { orderSchema, updateOrderSchema } from "../schemas/order.schema.js";
import validate from "../utils/validate.js";

const orderRouter = Router();

orderRouter.get("/", getOrders);
orderRouter.get("/:id", getSingleOrder);
orderRouter.post("/", validate(orderSchema), createOrder);
orderRouter.patch(
  "/:id/status",
  validate(updateOrderSchema),
  updateOrderStatus,
);
orderRouter.delete("/:id", deleteOrder);

export default orderRouter;
