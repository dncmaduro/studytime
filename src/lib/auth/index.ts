import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { UnauthorizedError } from "@/lib/errors";
import { db } from "@/lib/db";
import {
  clearSessionCookie,
  getSessionPayload,
  setSessionCookie,
  type SessionPayload,
} from "@/lib/auth/session";

export async function createSessionForUser(payload: SessionPayload) {
  await setSessionCookie(payload);
}

export async function destroySession() {
  await clearSessionCookie();
}

export async function getSessionUser() {
  return getSessionPayload();
}

export async function getCurrentUser() {
  const session = await getSessionPayload();

  if (!session) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export async function requirePageUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
