import { requireCurrentUser } from "@/lib/auth";
import { changeUserPassword } from "@/lib/db/queries";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const input = await parseRequestBody(request, changePasswordSchema);
    const newPasswordHash = await hashPassword(input.newPassword);

    await changeUserPassword({
      userId: user.id,
      currentPassword: input.oldPassword,
      newPasswordHash,
    });

    return jsonOk({ message: "Password updated" });
  } catch (error) {
    return handleRouteError(error);
  }
}
