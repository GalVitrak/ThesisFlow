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
import { loadSupervisorMetrics } from "@/lib/dashboard/metrics";
import type { Notification } from "@/lib/types";

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
        <Link href={`/${locale}/reviews`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.pendingReviews")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.pendingReviewsCount}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/submissions`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.activeProjects")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.activeProjects.length}</div>
          </Card>
        </Link>
        <Link href={`/${locale}/defense`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card title={t("dashboard.stats.defenses")}>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{m.defensesScheduled}</div>
          </Card>
        </Link>
      </div>

      <Card title={t("apply.title")}>
        <Table>
          <THead>
            <Tr>
              <Th>Proposal</Th>
              <Th>{t("proposals.status")}</Th>
            </Tr>
          </THead>
          <TBody>
            {m.applications.length === 0 ? (
              <Tr>
                <Td colSpan={2}>{t("common.empty")}</Td>
              </Tr>
            ) : (
              m.applications.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <Link href={`/${locale}/proposals/${a.proposalId}`}>{a.proposalId}</Link>
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

      <div style={{ height: 16 }} />
      <Card title={t("project.title")}>
        <ul style={{ margin: 0, paddingInlineStart: 20 }}>
          {m.activeProjects.length === 0 ? (
            <li style={{ color: "var(--color-muted)" }}>{t("common.empty")}</li>
          ) : (
            m.activeProjects.map((p) => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <Link href={`/${locale}/projects/${p.id}`}>{p.title}</Link>
              </li>
            ))
          )}
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

export default function SupervisorDashboardPage() {
  return (
    <RequireAuth>
      <RequireRole allow={["supervisor"]}>
        <Inner />
      </RequireRole>
    </RequireAuth>
  );
}
