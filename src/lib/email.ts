import nodemailer from "nodemailer";

import { env } from "@/lib/env";

type SendResetArgs = {
  to: string;
  username: string;
  token: string;
};

export async function sendPasswordResetEmail({ to, username, token }: SendResetArgs) {
  const resetUrl = new URL("/reset-password", env.NEXT_PUBLIC_APP_URL);
  resetUrl.searchParams.set("token", token);

  if (env.RESEND_API_KEY && env.PASSWORD_RESET_FROM_EMAIL) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.PASSWORD_RESET_FROM_EMAIL,
        to,
        subject: `${env.NEXT_PUBLIC_APP_NAME} password reset`,
        html: `<p>Hello ${username},</p><p>Reset your password with this link:</p><p><a href="${resetUrl.toString()}">${resetUrl.toString()}</a></p>`,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send reset email with Resend");
    }

    return { sent: true, transport: "resend", resetUrl: resetUrl.toString() };
  }

  if (
    env.SMTP_HOST &&
    env.SMTP_PORT &&
    env.SMTP_USER &&
    env.SMTP_PASS &&
    env.PASSWORD_RESET_FROM_EMAIL
  ) {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: env.SMTP_SECURE === "true",
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: env.PASSWORD_RESET_FROM_EMAIL,
      to,
      subject: `${env.NEXT_PUBLIC_APP_NAME} password reset`,
      html: `<p>Hello ${username},</p><p>Reset your password with this link:</p><p><a href="${resetUrl.toString()}">${resetUrl.toString()}</a></p>`,
    });

    return { sent: true, transport: "smtp", resetUrl: resetUrl.toString() };
  }

  return { sent: false, transport: "none", resetUrl: resetUrl.toString() };
}
