"use client";

import { I18nProvider } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n";
import { Toaster } from "sonner";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          className:
            "!border-white/10 !bg-slate-900/90 !text-slate-100 !backdrop-blur-xl",
        }}
      />
    </I18nProvider>
  );
}
