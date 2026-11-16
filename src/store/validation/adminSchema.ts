import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{10,15}$/;

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
    .min(10, "Password must be at least 10 characters")
    .max(15, "Password must be at most 15 characters")
    .regex(
      passwordRegex,
      "Password must contain one uppercase letter, one lowercase letter, one special character and be 10 to 15 characters long"
    ),

  role: z.enum(["admin", "super_admin"], {
    message: "Please select a valid role",
  }),
});