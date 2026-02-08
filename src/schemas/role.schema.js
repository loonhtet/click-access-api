import z from "zod/v3";

const roleSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .max(100, "Name must not exceed 100 characters")
    .min(1, "Name cannot be empty"),
});

export { roleSchema };
