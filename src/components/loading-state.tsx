import { getServerLocale } from "@/lib/i18n-server";

export async function LoadingState({ label }: { label?: string }) {
  const locale = await getServerLocale();
  const resolvedLabel = label ?? (locale === "vi" ? "Đang tải..." : "Loading...");

  return (
    <div className="glass-panel flex min-h-[240px] items-center justify-center rounded-3xl border border-white/10">
      <div className="flex items-center gap-3 text-slate-300">
        <div className="size-3 animate-pulse rounded-full bg-cyan-400" />
        <span>{resolvedLabel}</span>
      </div>
    </div>
  );
}
