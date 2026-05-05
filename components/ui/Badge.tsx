import styles from "./Badge.module.css";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  const toneClass =
    tone === "success"
      ? styles.success
      : tone === "warning"
        ? styles.warning
        : tone === "danger"
          ? styles.danger
          : tone === "info"
            ? styles.info
            : styles.neutral;
  return <span className={`${styles.badge} ${toneClass}`}>{children}</span>;
}
