import { EmptyState } from "@/components/empty-state";
import { GlowCard } from "@/components/glow-card";
import { SessionTable } from "@/components/session-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getStudyHistory } from "@/lib/db/queries";
import { getMessages, statusLabel } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { requirePageUser } from "@/lib/auth";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}) {
  const user = await requirePageUser();
  const params = await searchParams;
  const locale = await getServerLocale();
  const m = getMessages(locale);
  const sessions = await getStudyHistory({
    userId: user.id,
    from: params.from,
    to: params.to,
    status: params.status as never,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{m.historyTitle}</h1>
        <p className="mt-2 text-slate-400">{m.historyDescription}</p>
      </div>
      <GlowCard>
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <Input defaultValue={params.from} name="from" type="date" />
          <Input defaultValue={params.to} name="to" type="date" />
          <Select defaultValue={params.status ?? ""} name="status">
            <option value="">{m.allStatuses}</option>
            <option value="active">{statusLabel(locale, "active")}</option>
            <option value="completed">{statusLabel(locale, "completed")}</option>
            <option value="auto_closed">{statusLabel(locale, "auto_closed")}</option>
            <option value="cancelled">{statusLabel(locale, "cancelled")}</option>
            <option value="needs_review">{statusLabel(locale, "needs_review")}</option>
          </Select>
          <Button type="submit" variant="secondary">
            {m.filter}
          </Button>
        </form>
      </GlowCard>
      {sessions.length ? (
        <SessionTable sessions={sessions} showEdit />
      ) : (
        <EmptyState
          description={m.noSessionsMatched}
          title={m.nothingToShow}
        />
      )}
    </div>
  );
}
