import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { endOfDay, startOfDay } from "date-fns";

import {
  groupMembers,
  passwordResetTokens,
  studyEvents,
  studyGroups,
  studySessionEdits,
  studySessions,
  users,
  type GroupMemberRole,
  type SessionStatus,
} from "@/db/schema";
import { currentWeekRange, resolveDateRange, type ResolvedDateRange } from "@/lib/dates";
import { db, sqlClient } from "@/lib/db";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { hashToken, verifyPassword } from "@/lib/password";

const completedStatuses: SessionStatus[] = [
  "completed",
  "auto_closed",
  "needs_review",
];

const publicUserColumns = {
  id: users.id,
  username: users.username,
  email: users.email,
  displayName: users.displayName,
  role: users.role,
  isActive: users.isActive,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function findUserByIdentifier(identifier: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, identifier)))
    .limit(1);

  return user ?? null;
}

export async function findUserPublicById(userId: string) {
  const [user] = await db
    .select(publicUserColumns)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function createUserRecord(input: {
  username: string;
  email: string;
  displayName: string;
  passwordHash: string;
}) {
  try {
    const [user] = await db
      .insert(users)
      .values({
        username: input.username,
        email: input.email,
        displayName: input.displayName,
        passwordHash: input.passwordHash,
        passwordChangedAt: new Date(),
      })
      .returning(publicUserColumns);

    return user;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new BadRequestError("Username or email is already in use");
    }

    throw error;
  }
}

export async function createPasswordResetTokenRecord(userId: string) {
  const { token, tokenHash } = hashTokenRecord();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await db
    .insert(passwordResetTokens)
    .values({
      userId,
      tokenHash,
      expiresAt,
    })
    .onConflictDoNothing();

  return { token, expiresAt };
}

function hashTokenRecord() {
  const raw = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  return {
    token: raw,
    tokenHash: hashToken(raw),
  };
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const [record] = await db
    .select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
      expiresAt: passwordResetTokens.expiresAt,
      usedAt: passwordResetTokens.usedAt,
    })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new BadRequestError("Reset token is invalid or expired");
  }

  return record;
}

export async function markPasswordResetTokenUsed(tokenId: string) {
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenId));
}

export async function changeUserPassword(input: {
  userId: string;
  currentPassword: string;
  newPasswordHash: string;
}) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const passwordMatches = await verifyPassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new BadRequestError("Current password is incorrect");
  }

  await db
    .update(users)
    .set({
      passwordHash: input.newPasswordHash,
      passwordChangedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
}

export async function resetUserPassword(input: {
  userId: string;
  newPasswordHash: string;
  tokenId: string;
}) {
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash: input.newPasswordHash,
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));

    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, input.tokenId));
  });
}

export async function getActiveStudySession(userId: string) {
  const [session] = await db
    .select()
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        eq(studySessions.status, "active"),
        isNull(studySessions.checkoutAt),
      ),
    )
    .orderBy(desc(studySessions.checkinAt))
    .limit(1);

  return session ?? null;
}

export async function createCheckin(userId: string, note?: string) {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: studySessions.id })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          eq(studySessions.status, "active"),
          isNull(studySessions.checkoutAt),
        ),
      )
      .limit(1);

    if (existing) {
      throw new BadRequestError("You already have an active study session");
    }

    const [session] = await tx
      .insert(studySessions)
      .values({
        userId,
        checkinAt: new Date(),
        status: "active",
        note: note || null,
      })
      .returning();

    await tx.insert(studyEvents).values({
      userId,
      sessionId: session.id,
      eventType: "checkin",
      metadata: { note: note || null },
    });

    return session;
  });
}

