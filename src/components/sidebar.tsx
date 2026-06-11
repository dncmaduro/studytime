"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, FolderKanban, LayoutDashboard, LockKeyhole } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const navItems = [
    { href: "/dashboard", label: t("navDashboard"), icon: LayoutDashboard },
    { href: "/history", label: t("navHistory"), icon: Clock3 },
    { href: "/stats/me", label: t("navMyStats"), icon: BarChart3 },
    { href: "/groups", label: t("navGroups"), icon: FolderKanban },
    { href: "/settings/password", label: t("navPassword"), icon: LockKeyhole },
  ];

  return (
    <aside className="glass-panel hidden w-72 shrink-0 rounded-[2rem] border border-white/10 p-6 lg:block">
      <div>
        <p className="text-xs text-cyan-300/70">{t("brandName")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">{t("sidebarTitle")}</h1>
        <p className="mt-2 text-sm text-slate-400">{t("sidebarDescription")}</p>
      </div>
      <nav className="mt-10 space-y-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
