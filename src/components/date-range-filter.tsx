"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function DateRangeFilter({
  from,
  to,
  preset,
}: {
  from: string;
  to: string;
  preset: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useI18n();

  function update(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }

    startTransition(() => {
      router.push(`?${next.toString()}`);
    });
  }

  return (
    <div className="glass-panel flex flex-col gap-3 rounded-3xl border border-white/10 p-4 md:flex-row md:items-end">
      <div className="w-full md:w-48">
        <label className="mb-2 block text-xs text-slate-500">{t("preset")}</label>
        <Select
          defaultValue={preset}
          disabled={isPending}
          onChange={(event) => update({ preset: event.target.value })}
        >
          <option value="today">{t("today")}</option>
          <option value="7d">{t("last7Days")}</option>
          <option value="month">{t("thisMonth")}</option>
          <option value="custom">{t("customRange")}</option>
        </Select>
      </div>
      <div className="w-full md:w-44">
        <label className="mb-2 block text-xs text-slate-500">{t("from")}</label>
        <Input
          type="date"
          defaultValue={from}
          disabled={preset !== "custom" || isPending}
          onBlur={(event) => update({ preset: "custom", from: event.target.value })}
        />
      </div>
      <div className="w-full md:w-44">
        <label className="mb-2 block text-xs text-slate-500">{t("to")}</label>
        <Input
          type="date"
          defaultValue={to}
          disabled={preset !== "custom" || isPending}
          onBlur={(event) => update({ preset: "custom", to: event.target.value })}
        />
      </div>
      <Button
        variant="secondary"
        disabled={isPending}
        onClick={() => update({ preset: "today", from: "", to: "" })}
        type="button"
      >
        {t("reset")}
      </Button>
    </div>
  );
}
