import { Activity, Clock3, Timer, Waves } from "lucide-react";

import { DashboardSessionCard } from "@/components/forms/dashboard-session-card";
import { GlowCard } from "@/components/glow-card";
import { SessionTable } from "@/components/session-table";
import { StatCard } from "@/components/stat-card";
import { formatDurationShort, formatHours } from "@/lib/dates";
import { getDashboardData } from "@/lib/db/queries";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { requirePageUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requirePageUser();
  const dashboard = await getDashboardData(user.id);
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <GlowCard className="overflow-hidden p-8">
            <p className="text-xs text-violet-300/80">{m.dashboardEyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold text-white">
              {m.dashboardTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">{m.dashboardDescription}</p>
          </GlowCard>
          <DashboardSessionCard activeSession={dashboard.activeSession} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard
            hint={m.completedTimeTrackedToday}
            icon={Timer}
            label={m.todayTotal}
            value={formatHours(dashboard.todayTotalSeconds)}
          />
          <StatCard
            hint={m.currentIsoWeekTotal}
            icon={Clock3}
            label={m.weekTotal}
            value={formatHours(dashboard.weekTotalSeconds)}
          />
        <StatCard
          hint={dashboard.activeSession ? m.liveSessionInProgress : m.noActiveSession}
          icon={Activity}
          label={m.liveStatus}
          value={dashboard.activeSession ? m.active : m.idle}
        />
          <StatCard
            hint={m.recentSessionsInTimeline}
            icon={Waves}
            label={m.recentCount}
            value={`${dashboard.recentSessions.length}`}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{m.latestFiveSessions}</h2>
          <p className="text-sm text-slate-400">{m.serverCalculatedCheckoutDurations}</p>
        </div>
        <SessionTable sessions={dashboard.recentSessions} />
      </section>
    </div>
  );
}
