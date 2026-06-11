import { Trophy, Users, Waves } from "lucide-react";

import { GroupComparisonChart } from "@/components/charts/group-comparison-chart";
import { DateRangeFilter } from "@/components/date-range-filter";
import { GlowCard } from "@/components/glow-card";
import { MemberStatsTable } from "@/components/member-stats-table";
import { StatCard } from "@/components/stat-card";
import { formatHours, resolveDateRange } from "@/lib/dates";
import { getGroupDetails, getGroupStats } from "@/lib/db/queries";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { assertGroupMember } from "@/lib/permissions";
import { requirePageUser } from "@/lib/auth";

export default async function GroupStatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const user = await requirePageUser();
  const { groupId } = await params;
  await assertGroupMember(groupId, user.id);
  const locale = await getServerLocale();
  const m = getMessages(locale);

  const search = await searchParams;
  const range = resolveDateRange(search);
  const stats = await getGroupStats(groupId, range);
  const details = await getGroupDetails(groupId);
  const totalSeconds = stats.members.reduce((sum, member) => sum + member.total_seconds, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{details.group.name} {m.groupStatsSuffix}</h1>
        <p className="mt-2 text-slate-400">{m.groupStatsDescription}</p>
      </div>
      <DateRangeFilter from={range.fromInput} preset={range.preset} to={range.toInput} />
      <section className="grid gap-6 md:grid-cols-3">
        <StatCard
          hint={m.selectedRangeHint}
          icon={Waves}
          label={m.totalTracked}
          value={formatHours(totalSeconds)}
        />
        <StatCard
          hint={m.usersInGroup}
          icon={Users}
          label={m.membersTitle}
          value={`${stats.members.length}`}
        />
        <StatCard
          hint={stats.members[0]?.display_name ?? m.noRankingYet}
          icon={Trophy}
          label={m.topRank}
          value={stats.members[0] ? formatHours(stats.members[0].total_seconds) : "0h"}
        />
      </section>
      <GroupComparisonChart rows={stats.comparisonRows} />
      <GlowCard>
        <h2 className="text-xl font-semibold text-white">{m.memberTable}</h2>
        <div className="mt-5">
          <MemberStatsTable members={stats.members} />
        </div>
      </GlowCard>
    </div>
  );
}
