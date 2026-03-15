import z from "zod/v3";

const productSchema = z.object({
  type: z.enum(["VPN"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be one of: VPN",
  }),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(100, "Name must not exceed 100 characters"),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be greater than 0")
    .multipleOf(0.01, "Price must have at most 2 decimal places"),
  duration: z
    .number({
      required_error: "Duration is required",
      invalid_type_error: "Duration must be a number",
    })
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),
  durationUnit: z.enum(["MONTH", "YEAR"], {
    required_error: "Duration unit is required",
    invalid_type_error: "Duration unit must be one of: MONTH, YEAR",
  }),
  features: z
    .array(z.string().min(1, "Feature cannot be empty"))
    .optional()
    .default([]),
});

const updateProductSchema = productSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export { productSchema, updateProductSchema };
