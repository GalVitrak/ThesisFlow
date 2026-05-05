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
import { MilestoneTimeline } from "@/components/domain/MilestoneTimeline";
import { DemoGuide } from "@/components/domain/DemoGuide";
import { listNotificationsForUser } from "@/lib/services/notificationService";
import { listMilestones } from "@/lib/services/milestoneService";
import { loadStudentMetrics } from "@/lib/dashboard/metrics";
import type { Milestone, Notification } from "@/lib/types";
import styles from "./student-dashboard.module.css";

function Inner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [m, setM] = useState<Awaited<ReturnType<typeof loadStudentMetrics>> | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      setNotifs(await listNotificationsForUser(user.id));
      const metrics = await loadStudentMetrics(user.id);
      setM(metrics);
      const activeProject = metrics.myProjects[0];
      setMilestones(activeProject ? await listMilestones(activeProject.id) : []);
    })();
  }, [user]);

  if (!user || !m) return null;
  const pendingDeadlines = milestones
    .filter((x) => x.status !== "approved")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  return (
    <AppShell title={`${t("dashboard.welcome")}, ${user.displayName}`} role={user.role}>
      <div className={styles.metrics}>
        <Link href={`/${locale}/proposals`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.openProposals")}>
            <div className={styles.metricValue}>{m.openProposalsCount}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/proposals`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.myApplications")}>
            <div className={styles.metricValue}>{m.applications.length}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/submissions`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.activeProjects")}>
            <div className={styles.metricValue}>{m.myProjects.length}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/defense`} className={styles.metricLink}>
          <Card title={t("dashboard.stats.defenses")}>
            <div className={styles.metricValue}>{m.myDefenses.filter((d) => d.status === "scheduled").length}</div>
          </Card>
        </Link>
      </div>

      <Card title="יש לך משימה פתוחה">
        <div className={styles.taskRow}>
          <p className={styles.taskText}>יש לך משימה פתוחה: הגשת דו״ח התקדמות</p>
          <Link href={`/${locale}/submissions`} className={styles.primaryLink}>
            עבור להגשה
          </Link>
        </div>
      </Card>

      <div className={styles.spacer} />
      <Card title={t("apply.title")}>
        {m.applications.length === 0 ? (
          <p className={styles.emptyText}>טרם הוגשו מועמדויות. כדאי להתחיל מהצעות פתוחות.</p>
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>ID</Th>
                <Th>{t("proposals.status")}</Th>
              </Tr>
            </THead>
            <TBody>
              {m.applications.map((a) => (
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
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <div className={styles.spacer} />
      <Card title="פרויקט פעיל ואבני דרך">
        {m.myProjects.length === 0 ? (
          <p className={styles.emptyText}>אין עדיין פרויקט פעיל. אפשר להתחיל מהגשת מועמדות להצעה פתוחה.</p>
        ) : (
          <div className={styles.projectBlock}>
            {m.myProjects.map((p) => (
              <div key={p.id} className={styles.projectRow}>
                <Link href={`/${locale}/projects/${p.id}`} className={styles.primaryLink}>
                  {p.title}
                </Link>
                <Link href={`/${locale}/milestones/${p.id}`} className={styles.inlineLink}>
                  {t("project.milestones")}
                </Link>
              </div>
            ))}
            {milestones.length > 0 ? (
              <MilestoneTimeline
                milestones={milestones}
                locale={locale}
                currentOrder={m.myProjects[0]?.currentMilestoneOrder}
                actionLabel="עבור להגשה"
                onAction={() => {
                  window.location.href = `/${locale}/submissions`;
                }}
              />
            ) : null}
          </div>
        )}
      </Card>

      <div className={styles.spacer} />
      <Card title="דדליינים קרובים">
        {pendingDeadlines.length === 0 ? (
          <p className={styles.emptyText}>{t("common.empty")}</p>
        ) : (
          <ul className={styles.list}>
            {pendingDeadlines.map((item) => (
              <li key={item.id}>
                <strong>{locale === "he" ? item.titleHe : item.titleEn}</strong> ·{" "}
                {new Date(item.dueDate).toLocaleDateString(locale === "he" ? "he-IL" : "en-US")}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className={styles.spacer} />
      <Card title={t("submissions.title")}>
        {m.mySubmissions.length === 0 ? (
          <p className={styles.emptyText}>עדיין אין הגשות. אחרי אישור הצעת המחקר, יש להגיש דו״ח התקדמות.</p>
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>{t("submissions.type")}</Th>
                <Th>{t("proposals.status")}</Th>
              </Tr>
            </THead>
            <TBody>
              {m.mySubmissions.slice(0, 8).map((s) => (
                <Tr key={s.id}>
                  <Td>{s.type}</Td>
                  <Td>
                    <StatusBadge value={s.status} />
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
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

export default function StudentDashboardPage() {
  return (
    <RequireAuth>
      <RequireRole allow={["student"]}>
        <Inner />
      </RequireRole>
    </RequireAuth>
  );
}
