import { hashPassword } from "@/lib/password";
import { env } from "@/lib/env";
import { seedDevelopmentData } from "@/lib/db/queries";
import { BadRequestError } from "@/lib/errors";
import { handleRouteError, jsonOk } from "@/lib/http";

export async function POST() {
  try {
    if (env.NODE_ENV === "production") {
      throw new BadRequestError("Seed route is not available in production");
    }

    const result = await seedDevelopmentData({
      firstPasswordHash: await hashPassword("password123"),
      secondPasswordHash: await hashPassword("password123"),
    });

    return jsonOk({
      message: "Development data is ready",
      users: [
        { username: result.first.username, password: "password123" },
        { username: result.second.username, password: "password123" },
      ],
      group: result.group.name,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
