import LegalDocumentPage from "./LegalDocumentPage";
import { LEGAL_PAGES } from "./policies";

export default function ReturnsPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return <LegalDocumentPage page={LEGAL_PAGES.returns} onNavigate={onNavigate} />;
}
