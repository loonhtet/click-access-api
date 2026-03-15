import z from "zod/v3";

const paymentSchema = z
  .object({
    method: z.enum(["QR_TRANSFER", "BANK_TRANSFER"], {
      required_error: "Method is required",
      invalid_type_error: "Method must be one of: QR_TRANSFER, BANK_TRANSFER",
    }),
    bankName: z
      .string()
      .max(100, "Bank name must not exceed 100 characters")
      .optional()
      .nullable(),
    accountName: z
      .string()
      .max(100, "Account name must not exceed 100 characters")
      .optional()
      .nullable(),
    accountNumber: z
      .string()
      .max(50, "Account number must not exceed 50 characters")
      .optional()
      .nullable(),
    qrImage: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "BANK_TRANSFER") {
      if (!data.bankName) {
        ctx.addIssue({
          path: ["bankName"],
          code: z.ZodIssueCode.custom,
          message: "Bank name is required for BANK_TRANSFER",
        });
      }
      if (!data.accountName) {
        ctx.addIssue({
          path: ["accountName"],
          code: z.ZodIssueCode.custom,
          message: "Account name is required for BANK_TRANSFER",
        });
      }
      if (!data.accountNumber) {
        ctx.addIssue({
          path: ["accountNumber"],
          code: z.ZodIssueCode.custom,
          message: "Account number is required for BANK_TRANSFER",
        });
      }
    }

    if (data.method === "QR_TRANSFER") {
      if (!data.qrImage) {
        ctx.addIssue({
          path: ["qrImage"],
          code: z.ZodIssueCode.custom,
          message: "QR image is required for QR_TRANSFER",
        });
      }
    }
  });

const updatePaymentSchema = z
  .object({
    method: z
      .enum(["QR_TRANSFER", "BANK_TRANSFER"], {
        invalid_type_error: "Method must be one of: QR_TRANSFER, BANK_TRANSFER",
      })
      .optional(),
    bankName: z
      .string()
      .max(100, "Bank name must not exceed 100 characters")
      .optional()
      .nullable(),
    accountName: z
      .string()
      .max(100, "Account name must not exceed 100 characters")
      .optional()
      .nullable(),
    accountNumber: z
      .string()
      .max(50, "Account number must not exceed 50 characters")
      .optional()
      .nullable(),
    qrImage: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export { paymentSchema, updatePaymentSchema };
