"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useI18n } from "@/components/i18n/I18nProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { locale, t } = useI18n();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/${locale}/login?next=${encodeURIComponent(pathname)}`);
  }, [user, loading, router, locale, pathname]);

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }
  if (!user) return null;
  return <>{children}</>;
}
