import HubPage from "../../components/hub/HubPage";
import { NAV_ITEMS } from "../../../ai/src/navigation";
import { BirichiNexView } from "../../types";
import InventoryPage from "../InventoryPage";
import ProcurementPage from "../ProcurementPage";

export default function ProductsHub({ onNavigate }: { onNavigate: (view: BirichiNexView) => void }) {
  const hub = NAV_ITEMS.find((i) => i.view === "products")!;
  return (
    <HubPage
      hub={hub}
      onNavigate={onNavigate}
      renderers={{
        inventory: () => <InventoryPage />,
        procurement: () => <ProcurementPage />,
      }}
    />
  );
}
