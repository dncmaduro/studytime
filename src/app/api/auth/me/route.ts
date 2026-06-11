import { getCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/http";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return jsonOk({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
