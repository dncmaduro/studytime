import { Sparkles } from "lucide-react";

import { GlowCard } from "@/components/glow-card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <GlowCard className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full border border-violet-400/25 bg-violet-500/10 p-4 text-violet-200">
        <Sparkles className="size-6" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </GlowCard>
  );
}
