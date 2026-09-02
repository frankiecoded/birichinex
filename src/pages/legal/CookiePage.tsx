import LegalDocumentPage from "./LegalDocumentPage";
import { LEGAL_PAGES } from "./policies";

export default function CookiePage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return <LegalDocumentPage page={LEGAL_PAGES.cookies} onNavigate={onNavigate} />;
}