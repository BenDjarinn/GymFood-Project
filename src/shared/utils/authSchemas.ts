import { z } from "zod";

// ─── Register ────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters"),
    phoneNumber: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d+$/, "Phone number must contain only digits"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Login ───────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
