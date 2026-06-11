import { findUserByIdentifier, createPasswordResetTokenRecord } from "@/lib/db/queries";
import { env, isProduction } from "@/lib/env";
import { sendPasswordResetEmail } from "@/lib/email";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = await parseRequestBody(request, forgotPasswordSchema);
    const user = await findUserByIdentifier(input.identifier.trim());

    if (!user) {
      return jsonOk({
        message:
          "If that account exists, a password reset link has been prepared.",
      });
    }

    const { token } = await createPasswordResetTokenRecord(user.id);
    const result = await sendPasswordResetEmail({
      to: user.email,
      username: user.displayName,
      token,
    });

    return jsonOk({
      message:
        "If that account exists, a password reset link has been prepared.",
      ...(result.sent
        ? { delivery: result.transport }
        : !isProduction
          ? {
              developmentMessage:
                "Email delivery is not configured. Use the development reset link below.",
              resetUrl: result.resetUrl,
            }
          : {}),
      appName: env.NEXT_PUBLIC_APP_NAME,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
