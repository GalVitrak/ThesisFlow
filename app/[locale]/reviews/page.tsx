"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { listApplications } from "@/lib/services/applicationService";
import { listProposals, listActiveProjects } from "@/lib/services/projectService";
import { listSubmissions } from "@/lib/services/milestoneService";
import { updateApplicationStatus } from "@/lib/services/applicationService";
import { addReview } from "@/lib/services/reviewService";
import { getAdminSnapshot } from "@/lib/services/adminSettingsService";
import { listUsers } from "@/lib/services/userService";
import type {
  ActiveProject,
  Application,
  ApplicationStatus,
  ProjectProposal,
  ReviewDecision,
  Submission,
} from "@/lib/types";
import { computeFinalGrade } from "@/lib/grading/computeFinalGrade";

function ReviewsInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [scores, setScores] = useState("quality:85,methodology:88");
  const [applications, setApplications] = useState<Application[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [weightsLoaded, setWeightsLoaded] = useState<Awaited<ReturnType<typeof getAdminSnapshot>> | null>(null);
  const [users, setUsers] = useState<{ id: string; displayName: string }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [apps, subs, projs, props, snap, usr] = await Promise.all([
      listApplications(),
      listSubmissions(),
      listActiveProjects(),
      listProposals(),
      getAdminSnapshot(),
      listUsers(),
    ]);
    setApplications(apps);
    setSubmissions(subs);
    setProjects(projs);
    setProposals(props);
    setWeightsLoaded(snap);
    setUsers(usr.map((u) => ({ id: u.id, displayName: u.displayName })));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const appsView = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return applications;
    if (user.role === "supervisor") {
      const propIds = new Set(proposals.filter((p) => p.supervisorId === user.id).map((p) => p.id));
      return applications.filter((a) => propIds.has(a.proposalId));
    }
    return [];
  }, [applications, proposals, user]);

  const subsView = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return submissions;
    if (user.role === "supervisor") {
      const ids = new Set(projects.filter((p) => p.supervisorId === user.id).map((p) => p.id));
      return submissions.filter((s) => ids.has(s.projectId));
    }
    if (user.role === "examiner") {
      const ids = new Set(projects.filter((p) => p.examinerIds.includes(user.id)).map((p) => p.id));
      return submissions.filter((s) => ids.has(s.projectId));
    }
    return [];
  }, [submissions, projects, user]);

  if (!user) return null;
  if (user.role === "student") {
    return (
      <AppShell title={t("reviews.title")} role={user.role}>
        <p>{t("common.empty")}</p>
      </AppShell>
    );
  }

  function parseScores(raw: string): Record<string, number> {
    const out: Record<string, number> = {};
    raw.split(",").forEach((part) => {
      const [k, v] = part.split(":").map((s) => s.trim());
      if (k && v) out[k] = Number(v);
    });
    return out;
  }

  const gradePreview = (() => {
    const proj = projects[0];
    if (!proj || !weightsLoaded) return null;
    const w = weightsLoaded.gradingWeights.find(
      (g) => g.facultyId === proj.facultyId && g.degreeType === "bachelor",
    );
    if (!w) return null;
    const demoScores = { supervisor: 88, coordinator: 90, examiner1: 86, examiner2: 87, milestones: 92 };
    return computeFinalGrade(demoScores, w);
  })();

  return (
    <AppShell title={t("reviews.title")} role={user.role}>
      {feedback ? <p style={{ color: "var(--color-success)" }}>{feedback}</p> : null}
      {gradePreview != null ? (
        <p style={{ marginBottom: 16, color: "var(--color-muted)" }}>
          {locale === "he" ? "דוגמת חישוב ציון סופי (נתוני הדגמה): " : "Sample final grade (demo data): "}
          <strong>{gradePreview}</strong>
        </p>
      ) : null}

      <h2 style={{ fontSize: "1.1rem" }}>
        {t("nav.proposals")} — {t("apply.title")}
      </h2>
      <Table>
        <THead>
          <Tr>
            <Th>ID</Th>
            <Th>{t("proposals.status")}</Th>
            <Th>סטודנט</Th>
            <Th>פרויקט</Th>
            <Th>{t("reviews.comment")}</Th>
            <Th>{t("common.actions")}</Th>
          </Tr>
        </THead>
        <TBody>
          {appsView.map((a) => (
            <Tr key={a.id}>
              <Td>{a.id}</Td>
              <Td>
                <StatusBadge value={a.status} />
              </Td>
              <Td>{users.find((u) => u.id === a.studentId)?.displayName ?? a.studentId}</Td>
              <Td>{proposals.find((p) => p.id === a.proposalId)?.title ?? a.proposalId}</Td>
              <Td>{a.notes ?? "—"}</Td>
              <Td>
                {user.role === "supervisor" || user.role === "admin" ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(
                      [
                        ["approved", "אשר"],
                        ["rejected", "דחה"],
                        ["meeting_requested", "בקש פגישה"],
                      ] as const
                    ).map(([statusValue, label]) => (
                      <Button
                        key={statusValue}
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          await updateApplicationStatus(a.id, statusValue as ApplicationStatus);
                          setFeedback("סטטוס המועמדות עודכן ונשלחה התראה.");
                          await load();
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <h2 style={{ fontSize: "1.1rem", marginTop: 24 }}>{t("submissions.title")}</h2>
      <Field label={t("reviews.scores")}>
        <TextArea value={scores} onChange={(e) => setScores(e.target.value)} />
      </Field>
      <Field label={t("reviews.comment")}>
        <TextArea value={comment} onChange={(e) => setComment(e.target.value)} />
      </Field>
      <p style={{ fontSize: "0.9rem", color: "var(--color-muted)", marginBottom: 8 }}>
        {locale === "he"
          ? "טופס ציונים לדמו — בוחנים ומנחים יכולים לשלוח החלטה."
          : "Grading demo — supervisors and examiners can submit a decision."}
      </p>
      <Table>
        <THead>
          <Tr>
            <Th>ID</Th>
            <Th>{t("submissions.type")}</Th>
            <Th>{t("proposals.status")}</Th>
            <Th>{t("common.actions")}</Th>
          </Tr>
        </THead>
        <TBody>
          {subsView.map((s) => (
            <Tr key={s.id}>
              <Td>{s.id}</Td>
              <Td>{s.type}</Td>
              <Td>
                <StatusBadge value={s.status} />
              </Td>
              <Td>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(
                    [
                      ["approve", "approve"],
                      ["reject", "reject"],
                      ["needs_changes", "needs_changes"],
                    ] as const
                  ).map(([label, dec]) => (
                    <Button
                      key={dec}
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await addReview({
                          submissionId: s.id,
                          reviewerId: user.id,
                          role: user.role,
                          scores: parseScores(scores),
                          comment,
                          decision: dec as ReviewDecision,
                        });
                        setFeedback("הסקירה נשמרה בהצלחה.");
                        await load();
                      }}
                    >
                      {t(`reviews.decision`)}: {label}
                    </Button>
                  ))}
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </AppShell>
  );
}

export default function ReviewsPage() {
  return (
    <RequireAuth>
      <ReviewsInner />
    </RequireAuth>
  );
}
