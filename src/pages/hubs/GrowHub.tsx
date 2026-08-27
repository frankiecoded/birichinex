import HubPage from "../../components/hub/HubPage";
import { NAV_ITEMS } from "../../../ai/src/navigation";
import { BirichiNexView } from "../../types";
import AIAdvisorPage from "../AIAdvisorPage";
import FrameworkLibraryPage from "../FrameworkLibraryPage";
import AnalyticsPage from "../AnalyticsPage";
import AutomationPage from "../AutomationPage";

export default function GrowHub({ onNavigate }: { onNavigate: (view: BirichiNexView) => void }) {
  const hub = NAV_ITEMS.find((i) => i.view === "grow")!;
  return (
    <HubPage
      hub={hub}
      onNavigate={onNavigate}
      renderers={{
        "ai-advisor": () => (
          <div className="h-[calc(100dvh-9rem)] min-h-[540px] rounded-[20px] overflow-hidden border border-glass-border bg-surface/50 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]">
            <AIAdvisorPage compact />
          </div>
        ),
        frameworks: () => <FrameworkLibraryPage onNavigate={onNavigate} />,
        analytics: () => <AnalyticsPage />,
        automation: () => <AutomationPage />,
      }}
      unframedTabs={["ai-advisor"]}
    />
  );
}
