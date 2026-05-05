"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  createFaculty,
  getAdminSnapshot,
  updateFacultyName,
  updateGradingWeights,
  updateMilestoneTemplate,
  updateNotificationRules,
} from "@/lib/services/adminSettingsService";
import { listActiveProjects, updateActiveProjectFields } from "@/lib/services/projectService";
import { listUsers } from "@/lib/services/userService";
import { getEmailLog } from "@/lib/services/notificationService";
import type {
  ActiveProject,
  EmailLogEntry,
  GradingWeights,
  MilestoneTemplate,
  NotificationRules,
  User,
} from "@/lib/types";
import { weightsSum } from "@/lib/grading/computeFinalGrade";

function AdminInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [tab, setTab] = useState<"fac" | "tpl" | "w" | "n" | "em" | "proj">("fac");
  const [newFacHe, setNewFacHe] = useState("");
  const [newFacEn, setNewFacEn] = useState("");
  const [assignProjectId, setAssignProjectId] = useState("");
  const [exPick, setExPick] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof getAdminSnapshot>> | null>(null);
  const [emailLog, setEmailLog] = useState<EmailLogEntry[]>([]);
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [examiners, setExaminers] = useState<User[]>([]);

  useEffect(() => {
    void (async () => {
      setSnapshot(await getAdminSnapshot());
      setEmailLog(await getEmailLog());
    })();
  }, []);

  useEffect(() => {
    if (tab !== "proj") return;
    void (async () => {
      setProjects(await listActiveProjects());
      const users = await listUsers();
      setExaminers(users.filter((u) => u.role === "examiner"));
    })();
  }, [tab]);

  useEffect(() => {
    const p = projects.find((x) => x.id === assignProjectId);
    if (p) setExPick(p.examinerIds);
  }, [assignProjectId, projects]);

  if (!user) return null;
  if (user.role !== "admin") {
    return (
      <AppShell title={t("admin.title")} role={user.role}>
        <p>{t("common.error")}</p>
      </AppShell>
    );
  }

  if (!snapshot) return <AppShell title={t("admin.title")} role={user.role}><p>{t("common.loading")}</p></AppShell>;

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "fac", label: t("admin.faculties") },
    { id: "tpl", label: t("admin.templates") },
    { id: "w", label: t("admin.weights") },
    { id: "n", label: t("admin.notifications") },
    { id: "proj", label: t("defense.examiners") },
    { id: "em", label: t("admin.emailLog") },
  ];

  return (
    <AppShell title={t("admin.title")} role={user.role}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {tabs.map((x) => (
          <Button key={x.id} variant={tab === x.id ? "primary" : "secondary"} size="sm" onClick={() => setTab(x.id)}>
            {x.label}
          </Button>
        ))}
      </div>

      {tab === "fac" ? (
        <Card title={t("admin.faculties")}>
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
            <Field label="New (HE)">
              <TextInput value={newFacHe} onChange={(e) => setNewFacHe(e.target.value)} />
            </Field>
            <Field label="New (EN)">
              <TextInput value={newFacEn} onChange={(e) => setNewFacEn(e.target.value)} />
            </Field>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                if (!newFacHe || !newFacEn) return;
                await createFaculty({
                  nameHe: newFacHe,
                  nameEn: newFacEn,
                  degreeTypes: ["bachelor", "master"],
                });
                setNewFacHe("");
                setNewFacEn("");
                setSnapshot(await getAdminSnapshot());
              }}
            >
              Add faculty
            </Button>
          </div>
          {snapshot.faculties.map((f) => (
            <FacultyRow
              key={f.id}
              f={f}
              locale={locale}
              onSave={async (nameHe, nameEn) => {
                await updateFacultyName({ id: f.id, nameHe, nameEn });
                setSnapshot(await getAdminSnapshot());
              }}
            />
          ))}
        </Card>
      ) : null}

      {tab === "tpl" ? (
        <Card title={t("admin.templates")}>
          {snapshot.milestoneTemplates.map((tpl) => (
            <TemplateEditor
              key={tpl.id}
              tpl={tpl}
              onSave={async (next) => {
                await updateMilestoneTemplate(next);
                setSnapshot(await getAdminSnapshot());
              }}
            />
          ))}
        </Card>
      ) : null}

      {tab === "w" ? (
        <Card title={t("admin.weights")}>
          {snapshot.gradingWeights.map((g) => (
            <WeightsEditor
              key={g.id}
              g={g}
              onSave={async (next) => {
                await updateGradingWeights(next);
                setSnapshot(await getAdminSnapshot());
              }}
            />
          ))}
        </Card>
      ) : null}

      {tab === "n" ? (
        <Card title={t("admin.notifications")}>
          <RulesEditor
            rules={snapshot.notificationRules}
            onSave={async (r) => {
              await updateNotificationRules(r);
              setSnapshot(await getAdminSnapshot());
            }}
          />
        </Card>
      ) : null}

      {tab === "proj" ? (
        <Card title={t("defense.examiners")}>
          <Field label="Project">
            <Select
              value={assignProjectId}
              onChange={(e) => {
                const id = e.target.value;
                setAssignProjectId(id);
                const p = projects.find((x) => x.id === id);
                setExPick(p?.examinerIds ?? []);
              }}
            >
              <option value="">—</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>
          <div style={{ marginTop: 12 }}>
            {examiners.map((ex) => (
              <label key={ex.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={exPick.includes(ex.id)}
                  onChange={(e) => {
                    if (e.target.checked) setExPick([...exPick, ex.id]);
                    else setExPick(exPick.filter((id) => id !== ex.id));
                  }}
                />
                {ex.displayName}
              </label>
            ))}
          </div>
          <Button
            variant="primary"
            size="sm"
            disabled={!assignProjectId}
            onClick={async () => {
              await updateActiveProjectFields(assignProjectId, { examinerIds: exPick });
              setProjects(await listActiveProjects());
            }}
          >
            {t("common.save")}
          </Button>
        </Card>
      ) : null}

      {tab === "em" ? (
        <Card title={t("admin.emailLog")}>
          <Button variant="secondary" size="sm" onClick={() => void getEmailLog().then(setEmailLog)}>
            Refresh
          </Button>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {emailLog.map((e) => (
              <div key={e.id} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: 12 }}>
                <div>
                  <strong>{e.to}</strong> — {e.subject}
                </div>
                <div style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>{e.body}</div>
                <div style={{ fontSize: "0.75rem" }}>{e.createdAt}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}

function FacultyRow({
  f,
  locale,
  onSave,
}: {
  f: { id: string; nameHe: string; nameEn: string };
  locale: string;
  onSave: (he: string, en: string) => Promise<void>;
}) {
  const [nameHe, setNameHe] = useState(f.nameHe);
  const [nameEn, setNameEn] = useState(f.nameEn);
  return (
    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{locale === "he" ? f.nameHe : f.nameEn}</div>
      <Field label="HE">
        <TextInput value={nameHe} onChange={(e) => setNameHe(e.target.value)} />
      </Field>
      <Field label="EN">
        <TextInput value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      </Field>
      <Button variant="primary" size="sm" onClick={() => void onSave(nameHe, nameEn)}>
        Save
      </Button>
    </div>
  );
}

function TemplateEditor({
  tpl,
  onSave,
}: {
  tpl: MilestoneTemplate;
  onSave: (next: MilestoneTemplate) => Promise<void>;
}) {
  const [steps, setSteps] = useState(structuredClone(tpl.steps));
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{tpl.id}</div>
      {steps.map((s, idx) => (
        <div key={s.key} style={{ display: "grid", gap: 8, marginBottom: 8 }}>
          <Field label={`Step ${idx + 1} HE`}>
            <TextInput
              value={s.titleHe}
              onChange={(e) => {
                const next = structuredClone(steps);
                next[idx].titleHe = e.target.value;
                setSteps(next);
              }}
            />
          </Field>
          <Field label={`Step ${idx + 1} EN`}>
            <TextInput
              value={s.titleEn}
              onChange={(e) => {
                const next = structuredClone(steps);
                next[idx].titleEn = e.target.value;
                setSteps(next);
              }}
            />
          </Field>
        </div>
      ))}
      <Button variant="primary" size="sm" onClick={() => void onSave({ ...tpl, steps })}>
        Save
      </Button>
    </div>
  );
}

function WeightsEditor({
  g,
  onSave,
}: {
  g: GradingWeights;
  onSave: (next: GradingWeights) => Promise<void>;
}) {
  const [weights, setWeights] = useState({ ...g.weights });
  const sum = weightsSum(weights);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>
        {g.facultyId} / {g.degreeType} — sum: {sum.toFixed(2)}
      </div>
      {Object.keys(weights).map((k) => (
        <Field key={k} label={k}>
          <TextInput
            type="number"
            step="0.01"
            value={String(weights[k])}
            onChange={(e) => setWeights({ ...weights, [k]: Number(e.target.value) })}
          />
        </Field>
      ))}
      <Button variant="primary" size="sm" onClick={() => void onSave({ ...g, weights })}>
        Save
      </Button>
    </div>
  );
}

function RulesEditor({
  rules,
  onSave,
}: {
  rules: NotificationRules;
  onSave: (r: NotificationRules) => Promise<void>;
}) {
  const [r, setR] = useState({ ...rules });
  const keys = Object.keys(r) as (keyof NotificationRules)[];
  return (
    <div>
      {keys.map((k) => (
        <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={r[k]}
            onChange={(e) => setR({ ...r, [k]: e.target.checked })}
          />
          <span>{k}</span>
        </label>
      ))}
      <Button variant="primary" size="sm" onClick={() => void onSave(r)}>
        Save
      </Button>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth>
      <AdminInner />
    </RequireAuth>
  );
}
