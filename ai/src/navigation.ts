import {
  LayoutDashboard, Store, Users, Package, CreditCard, Truck,
  Sparkles, GraduationCap, User, Send, Award, Headset,
  ShoppingCart, TrendingUp, FileText, BarChart3, Zap,
  Globe, Rocket, Library, CalendarCheck, Shield, Settings, Navigation,
  Landmark,
} from "lucide-react";
import { BirichiNexView } from "../../src/types";

export type NavGroup = "daily" | "operations" | "growth";

export interface HubTab {
  id: string;
  label: string;
  desc: string;
  icon: any;
}

export interface NavItem {
  view: BirichiNexView;
  group: NavGroup;
  label: string;
  desc: string;
  icon: any;
  tabs: HubTab[];
}

export const NAV_GROUPS: { id: NavGroup; label: string; hint: string }[] = [
  { id: "daily", label: "Daily", hint: "What you'll touch most" },
  { id: "operations", label: "Operations", hint: "Run the machine" },
  { id: "growth", label: "Grow", hint: "Level up over time" },
];

export const NAV_ITEMS: NavItem[] = [
  {
    view: "dashboard",
    group: "daily",
    label: "Home",
    desc: "Your business at a glance and the next move that matters",
    icon: LayoutDashboard,
    tabs: [],
  },
  {
    view: "sell",
    group: "daily",
    label: "Sell",
    desc: "Storefront, dropshipping, loyalty and your AI sales agent",
    icon: Store,
    tabs: [
      { id: "marketplace", label: "Storefront", desc: "List and sell products", icon: Store },
      { id: "dropshipping", label: "Dropship", desc: "Sell without holding stock", icon: Send },
      { id: "loyalty", label: "Loyalty", desc: "Reward repeat customers", icon: Award },
      { id: "ai-agent", label: "Amani", desc: "Your 24/7 AI sales agent", icon: Headset },
    ],
  },
  {
    view: "customers",
    group: "daily",
    label: "Customers",
    desc: "Know every person who buys from you",
    icon: Users,
    tabs: [
      { id: "crm", label: "Customers", desc: "Your customer relationships", icon: Users },
    ],
  },
  {
    view: "products",
    group: "operations",
    label: "Products",
    desc: "Inventory and the suppliers who keep you stocked",
    icon: Package,
    tabs: [
      { id: "inventory", label: "Inventory", desc: "Track what you sell", icon: Package },
      { id: "procurement", label: "Procurement", desc: "Buy from trusted suppliers", icon: ShoppingCart },
    ],
  },
  {
    view: "money",
    group: "operations",
    label: "Money",
    desc: "Finance and payments — cash in, cash out, what's yours",
    icon: CreditCard,
    tabs: [
      { id: "finance", label: "Finance", desc: "Income, expenses and profit", icon: TrendingUp },
      { id: "finance-agent", label: "Zahara", desc: "Your AI finance agent", icon: Landmark },
      { id: "payments", label: "Payments", desc: "Get paid in any currency", icon: CreditCard },
    ],
  },
  {
    view: "orders",
    group: "operations",
    label: "Orders",
    desc: "Shipping, tracking and the paperwork that goes with it",
    icon: Truck,
    tabs: [
      { id: "tracking", label: "Live Map", desc: "Locate every package and shipment", icon: Navigation },
      { id: "logistics", label: "Shipping", desc: "Fulfilment and live tracking", icon: Truck },
      { id: "documents", label: "Documents", desc: "Contracts, quotes and e-signatures", icon: FileText },
    ],
  },
  {
    view: "grow",
    group: "growth",
    label: "Grow",
    desc: "Your AI advisor, proven frameworks, analytics and automation",
    icon: Sparkles,
    tabs: [
      { id: "ai-advisor", label: "AI Advisor", desc: "One AI that runs your whole business", icon: Sparkles },
      { id: "frameworks", label: "Frameworks", desc: "Battle-tested playbooks", icon: Library },
      { id: "analytics", label: "Analytics", desc: "See what's working", icon: BarChart3 },
      { id: "automation", label: "Automation", desc: "Put busywork on autopilot", icon: Zap },
    ],
  },
  {
    view: "learn",
    group: "growth",
    label: "Learn",
    desc: "Academy, community and founder routines",
    icon: GraduationCap,
    tabs: [
      { id: "learning", label: "Academy", desc: "Courses for African founders", icon: GraduationCap },
      { id: "community", label: "Community", desc: "Founders building like you", icon: Globe },
      { id: "entrepreneur-hub", label: "Hub", desc: "Grow from idea to institution", icon: Rocket },
      { id: "routines", label: "Routines", desc: "Daily and weekly habits", icon: CalendarCheck },
    ],
  },
  {
    view: "account",
    group: "growth",
    label: "Account",
    desc: "Profile, membership and settings",
    icon: User,
    tabs: [
      { id: "profile", label: "Profile", desc: "Your founder identity", icon: User },
      { id: "membership", label: "Membership", desc: "Plans and benefits", icon: Shield },
      { id: "settings", label: "Settings", desc: "Preferences and currency", icon: Settings },
    ],
  },
];

