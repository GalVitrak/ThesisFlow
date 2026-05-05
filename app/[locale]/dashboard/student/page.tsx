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
import { listNotificationsForUser } from "@/lib/services/notificationService";
import { loadStudentMetrics } from "@/lib/dashboard/metrics";
import type { Notification } from "@/lib/types";

function Inner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [m, setM] = useState<Awaited<ReturnType<typeof loadStudentMetrics>> | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      setNotifs(await listNotificationsForUser(user.id));
      setM(await loadStudentMetrics(user.id));
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
        <Link href={`/${locale}/proposals`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.openProposals")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.openProposalsCount}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/proposals`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.myApplications")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.applications.length}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/submissions`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.activeProjects")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.myProjects.length}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/defense`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.defenses")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.myDefenses.filter((d) => d.status === "scheduled").length}</div>
          </Card>
        </Link>
      </div>

      <Card title={t("apply.title")}>
        {m.applications.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>{t("common.empty")}</p>
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
                    <Link href={`/${locale}/proposals/${a.proposalId}`}>{a.proposalId}</Link>
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

      <div style={{ height: 16 }} />
      <Card title={t("project.title")}>
        {m.myProjects.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>{t("common.empty")}</p>
        ) : (
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            {m.myProjects.map((p) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <Link href={`/${locale}/projects/${p.id}`}>{p.title}</Link>
                {" · "}
                <Link href={`/${locale}/milestones/${p.id}`}>{t("project.milestones")}</Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div style={{ height: 16 }} />
      <Card title={t("submissions.title")}>
        {m.mySubmissions.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>{t("common.empty")}</p>
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

export default function StudentDashboardPage() {
  return (
    <RequireAuth>
      <RequireRole allow={["student"]}>
        <Inner />
      </RequireRole>
    </RequireAuth>
  );
}
