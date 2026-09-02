import LegalDocumentPage from "./LegalDocumentPage";
import { LEGAL_PAGES } from "./policies";

export default function TermsPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return <LegalDocumentPage page={LEGAL_PAGES.terms} onNavigate={onNavigate} />;
}