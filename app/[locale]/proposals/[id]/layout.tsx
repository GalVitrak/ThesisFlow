import { STATIC_EXPORT_PROPOSAL_IDS } from "@/lib/staticExportSeed";

export function generateStaticParams() {
  return STATIC_EXPORT_PROPOSAL_IDS.map((id) => ({ id }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
