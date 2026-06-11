import { createSessionForUser } from "@/lib/auth";
import { findUserByIdentifier } from "@/lib/db/queries";
import { BadRequestError } from "@/lib/errors";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = await parseRequestBody(request, loginSchema);
    const user = await findUserByIdentifier(input.identifier.trim());

    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    const validPassword = await verifyPassword(input.password, user.passwordHash);

    if (!validPassword) {
      throw new BadRequestError("Invalid credentials");
    }

    await createSessionForUser({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return jsonOk({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