export async function checkoutActiveSession(userId: string) {
  return db.transaction(async (tx) => {
    const [activeSession] = await tx
      .select()
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          eq(studySessions.status, "active"),
          isNull(studySessions.checkoutAt),
        ),
      )
      .limit(1);

    if (!activeSession) {
      throw new BadRequestError("No active study session found");
    }

    const checkoutAt = new Date();
    const durationSeconds = Math.max(
      0,
      Math.round((checkoutAt.getTime() - activeSession.checkinAt.getTime()) / 1000),
    );

    const [session] = await tx
      .update(studySessions)
      .set({
        checkoutAt,
        durationSeconds,
        status: "completed",
        updatedAt: checkoutAt,
      })
      .where(eq(studySessions.id, activeSession.id))
      .returning();

    await tx.insert(studyEvents).values({
      userId,
      sessionId: session.id,
      eventType: "checkout",
      metadata: { durationSeconds },
    });

    return session;
  });
}

export async function getDashboardData(userId: string) {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const weekRange = currentWeekRange();

  const [todaySummary] = await db
    .select({
      totalSeconds: sql<number>`coalesce(sum(${studySessions.durationSeconds}), 0)::int`,
    })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        inArray(studySessions.status, completedStatuses),
        gte(studySessions.checkinAt, todayStart),
        lte(studySessions.checkinAt, todayEnd),
      ),
    );

  const [weekSummary] = await db
    .select({
      totalSeconds: sql<number>`coalesce(sum(${studySessions.durationSeconds}), 0)::int`,
    })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        inArray(studySessions.status, completedStatuses),
        gte(studySessions.checkinAt, weekRange.from),
        lte(studySessions.checkinAt, weekRange.to),
      ),
    );

  const recentSessions = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(desc(studySessions.checkinAt))
    .limit(5);

  const activeSession = await getActiveStudySession(userId);

  return {
    todayTotalSeconds: todaySummary?.totalSeconds ?? 0,
    weekTotalSeconds: weekSummary?.totalSeconds ?? 0,
    recentSessions,
    activeSession,
  };
}

export async function getStudyHistory(input: {
  userId: string;
  from?: string;
  to?: string;
  status?: SessionStatus;
}) {
  const conditions = [eq(studySessions.userId, input.userId)];

  if (input.from) {
    conditions.push(gte(studySessions.checkinAt, new Date(`${input.from}T00:00:00+07:00`)));
  }

  if (input.to) {
    conditions.push(lte(studySessions.checkinAt, new Date(`${input.to}T23:59:59+07:00`)));
  }

  if (input.status) {
    conditions.push(eq(studySessions.status, input.status));
  }

  return db
    .select()
    .from(studySessions)
    .where(and(...conditions))
    .orderBy(desc(studySessions.checkinAt));
}

export async function getStudySessionForOwner(sessionId: string, userId: string) {
  const [session] = await db
    .select()
    .from(studySessions)
    .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId)))
    .limit(1);

  if (!session) {
    throw new NotFoundError("Study session not found");
  }

  return session;
}

export async function updateStudySession(input: {
  sessionId: string;
  userId: string;
  checkinAt: string;
  checkoutAt?: string | null;
  status: SessionStatus;
  note?: string | null;
  reason: string;
}) {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.id, input.sessionId), eq(studySessions.userId, input.userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundError("Study session not found");
    }

    const nextCheckinAt = new Date(input.checkinAt);
    const nextCheckoutAt = input.checkoutAt ? new Date(input.checkoutAt) : null;

    if (Number.isNaN(nextCheckinAt.getTime())) {
      throw new BadRequestError("Invalid check-in time");
    }

    if (nextCheckoutAt && Number.isNaN(nextCheckoutAt.getTime())) {
      throw new BadRequestError("Invalid checkout time");
    }

    if (!nextCheckoutAt && input.status === "completed") {
      throw new BadRequestError("Completed sessions require a checkout time");
    }

    const durationSeconds = nextCheckoutAt
      ? Math.max(
          0,
          Math.round((nextCheckoutAt.getTime() - nextCheckinAt.getTime()) / 1000),
        )
      : null;

    const [updated] = await tx
      .update(studySessions)
      .set({
        checkinAt: nextCheckinAt,
        checkoutAt: nextCheckoutAt,
        durationSeconds,
        status: nextCheckoutAt ? input.status : input.status === "cancelled" ? "cancelled" : "active",
        note: input.note || null,
        updatedAt: new Date(),
      })
      .where(eq(studySessions.id, existing.id))
      .returning();

    await tx.insert(studySessionEdits).values({
      sessionId: existing.id,
      editedByUserId: input.userId,
      oldCheckinAt: existing.checkinAt,
      oldCheckoutAt: existing.checkoutAt,
      oldDurationSeconds: existing.durationSeconds,
      oldStatus: existing.status,
      newCheckinAt: updated.checkinAt,
      newCheckoutAt: updated.checkoutAt,
      newDurationSeconds: updated.durationSeconds,
      newStatus: updated.status,
      reason: input.reason,
    });

    await tx.insert(studyEvents).values({
      userId: input.userId,
      sessionId: existing.id,
      eventType: "manual_edit",
      metadata: { reason: input.reason },
    });

    return updated;
  });
}

