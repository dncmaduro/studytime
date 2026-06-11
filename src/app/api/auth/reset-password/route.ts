import { hashPassword } from "@/lib/password";
import { consumePasswordResetToken, resetUserPassword } from "@/lib/db/queries";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = await parseRequestBody(request, resetPasswordSchema);
    const tokenRecord = await consumePasswordResetToken(input.token);
    const newPasswordHash = await hashPassword(input.password);

    await resetUserPassword({
      userId: tokenRecord.userId,
      newPasswordHash,
      tokenId: tokenRecord.id,
    });

    return jsonOk({ message: "Password reset successfully" });
  } catch (error) {
    return handleRouteError(error);
  }
}
