"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import type { DegreeType, Faculty, ProjectProposal, User } from "@/lib/types";
import { createProposal, listProposals } from "@/lib/services/projectService";
import { listFaculties } from "@/lib/services/adminSettingsService";
import { listUsers } from "@/lib/services/userService";

function ProposalsInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [facultyFilter, setFacultyFilter] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [degree, setDegree] = useState<DegreeType>("bachelor");
  const [facultyId, setFacultyId] = useState("");
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const load = useCallback(async () => {
    const [p, f, u] = await Promise.all([listProposals(), listFaculties(), listUsers()]);
    setProposals(p);
    setFaculties(f);
    setUsers(u);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (faculties.length > 0 && !facultyId) setFacultyId(faculties[0].id);
  }, [faculties, facultyId]);

  const rows = useMemo(() => {
    return proposals.filter((p) => {
      if (facultyFilter && p.facultyId !== facultyFilter) return false;
      return true;
    });
  }, [proposals, facultyFilter]);

  if (!user) return null;

  const canPublish = user.role === "supervisor" || user.role === "admin";

  return (
    <AppShell title={t("proposals.title")} role={user.role}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <Field label={t("proposals.faculty")}>
          <Select value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)}>
            <option value="">{t("common.all")}</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {locale === "he" ? f.nameHe : f.nameEn}
              </option>
            ))}
          </Select>
        </Field>
        {canPublish ? (
          <Button variant="primary" onClick={() => setOpenModal(true)}>
            {t("proposals.newProposal")}
          </Button>
        ) : null}
      </div>
      <Table>
        <THead>
          <Tr>
            <Th>{t("proposals.title")}</Th>
            <Th>{t("proposals.faculty")}</Th>
            <Th>{t("proposals.degree")}</Th>
            <Th>{t("proposals.supervisor")}</Th>
            <Th>{t("proposals.status")}</Th>
            <Th>{t("common.actions")}</Th>
          </Tr>
        </THead>
        <TBody>
          {rows.map((p) => {
            const sup = users.find((u) => u.id === p.supervisorId);
            const fac = faculties.find((f) => f.id === p.facultyId);
            return (
              <Tr key={p.id}>
                <Td>{p.title}</Td>
                <Td>{fac ? (locale === "he" ? fac.nameHe : fac.nameEn) : "—"}</Td>
                <Td>{t(`degree.${p.degreeType}` as "degree.bachelor")}</Td>
                <Td>{sup?.displayName ?? "—"}</Td>
                <Td>
                  <StatusBadge value={p.status} />
                </Td>
                <Td>
                  <Link href={`/${locale}/proposals/${p.id}`}>{t("common.view")}</Link>
                  {user.role === "student" && p.status === "open" ? (
                    <>
                      {" · "}
                      <Link href={`/${locale}/apply/${p.id}`}>{t("common.apply")}</Link>
                    </>
                  ) : null}
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>

      <Modal open={openModal} title={t("proposals.newProposal")} onClose={() => setOpenModal(false)}>
        <Field label={t("proposals.title")}>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t("proposalDetail.summary")}>
          <TextArea value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>
        <Field label={t("proposals.faculty")}>
          <Select value={facultyId} onChange={(e) => setFacultyId(e.target.value)}>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {locale === "he" ? f.nameHe : f.nameEn}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("proposals.degree")}>
          <Select value={degree} onChange={(e) => setDegree(e.target.value as DegreeType)}>
            <option value="bachelor">{t("degree.bachelor")}</option>
            <option value="master">{t("degree.master")}</option>
          </Select>
        </Field>
        <Button
          variant="primary"
          onClick={async () => {
            if (!user) return;
            await createProposal({
              facultyId,
              title,
              summary,
              supervisorId: user.role === "supervisor" ? user.id : users.find((u) => u.role === "supervisor")?.id ?? "",
              degreeType: degree,
              status: "open",
              capacity: 2,
              tags: [],
            });
            setOpenModal(false);
            setTitle("");
            setSummary("");
            await load();
          }}
        >
          {t("common.save")}
        </Button>
      </Modal>
    </AppShell>
  );
}

export default function ProposalsPage() {
  return (
    <RequireAuth>
      <ProposalsInner />
    </RequireAuth>
  );
}
