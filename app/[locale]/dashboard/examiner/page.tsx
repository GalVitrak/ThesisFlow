"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireRole } from "@/components/auth/RequireRole";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { listNotificationsForUser } from "@/lib/services/notificationService";
import { loadExaminerMetrics } from "@/lib/dashboard/metrics";
import type { Notification } from "@/lib/types";

function Inner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [m, setM] = useState<Awaited<ReturnType<typeof loadExaminerMetrics>> | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      setNotifs(await listNotificationsForUser(user.id));
      setM(await loadExaminerMetrics(user.id));
    })();
  }, [user]);

  if (!user || !m) return null;

  return (
    <AppShell title={`${t("dashboard.welcome")}, ${user.displayName}`} role={user.role}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-5)",
        }}
      >
        <Link href={`/${locale}/reviews`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.pendingReviews")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.pendingReviewsCount}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/defense`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.defenses")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.assignedDefenses.length}</div>
          </Card>
        </Link>
      </div>

      <Card title={t("defense.title")}>
        {m.assignedDefenses.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>{t("common.empty")}</p>
        ) : (
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            {m.assignedDefenses.map((d) => (
              <li key={d.id} style={{ marginBottom: 8 }}>
                <Link href={`/${locale}/projects/${d.projectId}`}>{d.projectId}</Link>
                {" — "}
                <StatusBadge value={d.status} />
                {" — "}
                {new Date(d.scheduledAt).toLocaleString(locale === "he" ? "he-IL" : "en-US")}
              </li>
            ))}
          </ul>
        )}
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

export default function ExaminerDashboardPage() {
  return (
    <RequireAuth>
      <RequireRole allow={["examiner"]}>
        <Inner />
      </RequireRole>
    </RequireAuth>
  );
}
