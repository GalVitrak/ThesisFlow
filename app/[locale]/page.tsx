import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  redirect(`/${locale}/dashboard`);
}
