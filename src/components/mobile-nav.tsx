"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, FolderKanban, LayoutDashboard } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = [
    { href: "/dashboard", label: t("navHome"), icon: LayoutDashboard },
    { href: "/history", label: t("navHistory"), icon: Clock3 },
    { href: "/stats/me", label: t("navStats"), icon: BarChart3 },
    { href: "/groups", label: t("navGroups"), icon: FolderKanban },
  ];

  return (
    <nav className="glass-panel fixed inset-x-4 bottom-4 z-40 grid grid-cols-4 rounded-3xl border border-white/10 p-2 lg:hidden">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-medium",
              active ? "bg-white/10 text-white" : "text-slate-400",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
