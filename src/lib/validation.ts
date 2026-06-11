import { z } from "zod";

export const sessionStatusValues = [
  "active",
  "completed",
  "auto_closed",
  "cancelled",
  "needs_review",
] as const;

export const groupRoleValues = ["owner", "admin", "member"] as const;

export const registerSchema = z
  .object({
    username: z.string().min(3).max(30),
    email: z.email(),
    displayName: z.string().min(2).max(60),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const checkinSchema = z.object({
  note: z.string().max(500).optional().or(z.literal("")),
});

export const historyQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  status: z.enum(sessionStatusValues).optional(),
});

export const sessionEditSchema = z
  .object({
    checkinAt: z.string().min(1),
    checkoutAt: z.string().optional().nullable(),
    status: z.enum(sessionStatusValues),
    note: z.string().max(500).optional().nullable(),
    reason: z.string().min(3).max(300),
  })
  .refine(
    (data) =>
      !data.checkoutAt ||
      new Date(data.checkoutAt).getTime() > new Date(data.checkinAt).getTime(),
    {
      path: ["checkoutAt"],
      message: "Checkout must be later than check-in",
    },
  );

export const groupCreateSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(280).optional().or(z.literal("")),
});

export const groupUpdateSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(280).optional().or(z.literal("")),
});

export const groupMemberAddSchema = z.object({
  username: z.string().min(1),
});

export const groupMemberRoleSchema = z.object({
  role: z.enum(groupRoleValues),
});