export async function getPersonalStats(
  userId: string,
  range: ResolvedDateRange,
) {
  const fromIso = range.from.toISOString();
  const toIso = range.to.toISOString();

  const summaryRows = await sqlClient<{
    total_seconds: number;
    total_sessions: number;
    average_seconds: number;
  }[]>`
    select
      coalesce(sum(duration_seconds), 0)::int as total_seconds,
      count(*)::int as total_sessions,
      coalesce(avg(duration_seconds), 0)::int as average_seconds
    from study_sessions
    where user_id = ${userId}
      and checkout_at is not null
      and status = any(${completedStatuses})
      and checkin_at >= ${fromIso}
      and checkin_at <= ${toIso}
  `;

  const longestDayRows = await sqlClient<{
    day: string;
    total_seconds: number;
  }[]>`
    select
      (timezone('Asia/Bangkok', checkin_at))::date::text as day,
      coalesce(sum(duration_seconds), 0)::int as total_seconds
    from study_sessions
    where user_id = ${userId}
      and checkout_at is not null
      and status = any(${completedStatuses})
      and checkin_at >= ${fromIso}
      and checkin_at <= ${toIso}
    group by 1
    order by total_seconds desc
    limit 1
  `;

  const dailyRows = await sqlClient<{
    day: string;
    total_seconds: number;
    total_sessions: number;
  }[]>`
    select
      (timezone('Asia/Bangkok', checkin_at))::date::text as day,
      coalesce(sum(duration_seconds), 0)::int as total_seconds,
      count(*)::int as total_sessions
    from study_sessions
    where user_id = ${userId}
      and checkout_at is not null
      and status = any(${completedStatuses})
      and checkin_at >= ${fromIso}
      and checkin_at <= ${toIso}
    group by 1
    order by 1 asc
  `;

  const sessions = await db
    .select()
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        gte(studySessions.checkinAt, range.from),
        lte(studySessions.checkinAt, range.to),
      ),
    )
    .orderBy(desc(studySessions.checkinAt));

  return {
    range,
    summary: {
      totalSeconds: summaryRows[0]?.total_seconds ?? 0,
      totalSessions: summaryRows[0]?.total_sessions ?? 0,
      averageSeconds: summaryRows[0]?.average_seconds ?? 0,
      longestStudyDay: longestDayRows[0] ?? null,
    },
    dailyRows,
    sessions,
  };
}

export async function listGroupsForUser(userId: string) {
  return sqlClient<{
    id: string;
    name: string;
    description: string;
    created_at: string;
    member_count: number;
    my_role: GroupMemberRole;
  }[]>`
    select
      sg.id,
      sg.name,
      sg.description,
      sg.created_at,
      count(gm_all.id)::int as member_count,
      gm.role as my_role
    from study_groups sg
    inner join group_members gm on gm.group_id = sg.id and gm.user_id = ${userId}
    inner join group_members gm_all on gm_all.group_id = sg.id
    group by sg.id, gm.role
    order by sg.created_at desc
  `;
}

export async function createGroup(input: {
  userId: string;
  name: string;
  description?: string;
}) {
  return db.transaction(async (tx) => {
    const [group] = await tx
      .insert(studyGroups)
      .values({
        name: input.name,
        description: input.description || "",
        createdByUserId: input.userId,
      })
      .returning();

    await tx.insert(groupMembers).values({
      groupId: group.id,
      userId: input.userId,
      role: "owner",
    });

    await tx.insert(studyEvents).values({
      userId: input.userId,
      groupId: group.id,
      eventType: "group_create",
      metadata: {},
    });

    return group;
  });
}

