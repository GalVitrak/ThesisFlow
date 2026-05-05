"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { UserRole } from "@/lib/types";

export function RequireRole({
  allow,
  children,
}: {
  allow: UserRole[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { locale, t } = useI18n();

  useEffect(() => {
    if (loading || !user) return;
    if (!allow.includes(user.role)) {
      router.replace(`/${locale}/dashboard/${user.role}`);
    }
  }, [user, loading, allow, router, locale]);

  if (loading) return <p>{t("common.loading")}</p>;
  if (!user || !allow.includes(user.role)) return null;
  return <>{children}</>;
}
