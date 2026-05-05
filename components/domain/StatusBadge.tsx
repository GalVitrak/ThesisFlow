"use client";

import { Badge } from "@/components/ui/Badge";
import { useT } from "@/components/i18n/I18nProvider";

const KEYS = new Set([
  "open",
  "closed",
  "pending",
  "approved",
  "rejected",
  "needs_changes",
  "meeting_requested",
  "submitted",
  "scheduled",
  "cancelled",
  "active",
]);

const DISPLAY_MAP: Record<string, string> = {
  "פתוח להגשה": "open",
  מלא: "closed",
  ממתין: "pending",
  אושר: "approved",
  נדחה: "rejected",
  "נדרש תיקון": "needs_changes",
  "טרם נפתח": "pending",
  "טרם נקבע": "scheduled",
  הושלם: "approved",
};

export function StatusBadge({ value }: { value: string }) {
  const t = useT();
  const normalized = DISPLAY_MAP[value] ?? value;
  const key = KEYS.has(normalized) ? normalized : "pending";
  const tone =
    key === "approved"
      ? "success"
      : key === "rejected" || key === "cancelled"
        ? "danger"
        : key === "needs_changes" || key === "meeting_requested"
          ? "warning"
          : key === "pending" || key === "submitted" || key === "scheduled"
            ? "info"
            : "neutral";
  return <Badge tone={tone}>{t(`status.${key}` as "status.pending")}</Badge>;
}
