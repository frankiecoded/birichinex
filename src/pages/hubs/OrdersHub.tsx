import HubPage from "../../components/hub/HubPage";
import { NAV_ITEMS } from "../../../ai/src/navigation";
import { BirichiNexView } from "../../types";
import LogisticsPage from "../LogisticsPage";
import DocumentsPage from "../DocumentsPage";
import OrderTrackingPage from "../OrderTrackingPage";

export default function OrdersHub({ onNavigate }: { onNavigate: (view: BirichiNexView) => void }) {
  const hub = NAV_ITEMS.find((i) => i.view === "orders")!;
  return (
    <HubPage
      hub={hub}
      onNavigate={onNavigate}
      renderers={{
        tracking: () => (
          <div className="h-[calc(100dvh-9rem)] min-h-[540px] rounded-[20px] overflow-hidden border border-glass-border bg-surface/50 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]">
            <OrderTrackingPage onNavigate={onNavigate} scope="all" embedded />
          </div>
        ),
        logistics: () => <LogisticsPage />,
        documents: () => <DocumentsPage />,
      }}
      unframedTabs={["tracking"]}
    />
  );
}
