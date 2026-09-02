import LegalDocumentPage from "./LegalDocumentPage";
import { LEGAL_PAGES } from "./policies";

export default function MarketplaceTermsPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return <LegalDocumentPage page={LEGAL_PAGES.marketplace} onNavigate={onNavigate} />;
}