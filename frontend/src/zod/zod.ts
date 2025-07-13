import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  profilePic: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
