"use client";

import type { Milestone } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import styles from "./MilestoneTimeline.module.css";

export function MilestoneTimeline({
  milestones,
  locale,
}: {
  milestones: Milestone[];
  locale: string;
}) {
  return (
    <ol className={styles.track}>
      {milestones.map((m, i) => {
        const extra =
          m.status === "approved"
            ? styles.dotDone
            : m.status === "submitted"
              ? styles.dotActive
              : m.status === "rejected"
                ? styles.dotDanger
                : "";
        return (
          <li key={m.id} className={styles.step}>
            <div className={styles.rail}>
              <span className={`${styles.dot} ${extra}`.trim()} aria-hidden />
              {i < milestones.length - 1 ? <span className={styles.line} /> : null}
            </div>
            <div className={styles.body}>
              <h3 className={styles.title}>
                {locale === "he" ? m.titleHe : m.titleEn}
              </h3>
              <p className={styles.meta}>
                {new Date(m.dueDate).toLocaleDateString(locale === "he" ? "he-IL" : "en-US")} ·{" "}
                <StatusBadge value={m.status} />
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
