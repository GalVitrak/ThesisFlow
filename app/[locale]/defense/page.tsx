"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { listUsers } from "@/lib/services/userService";
import { listDefenseExams, scheduleDefense } from "@/lib/services/milestoneService";
import type { ActiveProject, DefenseExam, User } from "@/lib/types";

function DefenseInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [exams, setExams] = useState<DefenseExam[]>([]);
  const [projectId, setProjectId] = useState("");
  const [when, setWhen] = useState(() => new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 16));
  const [room, setRoom] = useState("חדר 305 / Zoom");
  const [ex1, setEx1] = useState("");
  const [ex2, setEx2] = useState("");

  const load = useCallback(async () => {
    const [p, u, e] = await Promise.all([listActiveProjects(), listUsers(), listDefenseExams()]);
    setProjects(p);
    setUsers(u);
    setExams(e);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (projects.length > 0 && !projectId) setProjectId(projects[0].id);
  }, [projects, projectId]);

  useEffect(() => {
    const ex = users.filter((x) => x.role === "examiner");
    if (ex.length > 0 && !ex1) setEx1(ex[0].id);
    if (ex.length > 1 && !ex2) setEx2(ex[1].id);
    else if (ex.length === 1 && !ex2) setEx2(ex[0].id);
  }, [users, ex1, ex2]);

  const examiners = users.filter((u) => u.role === "examiner");

  const examsView = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return exams;
    return exams.filter((d) => {
      const p = projects.find((x) => x.id === d.projectId);
      if (!p) return false;
      return (
        p.studentId === user.id || p.supervisorId === user.id || d.examinerIds.includes(user.id)
      );
    });
  }, [exams, projects, user]);

  if (!user) return null;

  return (
    <AppShell title={t("defense.title")} role={user.role}>
      {user.role === "admin" ? (
        <Card title={t("defense.schedule")}>
          <Field label="Project">
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("defense.datetime")}>
            <TextInput type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </Field>
          <Field label={t("defense.room")}>
            <TextInput value={room} onChange={(e) => setRoom(e.target.value)} />
          </Field>
          <Field label={`${t("defense.examiners")} A`}>
            <Select value={ex1} onChange={(e) => setEx1(e.target.value)}>
              {examiners.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={`${t("defense.examiners")} B`}>
            <Select value={ex2} onChange={(e) => setEx2(e.target.value)}>
              {examiners.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            variant="primary"
            onClick={async () => {
              await scheduleDefense({
                projectId,
                scheduledAt: new Date(when).toISOString(),
                roomOrLink: room,
                examinerIds: Array.from(new Set([ex1, ex2].filter(Boolean))),
              });
              setExams(await listDefenseExams());
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
            <Th>{t("defense.datetime")}</Th>
            <Th>{t("defense.room")}</Th>
            <Th>{t("proposals.status")}</Th>
          </Tr>
        </THead>
        <TBody>
          {examsView.map((d) => {
            const p = projects.find((x) => x.id === d.projectId);
            return (
              <Tr key={d.id}>
                <Td>
                  {p ? <Link href={`/${locale}/projects/${p.id}`}>{p.title}</Link> : "—"}
                </Td>
                <Td>{new Date(d.scheduledAt).toLocaleString(locale === "he" ? "he-IL" : "en-US")}</Td>
                <Td>{d.roomOrLink}</Td>
                <Td>
                  <StatusBadge value={d.status} />
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
    </AppShell>
  );
}

export default function DefensePage() {
  return (
    <RequireAuth>
      <DefenseInner />
    </RequireAuth>
  );
}
