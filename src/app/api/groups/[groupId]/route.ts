import { requireCurrentUser } from "@/lib/auth";
import { deleteGroupRecord, getGroupDetails, updateGroupRecord } from "@/lib/db/queries";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { assertGroupMember, assertGroupOwner } from "@/lib/permissions";
import { groupUpdateSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireCurrentUser();
    const { groupId } = await context.params;
    const membership = await assertGroupMember(groupId, user.id);
    const details = await getGroupDetails(groupId);
    return jsonOk({ ...details, membership });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireCurrentUser();
    const { groupId } = await context.params;
    await assertGroupOwner(groupId, user.id);
    const input = await parseRequestBody(request, groupUpdateSchema);
    const group = await updateGroupRecord({
      groupId,
      name: input.name.trim(),
      description: input.description?.trim(),
    });
    return jsonOk({ group });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireCurrentUser();
    const { groupId } = await context.params;
    await assertGroupOwner(groupId, user.id);
    const group = await deleteGroupRecord(groupId);
    return jsonOk({ group });
  } catch (error) {
    return handleRouteError(error);
  }
}
