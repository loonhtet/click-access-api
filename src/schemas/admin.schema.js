import z from "zod/v3";

const adminSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address"),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(100, "Name must not exceed 100 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password must not exceed 50 characters"),
});

const updateAdminSchema = z.object({
  email: z.string().email("Please provide a valid email address").optional(),
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
});

// const changeAdminPasswordSchema = z
//   .object({
//     currentPassword: z
//       .string({ required_error: "Current password is required" })
//       .min(1, "Current password cannot be empty"),
//     newPassword: z
//       .string({ required_error: "New password is required" })
//       .min(6, "Password must be at least 6 characters long")
//       .max(50, "Password must not exceed 50 characters"),
//     confirmPassword: z
//       .string({ required_error: "Confirm password is required" })
//       .min(1, "Confirm password cannot be empty"),
//   })
//   .refine((data) => data.newPassword === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

export { adminSchema, updateAdminSchema };
