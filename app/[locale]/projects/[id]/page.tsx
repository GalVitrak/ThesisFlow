"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { getActiveProject } from "@/lib/services/projectService";
import { listUsers } from "@/lib/services/userService";
import type { ActiveProject, User } from "@/lib/types";

function ProjectInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const params = useParams();
  const id = String(params.id);
  const [project, setProject] = useState<ActiveProject | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [proj, u] = await Promise.all([getActiveProject(id), listUsers()]);
      setProject(proj);
      setUsers(u);
      setLoading(false);
    })();
  }, [id]);

  const student = project ? users.find((u) => u.id === project.studentId) : null;
  const sup = project ? users.find((u) => u.id === project.supervisorId) : null;

  if (!user) return null;
  if (loading) {
    return (
      <AppShell title={t("project.title")} role={user.role}>
        <p>{t("common.loading")}</p>
      </AppShell>
    );
  }
  if (!project) {
    return (
      <AppShell title={t("project.title")} role={user.role}>
        <p>{t("common.error")}</p>
        <Link href={`/${locale}/dashboard`}>{t("common.back")}</Link>
      </AppShell>
    );
  }

  const allowed =
    user.role === "admin" ||
    user.id === project.studentId ||
    user.id === project.supervisorId ||
    project.examinerIds.includes(user.id);

  if (!allowed) {
    return (
      <AppShell title={t("project.title")} role={user.role}>
        <p>{t("common.error")}</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={project.title} role={user.role}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Link href={`/${locale}/milestones/${project.id}`}>{t("project.milestones")}</Link>
        <span>·</span>
        <Link href={`/${locale}/submissions?project=${project.id}`}>{t("project.submissions")}</Link>
      </div>
      <Card title={t("project.title")}>
        <p>
          <StatusBadge value={project.status} />
        </p>
        <p>
          {t("project.student")}: {student?.displayName}
        </p>
        <p>
          {t("proposals.supervisor")}: {sup?.displayName}
        </p>
      </Card>
    </AppShell>
  );
}

export default function ProjectPage() {
  return (
    <RequireAuth>
      <ProjectInner />
    </RequireAuth>
  );
}
