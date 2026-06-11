import { EditSessionForm } from "@/components/forms/edit-session-form";
import { GlowCard } from "@/components/glow-card";
import { getStudySessionForOwner } from "@/lib/db/queries";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { requirePageUser } from "@/lib/auth";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePageUser();
  const { sessionId } = await params;
  const session = await getStudySessionForOwner(sessionId, user.id);
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{m.editSessionTitle}</h1>
        <p className="mt-2 text-slate-400">{m.editSessionDescription}</p>
      </div>
      <GlowCard>
        <EditSessionForm session={session} />
      </GlowCard>
    </div>
  );
}
