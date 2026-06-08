import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{10,15}$/;

export const SignInSchema = z.object({
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
      "Password must include uppercase, special character, and be 10-15 characters"
    ),
});