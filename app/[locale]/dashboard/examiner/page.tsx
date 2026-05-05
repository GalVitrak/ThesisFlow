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
import { DemoGuide } from "@/components/domain/DemoGuide";
import { listNotificationsForUser } from "@/lib/services/notificationService";
import { loadExaminerMetrics } from "@/lib/dashboard/metrics";
import type { Notification } from "@/lib/types";
import styles from "./examiner-dashboard.module.css";

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
  const scheduledDefenses = m.assignedDefenses.filter((d) => d.status === "scheduled");
  const submittedReviewsCount = m.assignedDefenses.filter((d) => d.status !== "scheduled").length;

  return (
    <AppShell title={`${t("dashboard.welcome")}, ${user.displayName}`} role={user.role}>
      <div className={styles.metrics}>
        <Link href={`/${locale}/reviews`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.pendingReviews")}>
            <div className={styles.metricValue}>{m.pendingReviewsCount}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/defense`} className={styles.metricLink}>
          <Card title="Assigned defenses">
            <div className={styles.metricValue}>{scheduledDefenses.length}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/reviews`} className={styles.metricLink}>
          <Card title="Submitted reviews">
            <div className={styles.metricValue}>{submittedReviewsCount}</div>
          </Card>
        </Link>
      </div>

      <Card title="Assigned defenses">
        {m.assignedDefenses.length === 0 ? (
          <p className={styles.emptyText}>{t("common.empty")}</p>
        ) : (
          <ul className={styles.list}>
            {m.assignedDefenses.map((d) => (
              <li key={d.id}>
                <Link href={`/${locale}/projects/${d.projectId}`} className={styles.inlineLink}>
                  {d.projectId}
                </Link>
                {" — "}
                <StatusBadge value={d.status} />
                {" — "}
                {new Date(d.scheduledAt).toLocaleString(locale === "he" ? "he-IL" : "en-US")}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className={styles.spacer} />
      <Card title="Pending grading forms">
        {m.pendingReviewsCount === 0 ? (
          <p className={styles.emptyText}>אין טפסים ממתינים כרגע.</p>
        ) : (
          <p className={styles.emptyText}>קיימים {m.pendingReviewsCount} טפסים שממתינים למילוי.</p>
        )}
      </Card>

      <div className={styles.spacer} />
      <Card title={t("dashboard.notifications")}>
        {notifs.length === 0 ? (
          <p className={styles.emptyText}>{t("common.empty")}</p>
        ) : (
          <ul className={styles.list}>
            {notifs.slice(0, 5).map((n) => (
              <li key={n.id}>
                <strong>{n.title}</strong> — {n.body}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className={styles.spacer} />
      <DemoGuide locale={locale} />
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
