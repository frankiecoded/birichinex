import LegalDocumentPage from "./LegalDocumentPage";
import { LEGAL_PAGES } from "./policies";

export default function SellerTermsPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return <LegalDocumentPage page={LEGAL_PAGES.seller} onNavigate={onNavigate} />;
}