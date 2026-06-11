import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

import { ApiError } from "@/lib/errors";

export async function parseRequestBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

export function jsonOk<T extends object>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, ...data }, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  console.error(error);
  return jsonError("Something went wrong", 500);
}