export async function getGroupDetails(groupId: string) {
  const groupRows = await sqlClient<{
    id: string;
    name: string;
    description: string;
    created_by_user_id: string;
    created_at: string;
    updated_at: string;
  }[]>`
    select id, name, description, created_by_user_id, created_at, updated_at
    from study_groups
    where id = ${groupId}
    limit 1
  `;

  const group = groupRows[0];

  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const members = await sqlClient<{
    user_id: string;
    username: string;
    display_name: string;
    role: GroupMemberRole;
    joined_at: string;
  }[]>`
    select
      gm.user_id,
      u.username,
      u.display_name,
      gm.role,
      gm.joined_at
    from group_members gm
    inner join users u on u.id = gm.user_id
    where gm.group_id = ${groupId}
    order by
      case gm.role when 'owner' then 1 when 'admin' then 2 else 3 end,
      lower(u.display_name) asc
  `;

  return { group, members };
}

export async function updateGroupRecord(input: {
  groupId: string;
  name: string;
  description?: string;
}) {
  const [group] = await db
    .update(studyGroups)
    .set({
      name: input.name,
      description: input.description || "",
      updatedAt: new Date(),
    })
    .where(eq(studyGroups.id, input.groupId))
    .returning();

  if (!group) {
    throw new NotFoundError("Group not found");
  }

  return group;
}

export async function deleteGroupRecord(groupId: string) {
  const [group] = await db
    .delete(studyGroups)
    .where(eq(studyGroups.id, groupId))
    .returning();

  if (!group) {
    throw new NotFoundError("Group not found");
  }

  return group;
}

export async function addUserToGroup(input: {
  groupId: string;
  username: string;
  addedByUserId: string;
}) {
  const [user] = await db
    .select(publicUserColumns)
    .from(users)
    .where(eq(users.username, input.username))
    .limit(1);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const [existing] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, user.id)))
    .limit(1);

  if (existing) {
    throw new BadRequestError("User is already in this group");
  }

  const [membership] = await db
    .insert(groupMembers)
    .values({
      groupId: input.groupId,
      userId: user.id,
      role: "member",
    })
    .returning();

  await db.insert(studyEvents).values({
    userId: input.addedByUserId,
    groupId: input.groupId,
    eventType: "group_member_add",
    metadata: { targetUserId: user.id },
  });

  return { membership, user };
}

async function ownerCountForGroup(groupId: string) {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, "owner")));

  return row?.count ?? 0;
}

export async function updateGroupMemberRole(input: {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  changedByUserId: string;
}) {
  const [existing] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, input.userId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Group member not found");
  }

  if (existing.role === "owner" && input.role !== "owner") {
    const owners = await ownerCountForGroup(input.groupId);
    if (owners <= 1) {
      throw new BadRequestError("The group must keep at least one owner");
    }
  }

  const [membership] = await db
    .update(groupMembers)
    .set({ role: input.role })
    .where(eq(groupMembers.id, existing.id))
    .returning();

  await db.insert(studyEvents).values({
    userId: input.changedByUserId,
    groupId: input.groupId,
    eventType: "group_member_role_change",
    metadata: { targetUserId: input.userId, role: input.role },
  });

  return membership;
}

export async function removeUserFromGroup(input: {
  groupId: string;
  targetUserId: string;
  removedByUserId: string;
}) {
  const [existing] = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, input.groupId),
        eq(groupMembers.userId, input.targetUserId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Group member not found");
  }

  if (existing.role === "owner") {
    const owners = await ownerCountForGroup(input.groupId);
    if (owners <= 1) {
      throw new BadRequestError("The last owner cannot leave or be removed");
    }
  }

  await db.delete(groupMembers).where(eq(groupMembers.id, existing.id));

  await db.insert(studyEvents).values({
    userId: input.removedByUserId,
    groupId: input.groupId,
    eventType: "group_member_remove",
    metadata: { targetUserId: input.targetUserId },
  });
}

