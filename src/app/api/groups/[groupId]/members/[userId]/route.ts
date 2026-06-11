import { requireCurrentUser } from "@/lib/auth";
import { removeUserFromGroup, updateGroupMemberRole } from "@/lib/db/queries";
import { ForbiddenError } from "@/lib/errors";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { assertGroupAdmin, assertGroupMember, assertGroupOwner } from "@/lib/permissions";
import { groupMemberRoleSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ groupId: string; userId: string }> },
) {
  try {
    const user = await requireCurrentUser();
    const { groupId, userId } = await context.params;
    await assertGroupOwner(groupId, user.id);
    const input = await parseRequestBody(request, groupMemberRoleSchema);
    const membership = await updateGroupMemberRole({
      groupId,
      userId,
      role: input.role,
      changedByUserId: user.id,
    });
    return jsonOk({ membership });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ groupId: string; userId: string }> },
) {
  try {
    const user = await requireCurrentUser();
    const { groupId, userId } = await context.params;

    if (user.id === userId) {
      await assertGroupMember(groupId, user.id);
    } else {
      const actorMembership = await assertGroupAdmin(groupId, user.id);
      const targetMembership = await assertGroupMember(groupId, userId);

      if (targetMembership.role === "owner" && actorMembership.role !== "owner") {
        throw new ForbiddenError("Only an owner can remove another owner");
      }
    }

    await removeUserFromGroup({
      groupId,
      targetUserId: userId,
      removedByUserId: user.id,
    });

    return jsonOk({ message: "Member removed" });
  } catch (error) {
    return handleRouteError(error);
  }
}
