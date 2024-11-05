import z from "zod";

export const userSignupSchema = z.object({
  username: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["USER", "ADMIN"]),
});

export const userSigninSchema = z.object({
  username: z.string().email(),
  password: z.string().min(6),
});
