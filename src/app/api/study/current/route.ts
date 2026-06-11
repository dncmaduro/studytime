import { requireCurrentUser } from "@/lib/auth";
import { getActiveStudySession } from "@/lib/db/queries";
import { handleRouteError, jsonOk } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const activeSession = await getActiveStudySession(user.id);
    return jsonOk({ activeSession });
  } catch (error) {
    return handleRouteError(error);
  }
}
