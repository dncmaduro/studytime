"use client";

import { useRouter } from "next/navigation";

import { useI18n } from "@/components/i18n-provider";
import { Select } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">{t("language")}</span>
      <Select
        aria-label={t("language")}
        className="h-10 w-36"
        onChange={(event) => switchLocale(event.target.value as Locale)}
        value={locale}
      >
        <option value="en">{t("english")}</option>
        <option value="vi">{t("vietnamese")}</option>
      </Select>
    </div>
  );
}
