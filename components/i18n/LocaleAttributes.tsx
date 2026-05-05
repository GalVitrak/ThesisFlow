"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

export function LocaleAttributes({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);
  return <>{children}</>;
}
