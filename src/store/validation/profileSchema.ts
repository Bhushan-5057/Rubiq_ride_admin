import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .regex(/^[A-Za-z ]+$/, "Name must contain only letters"),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(10, "Minimum 10 characters required")
      .max(15, "Maximum 15 characters allowed"),

    newPassword: z
      .string()
      .min(10, "Minimum 10 characters required")
      .max(15, "Maximum 15 characters allowed")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{10,15}$/,
        "Use uppercase, lowercase & special character",
      ),

    confirmPassword: z
      .string()
      .min(10, "Minimum 10 characters required")
      .max(15, "Maximum 15 characters allowed"),
  })
  .refine((value) => value.newPassword !== value.oldPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
