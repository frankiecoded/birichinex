import HubPage from "../../components/hub/HubPage";
import { NAV_ITEMS } from "../../../ai/src/navigation";
import { BirichiNexView } from "../../types";
import ProfilePage from "../ProfilePage";
import MembershipPage from "../MembershipPage";
import SettingsPage from "../SettingsPage";

export default function AccountHub({ onNavigate }: { onNavigate: (view: BirichiNexView) => void }) {
  const hub = NAV_ITEMS.find((i) => i.view === "account")!;
  return (
    <HubPage
      hub={hub}
      onNavigate={onNavigate}
      renderers={{
        profile: () => <ProfilePage onNavigate={onNavigate} />,
        membership: () => <MembershipPage />,
        settings: () => <SettingsPage onNavigate={(view) => onNavigate(view as BirichiNexView)} />,
      }}
    />
  );
}
