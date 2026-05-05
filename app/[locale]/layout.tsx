import {
  defaultLocale,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/getMessages";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { LocaleAttributes } from "@/components/i18n/LocaleAttributes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DbSyncProvider } from "@/components/providers/DbSyncProvider";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw)
    ? raw
    : defaultLocale;
  const messages = getMessages(locale);

  return (
    <LocaleAttributes locale={locale}>
      <I18nProvider
        locale={locale}
        messages={messages}
      >
        <AuthProvider>
          <DbSyncProvider>
            {children}
          </DbSyncProvider>
        </AuthProvider>
      </I18nProvider>
    </LocaleAttributes>
  );
}
