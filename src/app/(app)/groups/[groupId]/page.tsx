import Link from "next/link";

import { GroupDetailClient } from "@/components/forms/group-detail-client";
import { GlowCard } from "@/components/glow-card";
import { GradientButton } from "@/components/gradient-button";
import { assertGroupMember } from "@/lib/permissions";
import { getGroupDetails } from "@/lib/db/queries";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { requirePageUser } from "@/lib/auth";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const user = await requirePageUser();
  const { groupId } = await params;
  const membership = await assertGroupMember(groupId, user.id);
  const details = await getGroupDetails(groupId);
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <div className="space-y-6">
      <GlowCard className="p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs text-cyan-300/70">{m.sharedProgress}</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{details.group.name}</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              {details.group.description || m.noDescriptionYet}
            </p>
          </div>
          <GradientButton asChild variant="secondary">
            <Link href={`/groups/${groupId}/stats`}>{m.openGroupStats}</Link>
          </GradientButton>
        </div>
      </GlowCard>
      <GroupDetailClient
        currentUserId={user.id}
        group={{
          id: details.group.id,
          name: details.group.name,
          description: details.group.description,
        }}
        members={details.members}
        membership={{ userId: membership.userId, role: membership.role }}
      />
    </div>
  );
}
