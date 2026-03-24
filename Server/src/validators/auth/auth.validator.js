import {z} from "zod";

export const registerSchema = z.object({
     username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, _"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
})