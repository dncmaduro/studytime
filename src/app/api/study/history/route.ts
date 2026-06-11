import { requireCurrentUser } from "@/lib/auth";
import { getStudyHistory } from "@/lib/db/queries";
import { handleRouteError, jsonOk } from "@/lib/http";
import { historyQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser();
    const { searchParams } = new URL(request.url);
    const query = historyQuerySchema.parse({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    const sessions = await getStudyHistory({
      userId: user.id,
      ...query,
    });

    return jsonOk({ sessions });
  } catch (error) {
    return handleRouteError(error);
  }
}
