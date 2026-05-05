"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireRole } from "@/components/auth/RequireRole";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { DemoGuide } from "@/components/domain/DemoGuide";
import { listNotificationsForUser } from "@/lib/services/notificationService";
import { loadSupervisorMetrics } from "@/lib/dashboard/metrics";
import type { Notification } from "@/lib/types";
import styles from "./supervisor-dashboard.module.css";

function Inner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [m, setM] = useState<Awaited<ReturnType<typeof loadSupervisorMetrics>> | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      setNotifs(await listNotificationsForUser(user.id));
      setM(await loadSupervisorMetrics(user.id));
    })();
  }, [user]);

  if (!user || !m) return null;
  const pendingApplications = m.applications.filter((a) => a.status === "pending");

  return (
    <AppShell title={`${t("dashboard.welcome")}, ${user.displayName}`} role={user.role}>
      <div className={styles.metrics}>
        <Link href={`/${locale}/proposals`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.openProposals")}>
            <div className={styles.metricValue}>{m.openProposalsCount}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/reviews`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.pendingReviews")}>
            <div className={styles.metricValue}>{m.pendingReviewsCount}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/submissions`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.activeProjects")}>
            <div className={styles.metricValue}>{m.activeProjects.length}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/defense`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.defenses")}>
            <div className={styles.metricValue}>{m.defensesScheduled}</div>
          </Card>
        </Link>
      </div>

      <Card title="פעולה מרכזית">
        <div className={styles.ctaRow}>
          <p className={styles.ctaText}>סקור מועמדויות ממתינות</p>
          <Link href={`/${locale}/reviews`} className={styles.primaryLink}>
            מעבר לסקירה
          </Link>
        </div>
      </Card>

      <div className={styles.spacer} />
      <Card title={t("apply.title")}>
        <Table>
          <THead>
            <Tr>
              <Th>Proposal</Th>
              <Th>{t("proposals.status")}</Th>
            </Tr>
          </THead>
          <TBody>
            {pendingApplications.length === 0 ? (
              <Tr>
                <Td colSpan={2}>אין כרגע מועמדויות ממתינות.</Td>
              </Tr>
            ) : (
              pendingApplications.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <Link href={`/${locale}/proposals/${a.proposalId}`} className={styles.inlineLink}>
                      {a.proposalId}
                    </Link>
                  </Td>
                  <Td>
                    <StatusBadge value={a.status} />
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </Card>

      <div className={styles.spacer} />
      <Card title="פרויקטים פעילים בהנחיה">
        <ul className={styles.list}>
          {m.activeProjects.length === 0 ? (
            <li className={styles.emptyText}>{t("common.empty")}</li>
          ) : (
            m.activeProjects.map((p) => (
              <li key={p.id}>
                <Link href={`/${locale}/projects/${p.id}`} className={styles.inlineLink}>
                  {p.title}
                </Link>
              </li>
            ))
          )}
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

export default function SupervisorDashboardPage() {
  return (
    <RequireAuth>
      <RequireRole allow={["supervisor"]}>
        <Inner />
      </RequireRole>
    </RequireAuth>
  );
}
