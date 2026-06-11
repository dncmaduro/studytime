import { hashPassword } from "@/lib/password";
import { createSessionForUser } from "@/lib/auth";
import { createUserRecord } from "@/lib/db/queries";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = await parseRequestBody(request, registerSchema);
    const passwordHash = await hashPassword(input.password);
    const user = await createUserRecord({
      username: input.username.trim(),
      email: input.email.trim(),
      displayName: input.displayName.trim(),
      passwordHash,
    });

    await createSessionForUser({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return jsonOk({ user }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
