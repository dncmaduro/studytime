import { and, eq, sql } from "drizzle-orm";

import { groupMembers } from "@/db/schema";
import { db } from "@/lib/db";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

export async function getGroupMembership(groupId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1);

  return membership ?? null;
}

export async function assertGroupMember(groupId: string, userId: string) {
  const membership = await getGroupMembership(groupId, userId);

  if (!membership) {
    throw new ForbiddenError("You are not a member of this group");
  }

  return membership;
}

export async function assertGroupAdmin(groupId: string, userId: string) {
  const membership = await assertGroupMember(groupId, userId);

  if (membership.role === "member") {
    throw new ForbiddenError("Only group owners or admins can do that");
  }

  return membership;
}

export async function assertGroupOwner(groupId: string, userId: string) {
  const membership = await assertGroupMember(groupId, userId);

  if (membership.role !== "owner") {
    throw new ForbiddenError("Only the group owner can do that");
  }

  return membership;
}

export async function assertSharedGroupAccess(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) {
    return;
  }

  const rows = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(groupMembers)
    .innerJoin(
      sql`group_members as gm2`,
      sql`gm2.group_id = ${groupMembers.groupId} and gm2.user_id = ${targetUserId}`,
    )
    .where(eq(groupMembers.userId, currentUserId));

  if ((rows[0]?.count ?? 0) === 0) {
    throw new ForbiddenError("You can only view stats for users in a shared group");
  }
}

export async function assertMembershipExists(groupId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  if (!result || result.count === 0) {
    throw new NotFoundError("Group not found");
  }
}
