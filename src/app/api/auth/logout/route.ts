import { destroySession } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/http";

export async function POST() {
  try {
    await destroySession();
    return jsonOk({ message: "Logged out" });
  } catch (error) {
    return handleRouteError(error);
  }
}
