import type { Locale } from "./config";
import en from "@/messages/en.json";
import he from "@/messages/he.json";

const catalogs: Record<Locale, typeof en> = { en, he };

export function getMessages(locale: Locale) {
  return catalogs[locale] ?? catalogs.he;
}

export type Messages = typeof en;
