import { requireCurrentUser } from "@/lib/auth";
import { addUserToGroup } from "@/lib/db/queries";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { assertGroupAdmin } from "@/lib/permissions";
import { groupMemberAddSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireCurrentUser();
    const { groupId } = await context.params;
    await assertGroupAdmin(groupId, user.id);
    const input = await parseRequestBody(request, groupMemberAddSchema);
    const result = await addUserToGroup({
      groupId,
      username: input.username.trim(),
      addedByUserId: user.id,
    });
    return jsonOk(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
