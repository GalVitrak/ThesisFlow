"use client";

import type { Milestone } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "./StatusBadge";
import styles from "./MilestoneTimeline.module.css";

export function MilestoneTimeline({
  milestones,
  locale,
  currentOrder,
  actionLabel,
  onAction,
}: {
  milestones: Milestone[];
  locale: string;
  currentOrder?: number;
  actionLabel?: string;
  onAction?: (milestone: Milestone) => void;
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
        const isCurrent = currentOrder ? m.order === currentOrder : m.status === "pending";
        const isFuture = currentOrder ? m.order > currentOrder : false;
        const itemClass = `${styles.step} ${isCurrent ? styles.stepCurrent : ""} ${isFuture ? styles.stepFuture : ""}`.trim();
        return (
          <li key={m.id} className={itemClass}>
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
              {isCurrent && actionLabel && onAction ? (
                <div className={styles.actionRow}>
                  <Button variant="secondary" size="sm" type="button" onClick={() => onAction(m)}>
                    {actionLabel}
                  </Button>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
