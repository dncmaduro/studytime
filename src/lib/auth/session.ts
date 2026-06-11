import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { env, isProduction } from "@/lib/env";

export const SESSION_COOKIE_NAME = "study_session";

export type SessionPayload = {
  userId: string;
  username: string;
  role: "admin" | "member";
};

const secret = new TextEncoder().encode(env.AUTH_SECRET);

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string) {
  const result = await jwtVerify<SessionPayload>(token, secret);
  return result.payload;
}

export async function setSessionCookie(payload: SessionPayload) {
  const store = await cookies();
  const token = await signSession(payload);

  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function getSessionPayload() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}
