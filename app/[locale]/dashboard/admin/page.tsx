"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireRole } from "@/components/auth/RequireRole";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { DemoGuide } from "@/components/domain/DemoGuide";
import { listNotificationsForUser } from "@/lib/services/notificationService";
import { loadAdminMetrics } from "@/lib/dashboard/metrics";
import type { Notification } from "@/lib/types";
import styles from "./admin-dashboard.module.css";

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
  const openProposalsCount = m.proposalsCount;
  const pendingSubmissionsCount = m.applicationsCount;

  return (
    <AppShell title={`${t("dashboard.welcome")}, ${user.displayName}`} role={user.role}>
      <p className={styles.subtitle}>{t("admin.title")}</p>
      <div className={styles.metrics}>
        <div className={styles.metricCard}>
          <Card title={t("admin.faculties")}>
            <div className={styles.metricValue}>{m.facultiesCount}</div>
          </Card>
        </div>
        <div className={styles.metricCard}>
          <Card title={t("dashboard.stats.openProposals")}>
            <div className={styles.metricValue}>{openProposalsCount}</div>
          </Card>
        </div>
        <div className={styles.metricCard}>
          <Card title={t("dashboard.pendingSubmissions")}>
            <div className={styles.metricValue}>{pendingSubmissionsCount}</div>
          </Card>
        </div>
        <div className={styles.metricCard}>
          <Card title={t("dashboard.stats.activeProjects")}>
            <div className={styles.metricValue}>{m.activeProjectsCount}</div>
          </Card>
        </div>
        <div className={styles.metricCard}>
          <Card title={t("dashboard.upcomingDefenses")}>
            <div className={styles.metricValue}>{m.defensesScheduled}</div>
          </Card>
        </div>
      </div>

      <Card title="פעולה מרכזית">
        <div className={styles.ctaRow}>
          <p className={styles.ctaText}>הגדר אבני דרך לפקולטה</p>
          <Link href={`/${locale}/admin`} className={styles.primaryLink}>
            מעבר לניהול
          </Link>
        </div>
      </Card>

      <div className={styles.spacer} />
      <Card title={t("common.actions")}>
        <ul className={styles.list}>
          <li>
            <Link href={`/${locale}/admin`} className={styles.inlineLink}>
              {t("admin.title")}
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/proposals`} className={styles.inlineLink}>
              {t("nav.proposals")}
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/reviews`} className={styles.inlineLink}>
              {t("nav.reviews")}
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/defense`} className={styles.inlineLink}>
              {t("nav.defense")}
            </Link>
          </li>
        </ul>
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

export default function AdminDashboardPage() {
  return (
    <RequireAuth>
      <RequireRole allow={["admin"]}>
        <Inner />
      </RequireRole>
    </RequireAuth>
  );
}
