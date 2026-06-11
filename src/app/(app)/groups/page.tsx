import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { GlowCard } from "@/components/glow-card";
import { GradientButton } from "@/components/gradient-button";
import { listGroupsForUser } from "@/lib/db/queries";
import { getMessages, roleLabel } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { requirePageUser } from "@/lib/auth";

export default async function GroupsPage() {
  const user = await requirePageUser();
  const groups = await listGroupsForUser(user.id);
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{m.yourGroups}</h1>
          <p className="mt-2 text-slate-400">{m.yourGroupsDescription}</p>
        </div>
        <GradientButton asChild>
          <Link href="/groups/new">{m.createGroup}</Link>
        </GradientButton>
      </div>
      {groups.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <GlowCard key={group.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{group.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">{group.description || "—"}</p>
                  <p className="mt-4 text-xs text-slate-500">
                    {group.member_count} {m.membersWithRole} · {m.role} {roleLabel(locale, group.my_role)}
                  </p>
                </div>
                <GradientButton asChild variant="secondary">
                  <Link href={`/groups/${group.id}`}>{m.open}</Link>
                </GradientButton>
              </div>
            </GlowCard>
          ))}
        </div>
      ) : (
        <EmptyState
          action={
            <GradientButton asChild>
              <Link href="/groups/new">{m.createFirstGroup}</Link>
            </GradientButton>
          }
          description={m.noGroupsYetDescription}
          title={m.noGroupsYet}
        />
      )}
    </div>
  );
}
