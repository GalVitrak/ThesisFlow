"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { Button } from "@/components/ui/Button";
import { getProposal } from "@/lib/services/projectService";
import { listFaculties } from "@/lib/services/adminSettingsService";
import { listUsers } from "@/lib/services/userService";
import type { Faculty, ProjectProposal, User } from "@/lib/types";

function ProposalDetailInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const [p, setP] = useState<ProjectProposal | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [prop, f, u] = await Promise.all([getProposal(id), listFaculties(), listUsers()]);
      setP(prop);
      setFaculties(f);
      setUsers(u);
      setLoading(false);
    })();
  }, [id]);

  const sup = p ? users.find((u) => u.id === p.supervisorId) : null;
  const fac = p ? faculties.find((f) => f.id === p.facultyId) : null;

  if (!user) return null;
  if (loading) {
    return (
      <AppShell title={t("proposals.title")} role={user.role}>
        <p>{t("common.loading")}</p>
      </AppShell>
    );
  }
  if (!p) {
    return (
      <AppShell title={t("proposals.title")} role={user.role}>
        <p>{t("common.error")}</p>
        <Link href={`/${locale}/proposals`}>{t("common.back")}</Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={p.title} role={user.role}>
      <div style={{ marginBottom: 16 }}>
        <Link href={`/${locale}/proposals`}>{t("common.back")}</Link>
      </div>
      <Card title={t("proposalDetail.summary")}>
        <p>{p.summary}</p>
        <p style={{ color: "var(--color-muted)" }}>
          {t("proposals.faculty")}: {fac ? (locale === "he" ? fac.nameHe : fac.nameEn) : "—"}
        </p>
        <p style={{ color: "var(--color-muted)" }}>
          {t("proposals.supervisor")}: {sup?.displayName}
        </p>
        <p style={{ color: "var(--color-muted)" }}>
          {t("proposalDetail.capacity")}: {p.capacity}
        </p>
        <p>
          <StatusBadge value={p.status} />
        </p>
        <p>
          {t("proposalDetail.tags")}: {p.tags.join(", ")}
        </p>
        {user.role === "student" && p.status === "open" ? (
          <Button variant="primary" onClick={() => router.push(`/${locale}/apply/${p.id}`)}>
            {t("common.apply")}
          </Button>
        ) : null}
      </Card>
    </AppShell>
  );
}

export default function ProposalDetailPage() {
  return (
    <RequireAuth>
      <ProposalDetailInner />
    </RequireAuth>
  );
}
