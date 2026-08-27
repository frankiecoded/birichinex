import HubPage from "../../components/hub/HubPage";
import { NAV_ITEMS } from "../../../ai/src/navigation";
import { BirichiNexView } from "../../types";
import FinancePage from "../FinancePage";
import PaymentsPage from "../PaymentsPage";
import FinanceAgentPage from "../FinanceAgentPage";

export default function MoneyHub({ onNavigate }: { onNavigate: (view: BirichiNexView) => void }) {
  const hub = NAV_ITEMS.find((i) => i.view === "money")!;
  return (
    <HubPage
      hub={hub}
      onNavigate={onNavigate}
      unframedTabs={["finance-agent"]}
      renderers={{
        finance: () => <FinancePage />,
        payments: () => <PaymentsPage />,
        "finance-agent": () => <FinanceAgentPage />,
      }}
    />
  );
}
