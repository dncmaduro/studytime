import { requireCurrentUser } from "@/lib/auth";
import { getPersonalStats } from "@/lib/db/queries";
import { resolveDateRange } from "@/lib/dates";
import { handleRouteError, jsonOk } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser();
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange({
      preset: searchParams.get("preset"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });

    const stats = await getPersonalStats(user.id, range);
    return jsonOk(stats);
  } catch (error) {
    return handleRouteError(error);
  }
}
