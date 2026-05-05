"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireRole } from "@/components/auth/RequireRole";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { listNotificationsForUser } from "@/lib/services/notificationService";
import { loadAdminMetrics } from "@/lib/dashboard/metrics";
import type { Notification } from "@/lib/types";

function Inner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [m, setM] = useState<Awaited<ReturnType<typeof loadAdminMetrics>> | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      setNotifs(await listNotificationsForUser(user.id));
      setM(await loadAdminMetrics());
    })();
  }, [user]);

  if (!user || !m) return null;

  return (
    <AppShell title={`${t("dashboard.welcome")}, ${user.displayName}`} role={user.role}>
      <p style={{ color: "var(--color-muted)", marginTop: 0 }}>{t("admin.title")}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-5)",
        }}
      >
        <Card title={t("admin.faculties")}>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.facultiesCount}</div>
        </Card>
        <Card title={t("proposals.title")}>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.proposalsCount}</div>
        </Card>
        <Card title={t("apply.title")}>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.applicationsCount}</div>
        </Card>
        <Card title={t("dashboard.stats.activeProjects")}>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.activeProjectsCount}</div>
        </Card>
        <Card title={t("dashboard.stats.defenses")}>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.defensesScheduled}</div>
        </Card>
      </div>

      <Card title={t("common.actions")}>
        <ul style={{ margin: 0, paddingInlineStart: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <Link href={`/${locale}/admin`}>{t("admin.title")}</Link>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Link href={`/${locale}/proposals`}>{t("nav.proposals")}</Link>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Link href={`/${locale}/reviews`}>{t("nav.reviews")}</Link>
          </li>
          <li>
            <Link href={`/${locale}/defense`}>{t("nav.defense")}</Link>
          </li>
        </ul>
      </Card>

      <div style={{ height: 16 }} />
      <Card title={t("dashboard.notifications")}>
        {notifs.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>{t("common.empty")}</p>
        ) : (
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            {notifs.slice(0, 5).map((n) => (
              <li key={n.id} style={{ marginBottom: 8 }}>
                <strong>{n.title}</strong> — {n.body}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireAuth>
      <RequireRole allow={["admin"]}>
        <Inner />
      </RequireRole>
    </RequireAuth>
  );
}