export async function getGroupStats(groupId: string, range: ResolvedDateRange) {
  const fromIso = range.from.toISOString();
  const toIso = range.to.toISOString();

  const memberRows = await sqlClient<{
    user_id: string;
    username: string;
    display_name: string;
    total_seconds: number;
    total_sessions: number;
    average_seconds: number;
    active_session: boolean;
  }[]>`
    select
      u.id as user_id,
      u.username,
      u.display_name,
      coalesce(sum(case when s.status in ('completed', 'auto_closed', 'needs_review') then s.duration_seconds else 0 end), 0)::int as total_seconds,
      count(s.id)::int as total_sessions,
      coalesce(avg(case when s.status in ('completed', 'auto_closed', 'needs_review') then s.duration_seconds end), 0)::int as average_seconds,
      exists(
        select 1
        from study_sessions active_s
        where active_s.user_id = u.id
          and active_s.status = 'active'
          and active_s.checkout_at is null
      ) as active_session
    from group_members gm
    inner join users u on u.id = gm.user_id
    left join study_sessions s on s.user_id = u.id
      and s.checkin_at >= ${fromIso}
      and s.checkin_at <= ${toIso}
      and s.checkout_at is not null
    where gm.group_id = ${groupId}
    group by u.id, u.username, u.display_name
    order by total_seconds desc, lower(u.display_name) asc
  `;

  const dailyRows = await sqlClient<{
    day: string;
    username: string;
    total_seconds: number;
  }[]>`
    select
      (timezone('Asia/Bangkok', s.checkin_at))::date::text as day,
      u.username,
      coalesce(sum(s.duration_seconds), 0)::int as total_seconds
    from group_members gm
    inner join users u on u.id = gm.user_id
    inner join study_sessions s on s.user_id = u.id
    where gm.group_id = ${groupId}
      and s.checkin_at >= ${fromIso}
      and s.checkin_at <= ${toIso}
      and s.checkout_at is not null
      and s.status in ('completed', 'auto_closed', 'needs_review')
    group by 1, 2
    order by 1 asc, 2 asc
  `;

  const comparisonMap = new Map<string, Record<string, string | number>>();
  for (const row of dailyRows) {
    const current = comparisonMap.get(row.day) ?? { day: row.day };
    current[row.username] = Number((row.total_seconds / 3600).toFixed(2));
    comparisonMap.set(row.day, current);
  }

  return {
    members: memberRows,
    comparisonRows: Array.from(comparisonMap.values()),
  };
}

export async function getLatestSharedUserStats(input: {
  currentUserId: string;
  targetUserId: string;
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}) {
  const range = resolveDateRange(input);
  return getPersonalStats(input.targetUserId, range);
}

export async function seedDevelopmentData(input: {
  firstPasswordHash: string;
  secondPasswordHash: string;
}) {
  const first =
    (await findUserByIdentifier("dung")) ??
    (await db
      .insert(users)
      .values({
        username: "dung",
        email: "dung@example.com",
        displayName: "Dung",
        passwordHash: input.firstPasswordHash,
        passwordChangedAt: new Date(),
      })
      .returning()
      .then((rows) => rows[0]));

  const second =
    (await findUserByIdentifier("lover")) ??
    (await db
      .insert(users)
      .values({
        username: "lover",
        email: "lover@example.com",
        displayName: "Lover",
        passwordHash: input.secondPasswordHash,
        passwordChangedAt: new Date(),
      })
      .returning()
      .then((rows) => rows[0]));

  const existingGroups = await listGroupsForUser(first.id);
  const group = existingGroups.find((item) => item.name === "Study Together");

  if (group) {
    return { first, second, group };
  }

  const createdGroup = await createGroup({
    userId: first.id,
    name: "Study Together",
    description: "Development seed group",
  });

  try {
    await addUserToGroup({
      groupId: createdGroup.id,
      username: "lover",
      addedByUserId: first.id,
    });
  } catch (error) {
    if (!(error instanceof BadRequestError)) {
      throw error;
    }
  }

  return { first, second, group: createdGroup };
}
