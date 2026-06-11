import { requireCurrentUser } from "@/lib/auth";
import { getGroupStats } from "@/lib/db/queries";
import { resolveDateRange } from "@/lib/dates";
import { handleRouteError, jsonOk } from "@/lib/http";
import { assertGroupMember } from "@/lib/permissions";

export async function GET(
  request: Request,
  context: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireCurrentUser();
    const { groupId } = await context.params;
    await assertGroupMember(groupId, user.id);

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange({
      preset: searchParams.get("preset"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });

    const stats = await getGroupStats(groupId, range);
    return jsonOk({ ...stats, range });
  } catch (error) {
    return handleRouteError(error);
  }
}
