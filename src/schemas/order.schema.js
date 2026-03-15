import z from "zod/v3";

const orderSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .uuid("User ID must be a valid UUID"),
  productId: z
    .string({ required_error: "Product ID is required" })
    .uuid("Product ID must be a valid UUID"),
  paymentId: z
    .string({ required_error: "Payment ID is required" })
    .uuid("Payment ID must be a valid UUID"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0")
    .optional()
    .default(1),
  notes: z.string().optional().nullable(),
});

const updateOrderSchema = z
  .object({
    status: z
      .enum(["PENDING", "COMPLETED", "CANCELLED"], {
        invalid_type_error:
          "Status must be one of: PENDING, COMPLETED, CANCELLED",
      })
      .optional(),
    transactionId: z
      .string()
      .max(100, "Transaction ID must not exceed 100 characters")
      .optional()
      .nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export { orderSchema, updateOrderSchema };
