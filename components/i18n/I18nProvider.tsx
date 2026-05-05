"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/getMessages";

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  t: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function lookup(messages: Messages, path: string): string {
  const parts = path.split(".");
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const t = useCallback((path: string) => lookup(messages, path), [messages]);
  const value = useMemo(
    () => ({
      locale,
      messages,
      t,
    }),
    [locale, messages, t],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}
