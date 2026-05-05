"use client";

import { HitLogo } from "./HitLogo";
import { useI18n } from "@/components/i18n/I18nProvider";
import styles from "./BrandBlock.module.css";

/** Sidebar / drawer header: HIT + ThesisFlow + friendly taglines. */
export function BrandBlock({ variant = "onDark" }: { variant?: "onDark" | "onLight" }) {
  const { t } = useI18n();
  const dark = variant === "onDark";

  return (
    <div className={`${styles.block} ${dark ? styles.blockDark : styles.blockLight}`}>
      <div className={styles.topRow}>
        <HitLogo variant={variant} className={styles.logo} />
        <div className={styles.product}>
          <strong className={styles.productName}>{t("app.name")}</strong>
          <span className={styles.tagline}>{t("app.tagline")}</span>
        </div>
      </div>
      <p className={styles.partner}>{t("app.partnerLine")}</p>
    </div>
  );
}
