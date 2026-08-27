import HubPage from "../../components/hub/HubPage";
import { NAV_ITEMS } from "../../../ai/src/navigation";
import { BirichiNexView } from "../../types";
import LearningPage from "../LearningPage";
import CommunityPage from "../CommunityPage";
import EntrepreneurHubPage from "../EntrepreneurHubPage";
import RoutinesPage from "../RoutinesPage";

export default function LearnHub({ onNavigate }: { onNavigate: (view: BirichiNexView) => void }) {
  const hub = NAV_ITEMS.find((i) => i.view === "learn")!;
  return (
    <HubPage
      hub={hub}
      onNavigate={onNavigate}
      renderers={{
        learning: () => <LearningPage />,
        community: () => <CommunityPage />,
        "entrepreneur-hub": () => <EntrepreneurHubPage onNavigate={onNavigate} />,
        routines: () => <RoutinesPage onNavigate={onNavigate} />,
      }}
    />
  );
}
