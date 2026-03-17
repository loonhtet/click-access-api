import z from "zod/v3";

const orderSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .uuid("Invalid user ID"),
  productId: z
    .string({ required_error: "Product ID is required" })
    .uuid("Invalid product ID"),
  paymentId: z
    .string({ required_error: "Payment ID is required" })
    .uuid("Invalid payment ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
  transactionId: z
    .string({ required_error: "Transaction ID is required" })
    .min(1, "Transaction ID cannot be empty")
    .max(100, "Transaction ID must not exceed 100 characters"),
  notes: z
    .string()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be COMPLETED or CANCELLED",
  }),
  notes: z
    .string()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional(),
});

export { orderSchema, updateOrderStatusSchema };
