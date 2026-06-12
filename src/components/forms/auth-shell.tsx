"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { GlowCard } from "@/components/glow-card";

export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden items-end rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/15 via-slate-950/60 to-cyan-500/10 p-10 lg:flex">
          <div>
            <p className="text-xs text-cyan-300/70">{t("brandName")}</p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight text-white">
              {t("authHeroTitle")}
            </h1>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{t("authChipLiveTimers")}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{t("authChipPrivateGroups")}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{t("authChipDailyInsights")}</span>
            </div>
          </div>
        </div>
        <GlowCard className="mx-auto w-full max-w-xl">
          <p className="text-xs text-violet-300/80">{t("authAccess")}</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-sm text-slate-400">{footer}</div> : null}
          <div className="mt-8 text-center text-sm text-slate-500">
            <Link className="transition hover:text-white" href="/">
              {t("returnToApp")}
            </Link>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
