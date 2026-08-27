import HubPage from "../../components/hub/HubPage";
import { NAV_ITEMS } from "../../../ai/src/navigation";
import { BirichiNexView } from "../../types";
import MarketplacePage from "../MarketplacePage";
import DropshippingPage from "../DropshippingPage";
import LoyaltyPage from "../LoyaltyPage";
import AISalesAgentPage from "../AISalesAgentPage";

export default function SellHub({ onNavigate }: { onNavigate: (view: BirichiNexView) => void }) {
  const hub = NAV_ITEMS.find((i) => i.view === "sell")!;
  return (
    <HubPage
      hub={hub}
      onNavigate={onNavigate}
      renderers={{
        marketplace: () => <MarketplacePage onNavigate={onNavigate} />,
        dropshipping: () => <DropshippingPage />,
        loyalty: () => <LoyaltyPage />,
        "ai-agent": () => <AISalesAgentPage />,
      }}
    />
  );
}
