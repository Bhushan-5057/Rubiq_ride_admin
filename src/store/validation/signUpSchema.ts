import { z } from "zod";

export const SignUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(/^[A-Za-z ]+$/, "Name must contain only letters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must not exceed 20 characters"),

  role: z.enum(["admin", "super_admin"], {
    message: "Please select a valid role",
  }),
});