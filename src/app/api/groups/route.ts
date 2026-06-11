import { requireCurrentUser } from "@/lib/auth";
import { createGroup, listGroupsForUser } from "@/lib/db/queries";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { groupCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const groups = await listGroupsForUser(user.id);
    return jsonOk({ groups });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const input = await parseRequestBody(request, groupCreateSchema);
    const group = await createGroup({
      userId: user.id,
      name: input.name.trim(),
      description: input.description?.trim(),
    });
    return jsonOk({ group }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