export interface HubMap {
  view: BirichiNexView;
  tab?: string;
}

// Legacy views that no longer have their own tab/hub but should still resolve
const VIEW_ALIASES: Record<string, string> = {
  ai: "ai-advisor",
};

// Map any view (hub or legacy tab) to its hub + tab
export function getHubForView(view: BirichiNexView | string): HubMap | null {
  const resolved = VIEW_ALIASES[view] ?? view;
  for (const item of NAV_ITEMS) {
    if (item.view === resolved) return { view: item.view };
    const tab = item.tabs.find((t) => t.id === resolved);
    if (tab) return { view: item.view, tab: tab.id };
  }
  return null;
}

export function getNavItem(view: BirichiNexView | string): NavItem | null {
  return NAV_ITEMS.find((i) => i.view === view) ?? null;
}

export function getTabItem(view: BirichiNexView | string): HubTab | null {
  for (const item of NAV_ITEMS) {
    const tab = item.tabs.find((t) => t.id === view);
    if (tab) return tab;
  }
  return null;
}

export function getViewLabel(view: BirichiNexView | string): string {
  const item = getNavItem(view);
  if (item) return item.label;
  const tab = getTabItem(view);
  return tab?.label ?? "Home";
}

export function getActiveLabel(view: BirichiNexView | string): string {
  const item = getNavItem(view);
  if (item) return item.label;
  const tab = getTabItem(view);
  return tab?.label ?? "Home";
}

export function getActiveDesc(view: BirichiNexView | string): string {
  const item = getNavItem(view);
  if (item) return item.desc;
  const tab = getTabItem(view);
  return tab?.desc ?? "";
}

export function getGroupHint(group: NavGroup): string {
  return NAV_GROUPS.find((g) => g.id === group)?.hint ?? "";
}

export function getGroupForView(view: BirichiNexView | string): NavGroup {
  const item = getNavItem(view);
  if (item) return item.group;
  const hub = getHubForView(view);
  if (hub) return getNavItem(hub.view)?.group ?? "growth";
  return "growth";
}

export function getGroupLabel(group: NavGroup): string {
  return NAV_GROUPS.find((g) => g.id === group)?.label ?? "";
}

export function getHubTitle(view: BirichiNexView | string, activeTab?: string | null): { title: string; desc: string } {
  const item = getNavItem(view);
  if (!item) {
    const tab = getTabItem(view);
    return { title: tab?.label ?? "Home", desc: tab?.desc ?? "" };
  }
  if (activeTab) {
    const tab = item.tabs.find((t) => t.id === activeTab);
    if (tab) return { title: tab.label, desc: tab.desc };
  }
  return { title: item.label, desc: item.desc };
}
