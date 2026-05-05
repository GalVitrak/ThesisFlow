"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { listActiveProjects } from "@/lib/services/projectService";
import { addSubmission, listMilestones, listSubmissions } from "@/lib/services/milestoneService";
import type { ActiveProject, Milestone, Submission } from "@/lib/types";

function SubmissionsInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const params = useSearchParams();
  const projectFilter = params.get("project") ?? "";

  const [subs, setSubs] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [formProject, setFormProject] = useState("");
  const [formMilestone, setFormMilestone] = useState("");
  const [formUrl, setFormUrl] = useState("/mock/upload.pdf");
  const [formType, setFormType] = useState("document");

  const load = useCallback(async () => {
    const allSubs = await listSubmissions(projectFilter || undefined);
    const projs = await listActiveProjects();
    setSubs(allSubs);
    setProjects(projs);
  }, [projectFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!formProject) {
      setMilestones([]);
      setFormMilestone("");
      return;
    }
    void listMilestones(formProject).then(setMilestones);
  }, [formProject]);

  const rows = useMemo(() => {
    let list = subs;
    if (user?.role === "student") {
      const ids = new Set(projects.filter((p) => p.studentId === user.id).map((p) => p.id));
      list = list.filter((s) => ids.has(s.projectId));
    }
    if (user?.role === "supervisor") {
      const ids = new Set(projects.filter((p) => p.supervisorId === user.id).map((p) => p.id));
      list = list.filter((s) => ids.has(s.projectId));
    }
    return list;
  }, [subs, projects, user]);

  if (!user) return null;

  const myProjects = user.role === "student" ? projects.filter((p) => p.studentId === user.id) : [];

  return (
    <AppShell title={t("submissions.title")} role={user.role}>
      {user.role === "student" && myProjects.length > 0 ? (
        <Card title={t("submissions.title")}>
          <Field label={t("project.title")}>
            <Select value={formProject} onChange={(e) => setFormProject(e.target.value)}>
              <option value="">—</option>
              {myProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("milestones.title")}>
            <Select value={formMilestone} onChange={(e) => setFormMilestone(e.target.value)}>
              <option value="">—</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {(locale === "he" ? m.titleHe : m.titleEn) + ` (${m.status})`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("submissions.type")}>
            <TextInput value={formType} onChange={(e) => setFormType(e.target.value)} />
          </Field>
          <Field label={t("submissions.file")}>
            <TextInput value={formUrl} onChange={(e) => setFormUrl(e.target.value)} />
          </Field>
          <Button
            variant="primary"
            size="sm"
            disabled={!formProject || !formMilestone}
            onClick={async () => {
              await addSubmission({
                projectId: formProject,
                milestoneId: formMilestone,
                type: formType,
                fileUrl: formUrl,
              });
              await load();
            }}
          >
            {t("common.save")}
          </Button>
        </Card>
      ) : null}

      <div style={{ height: 16 }} />

      <Table>
        <THead>
          <Tr>
            <Th>{t("project.title")}</Th>
            <Th>{t("submissions.type")}</Th>
            <Th>{t("submissions.submittedAt")}</Th>
            <Th>{t("proposals.status")}</Th>
            <Th>{t("submissions.file")}</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.map((s) => {
            const proj = projects.find((p) => p.id === s.projectId);
            return (
              <Tr key={s.id}>
                <Td>
                  {proj ? (
                    <Link href={`/${locale}/projects/${proj.id}`}>{proj.title}</Link>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td>{s.type}</Td>
                <Td>{new Date(s.submittedAt).toLocaleString(locale === "he" ? "he-IL" : "en-US")}</Td>
                <Td>
                  <StatusBadge value={s.status} />
                </Td>
                <Td>{s.fileUrl ?? "—"}</Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
      {rows.length === 0 ? <p style={{ marginTop: 12, color: "var(--color-muted)" }}>{t("common.empty")}</p> : null}
    </AppShell>
  );
}

export default function SubmissionsPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<p>…</p>}>
        <SubmissionsInner />
      </Suspense>
    </RequireAuth>
  );
}
