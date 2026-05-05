import { STATIC_EXPORT_PROJECT_IDS } from "@/lib/staticExportSeed";

export function generateStaticParams() {
  return STATIC_EXPORT_PROJECT_IDS.map((projectId) => ({ projectId }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
