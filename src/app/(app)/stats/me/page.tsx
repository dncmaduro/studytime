import { BarChart3, CalendarRange, Flame, Sigma } from "lucide-react";

import { DailyStudyChart } from "@/components/charts/daily-study-chart";
import { DateRangeFilter } from "@/components/date-range-filter";
import { GlowCard } from "@/components/glow-card";
import { SessionTable } from "@/components/session-table";
import { StatCard } from "@/components/stat-card";
import { formatDurationShort, formatHours, resolveDateRange } from "@/lib/dates";
import { getPersonalStats } from "@/lib/db/queries";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { requirePageUser } from "@/lib/auth";

export default async function MyStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const user = await requirePageUser();
  const params = await searchParams;
  const locale = await getServerLocale();
  const m = getMessages(locale);
  const range = resolveDateRange(params);
  const stats = await getPersonalStats(user.id, range);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{m.myStatsTitle}</h1>
          <p className="mt-2 text-slate-400">{m.myStatsDescription}</p>
        </div>
      </div>
      <DateRangeFilter
        from={range.fromInput}
        preset={range.preset}
        to={range.toInput}
      />
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          hint={m.selectedRangeHint}
          icon={Sigma}
          label={m.totalHours}
          value={formatHours(stats.summary.totalSeconds)}
        />
        <StatCard
          hint={m.completedSessionsHint}
          icon={CalendarRange}
          label={m.totalSessions}
          value={`${stats.summary.totalSessions}`}
        />
        <StatCard
          hint={m.typicalStudyBlock}
          icon={BarChart3}
          label={m.averageSession}
          value={formatDurationShort(stats.summary.averageSeconds)}
        />
        <StatCard
          hint={stats.summary.longestStudyDay?.day ?? m.noData}
          icon={Flame}
          label={m.longestDay}
          value={formatHours(stats.summary.longestStudyDay?.total_seconds ?? 0)}
        />
      </section>
      <DailyStudyChart rows={stats.dailyRows} />
      <GlowCard>
        <h2 className="text-xl font-semibold text-white">{m.sessionsInRange}</h2>
        <div className="mt-5">
          <SessionTable sessions={stats.sessions} />
        </div>
      </GlowCard>
    </div>
  );
}
