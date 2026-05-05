"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrandBlock } from "@/components/branding/BrandBlock";
import { Card } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import loginStyles from "./login.module.css";
import {
  DEMO_SEED_PASSWORD,
  SEEDED_DEMO_ACCOUNTS,
  SEEDED_DEMO_EMAILS,
} from "@/lib/demoCredentials";
import { getDataSource } from "@/lib/services/dataSource";
import { listUsers } from "@/lib/services/userService";
import type { User } from "@/lib/types";

function LoginForm() {
  const { t, locale } = useI18n();
  const { signIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? `/${locale}/dashboard`;

  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState(DEMO_SEED_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  /** Extra demo users (e.g. mock @hit.ac.il) when listUsers succeeds; seeded @test.com rows always come from SEEDED_DEMO_ACCOUNTS. */
  const [extraDemos, setExtraDemos] = useState<User[]>([]);

  useEffect(() => {
    void listUsers()
      .then((all) =>
        setExtraDemos(all.filter((u) => !SEEDED_DEMO_EMAILS.has(u.email.toLowerCase()))),
      )
      .catch(() => setExtraDemos([]));
  }, []);

  return (
    <div className={loginStyles.page}>
      <div className={loginStyles.brandStrip}>
        <BrandBlock variant="onLight" />
      </div>
      <Card title={t("login.title")}>
        <p className={loginStyles.welcome}>{t("login.welcomeSubtitle")}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setInfo(null);
            const u = await signIn(email, password);
            if (!u) setError(t("common.error"));
            else router.replace(next);
          }}
        >
          <Field label={t("login.email")}>
            <TextInput value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </Field>
          <Field label={t("login.password")}>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          {error ? <p style={{ color: "var(--color-danger)" }}>{error}</p> : null}
          {info ? <p style={{ color: "var(--color-success)" }}>{info}</p> : null}
          <Button type="submit">{t("login.submit")}</Button>
        </form>
        <p style={{ marginTop: 16, color: "var(--color-muted)", fontSize: "0.9rem" }}>
          {getDataSource() === "firebase" ? t("login.hintFirebase") : t("login.hint")}
        </p>
        <div style={{ marginTop: 12 }}>
          <strong>{t("login.demoTitle")}</strong>
          <p style={{ margin: "8px 0", color: "var(--color-muted)" }}>Password: {DEMO_SEED_PASSWORD}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {[
              { label: "כניסה כסטודנט", email: "student@test.com" },
              { label: "כניסה כמנחה", email: "supervisor@test.com" },
              { label: "כניסה כאדמין", email: "admin@test.com" },
              { label: "כניסה כבוחן", email: "examiner@test.com" },
            ].map((item) => (
              <Button
                key={item.email}
                variant="secondary"
                size="sm"
                onClick={async () => {
                  setEmail(item.email);
                  setPassword(DEMO_SEED_PASSWORD);
                  setError(null);
                  setInfo(null);
                  const logged = await signIn(item.email, DEMO_SEED_PASSWORD);
                  if (!logged) {
                    setInfo("פרטי המשתמש מולאו. לחץ על כניסה להמשך.");
                    return;
                  }
                  router.replace(next);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <ul style={{ paddingInlineStart: 20, marginTop: 8 }}>
            {SEEDED_DEMO_ACCOUNTS.map((u) => (
              <li key={u.email}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--color-accent)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(DEMO_SEED_PASSWORD);
                  }}
                >
                  {u.displayName} — {u.email} ({t(`roles.${u.role}` as "roles.student")})
                </button>
              </li>
            ))}
            {extraDemos.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--color-accent)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(DEMO_SEED_PASSWORD);
                  }}
                >
                  {u.displayName} — {u.email} ({t(`roles.${u.role}` as "roles.student")})
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
