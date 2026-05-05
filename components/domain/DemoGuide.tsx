"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";
import styles from "./DemoGuide.module.css";

type DemoGuideProps = {
  locale: Locale;
};

export function DemoGuide({ locale }: DemoGuideProps) {
  const { t } = useI18n();
  const steps = [
    t("demoGuide.step1"),
    t("demoGuide.step2"),
    t("demoGuide.step3"),
    t("demoGuide.step4"),
    t("demoGuide.step5"),
  ];

  return (
    <Card title={t("demoGuide.title")}>
      <ol className={styles.list}>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className={styles.actions}>
        <Link href={`/${locale}/login`} className={styles.link}>
          {t("demoGuide.gotoLogin")}
        </Link>
        <Link href={`/${locale}/proposals`} className={styles.link}>
          {t("demoGuide.gotoProposals")}
        </Link>
      </div>
    </Card>
  );
}
