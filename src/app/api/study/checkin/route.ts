import { requireCurrentUser } from "@/lib/auth";
import { createCheckin } from "@/lib/db/queries";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { checkinSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const input = await parseRequestBody(request, checkinSchema);
    const session = await createCheckin(user.id, input.note);
    return jsonOk({ session }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
