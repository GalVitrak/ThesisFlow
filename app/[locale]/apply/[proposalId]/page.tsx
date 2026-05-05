"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { submitApplication } from "@/lib/services/applicationService";
import { getProposal } from "@/lib/services/projectService";
import type { ProjectProposal } from "@/lib/types";

function ApplyInner() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const proposalId = String(params.proposalId);
  const [proposal, setProposal] = useState<ProjectProposal | null>(null);
  const [loading, setLoading] = useState(true);

  const [cvUrl, setCvUrl] = useState("/mock/cv.pdf");
  const [motivation, setMotivation] = useState("");
  const [grades, setGrades] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setProposal(await getProposal(proposalId));
      setLoading(false);
    })();
  }, [proposalId]);

  if (!user) return null;
  if (user.role !== "student") {
    return (
      <AppShell title={t("apply.title")} role={user.role}>
        <p>{t("common.error")}</p>
      </AppShell>
    );
  }
  if (loading) {
    return (
      <AppShell title={t("apply.title")} role={user.role}>
        <p>{t("common.loading")}</p>
      </AppShell>
    );
  }
  if (!proposal) {
    return (
      <AppShell title={t("apply.title")} role={user.role}>
        <p>{t("common.error")}</p>
        <Link href={`/${locale}/proposals`}>{t("common.back")}</Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("apply.title")} role={user.role}>
      <div style={{ marginBottom: 16 }}>
        <Link href={`/${locale}/proposals/${proposal.id}`}>{t("common.back")}</Link>
      </div>
      <Card title={proposal.title}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setOk(null);
            try {
              await submitApplication({
                proposalId: proposal.id,
                studentId: user.id,
                cvUrl,
                gradesSummary: `Motivation: ${motivation}\nGrades: ${grades}`,
              });
              setOk("המועמדות נשלחה בהצלחה.");
              router.replace(`/${locale}/proposals`);
            } catch {
              setError(t("common.error"));
            }
          }}
        >
          <Field label="מוטיבציה קצרה">
            <TextArea value={motivation} onChange={(e) => setMotivation(e.target.value)} required />
          </Field>
          <Field label={t("apply.cv")}>
            <TextInput value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} />
          </Field>
          <Field label={t("apply.grades")}>
            <TextArea value={grades} onChange={(e) => setGrades(e.target.value)} required />
          </Field>
          {error ? <p style={{ color: "var(--color-danger)" }}>{error}</p> : null}
          {ok ? <p style={{ color: "var(--color-success)" }}>{ok}</p> : null}
          <Button type="submit" variant="primary">
            {t("apply.submit")}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}

export default function ApplyPage() {
  return (
    <RequireAuth>
      <ApplyInner />
    </RequireAuth>
  );
}
