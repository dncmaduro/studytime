"use client";

import { createContext, useContext, useMemo, useState } from "react";

import {
  getMessages,
  localeCookieName,
  normalizeLocale,
  roleLabel,
  statusLabel,
  type Locale,
  type MessageKey,
  type Messages,
} from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
  statusText: (
    status: "active" | "completed" | "auto_closed" | "cancelled" | "needs_review",
  ) => string;
  roleText: (role: "owner" | "admin" | "member") => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const value = useMemo<I18nContextValue>(() => {
    const currentMessages = getMessages(locale);

    return {
      locale,
      messages: currentMessages,
      setLocale(nextLocale) {
        const normalized = normalizeLocale(nextLocale);
        document.cookie = `${localeCookieName}=${normalized}; path=/; max-age=31536000; samesite=lax`;
        setLocaleState(normalized);
      },
      t(key) {
        return currentMessages[key];
      },
      statusText(status) {
        return statusLabel(locale, status);
      },
      roleText(role) {
        return roleLabel(locale, role);
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
