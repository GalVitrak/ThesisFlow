"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/components/i18n/I18nProvider";

function RedirectDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { locale, t } = useI18n();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(`/${locale}/dashboard/${user.role}`);
  }, [loading, user, router, locale]);

  if (loading) return <p style={{ padding: 24 }}>{t("common.loading")}</p>;
  return <p style={{ padding: 24 }}>{t("common.loading")}</p>;
}

export default function DashboardIndexPage() {
  return (
    <RequireAuth>
      <RedirectDashboard />
    </RequireAuth>
  );
}
