import { requireCurrentUser } from "@/lib/auth";
import { checkoutActiveSession } from "@/lib/db/queries";
import { handleRouteError, jsonOk } from "@/lib/http";

export async function POST() {
  try {
    const user = await requireCurrentUser();
    const session = await checkoutActiveSession(user.id);
    return jsonOk({ session });
  } catch (error) {
    return handleRouteError(error);
  }
}
