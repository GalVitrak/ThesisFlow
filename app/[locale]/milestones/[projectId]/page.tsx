"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { MilestoneTimeline } from "@/components/domain/MilestoneTimeline";
import { getActiveProject } from "@/lib/services/projectService";
import { listMilestones } from "@/lib/services/milestoneService";
import type { ActiveProject, Milestone } from "@/lib/types";

function MilestonesInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const params = useParams();
  const projectId = String(params.projectId);
  const [project, setProject] = useState<ActiveProject | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [proj, mil] = await Promise.all([getActiveProject(projectId), listMilestones(projectId)]);
      setProject(proj);
      setMilestones(mil);
      setLoading(false);
    })();
  }, [projectId]);

  if (!user) return null;
  if (loading) {
    return (
      <AppShell title={t("milestones.title")} role={user.role}>
        <p>{t("common.loading")}</p>
      </AppShell>
    );
  }
  if (!project) {
    return (
      <AppShell title={t("milestones.title")} role={user.role}>
        <p>{t("common.error")}</p>
        <Link href={`/${locale}/dashboard`}>{t("common.back")}</Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("milestones.title")} role={user.role}>
      <div style={{ marginBottom: 16 }}>
        <Link href={`/${locale}/projects/${project.id}`}>{t("common.back")}</Link>
      </div>
      <Card title={t("milestones.title")}>
        <MilestoneTimeline milestones={milestones} locale={locale} />
      </Card>
    </AppShell>
  );
}

export default function MilestonesPage() {
  return (
    <RequireAuth>
      <MilestonesInner />
    </RequireAuth>
  );
}
