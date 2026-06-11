import { requireCurrentUser } from "@/lib/auth";
import { updateStudySession } from "@/lib/db/queries";
import { handleRouteError, jsonOk, parseRequestBody } from "@/lib/http";
import { sessionEditSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await requireCurrentUser();
    const { sessionId } = await context.params;
    const input = await parseRequestBody(request, sessionEditSchema);
    const session = await updateStudySession({
      sessionId,
      userId: user.id,
      ...input,
    });

    return jsonOk({ session });
  } catch (error) {
    return handleRouteError(error);
  }
}
