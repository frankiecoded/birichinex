import { useCallback, useEffect } from "react";
import NavigationShell from "./components/shell/NavigationShell";
import ShoppingShell from "./components/shell/ShoppingShell";
import AuthIntro from "./components/AuthIntro";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import CRMPage from "./pages/CRMPage";
import InventoryPage from "./pages/InventoryPage";
import FinancePage from "./pages/FinancePage";
import AISalesAgentPage from "./pages/AISalesAgentPage";
import FinanceAgentPage from "./pages/FinanceAgentPage";
import LearningPage from "./pages/LearningPage";
import EntrepreneurHubPage from "./pages/EntrepreneurHubPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import MembershipPage from "./pages/MembershipPage";
import DropshippingPage from "./pages/DropshippingPage";
import LoyaltyPage from "./pages/LoyaltyPage";
import ProcurementPage from "./pages/ProcurementPage";
import LogisticsPage from "./pages/LogisticsPage";
import PaymentsPage from "./pages/PaymentsPage";
import DocumentsPage from "./pages/DocumentsPage";
import AutomationPage from "./pages/AutomationPage";
import CommunityPage from "./pages/CommunityPage";
import ProfilePage from "./pages/ProfilePage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import FrameworkLibraryPage from "./pages/FrameworkLibraryPage";
import RoutinesPage from "./pages/RoutinesPage";
import OnboardingFlow from "./pages/OnboardingFlow";
import SellHub from "./pages/hubs/SellHub";
import CustomersHub from "./pages/hubs/CustomersHub";
import ProductsHub from "./pages/hubs/ProductsHub";
import MoneyHub from "./pages/hubs/MoneyHub";
import OrdersHub from "./pages/hubs/OrdersHub";
import GrowHub from "./pages/hubs/GrowHub";
import LearnHub from "./pages/hubs/LearnHub";
import AccountHub from "./pages/hubs/AccountHub";
import ShopHomePage from "./pages/shop/ShopHomePage";
import ShopCategoryPage from "./pages/shop/ShopCategoryPage";
import ShopProductPage from "./pages/shop/ShopProductPage";
import ShopCartPage from "./pages/shop/ShopCartPage";
import CheckoutPage from "./pages/shop/CheckoutPage";
import BalesPage from "./pages/shop/BalesPage";
import DealsPage from "./pages/DealsPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ShopAccountPage from "./pages/shop/ShopAccountPage";
import { BirichiNexView, AccountType, PAID_PLANS } from "./types";
import { getHubForView } from "../ai/src/navigation";
import { useStore } from "./store/useStore";
import { pullSnapshot, pushSnapshot, subscribeToSync } from "./lib/sync";

export default function App() {
  const appMode = useStore((s) => s.appMode);
  const shopView = useStore((s) => s.shopView);
  const currentView = useStore((s) => s.currentView);
  const selectedCurrency = useStore((s) => s.selectedCurrency);
  const cart = useStore((s) => s.cart);
  const user = useStore((s) => s.user);
  const authView = useStore((s) => s.authView);
  const introComplete = useStore((s) => s.introComplete);

  const setAppMode = useStore((s) => s.setAppMode);
  const setShopView = useStore((s) => s.setShopView);
  const setCurrentView = useStore((s) => s.setCurrentView);
  const setActiveHubTab = useStore((s) => s.setActiveHubTab);
  const setCurrency = useStore((s) => s.setCurrency);
  const addToCart = useStore((s) => s.addToCart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const login = useStore((s) => s.login);
  const signup = useStore((s) => s.signup);
  const setAuthView = useStore((s) => s.setAuthView);
  const setIntroComplete = useStore((s) => s.setIntroComplete);
  const loyalty = useStore((s) => s.loyalty);
  const aiSetupOpen = useStore((s) => s.aiSetupOpen);
  const openAiSetup = useStore((s) => s.openAiSetup);
  const closeAiSetup = useStore((s) => s.closeAiSetup);
  const auditCompleted = useStore((s) => s.auditCompleted);
  const subscription = useStore((s) => s.subscription);
  const setAccountType = useStore((s) => s.setAccountType);
  const addNotification = useStore((s) => s.addNotification);
  const theme = useStore((s) => s.settings.theme);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const accountType: AccountType = user?.accountType ?? "shopper";
  const hasActiveSubscription =
    subscription.status === "active" &&
    new Date(subscription.expiresAt).getTime() > Date.now() &&
    PAID_PLANS.includes(subscription.plan);

  // ── Cloud state sync (Supabase) ──────────────────────────────────────────
  useEffect(() => {
    void pullSnapshot().then((r) => {
      if (r.ok && !r.hadData) void pushSnapshot();
    });
    return subscribeToSync();
  }, []);

  // ── Theme (Appearance → Settings) ────────────────────────────────────────
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = theme === "system" ? (mql.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };
    apply();
    if (theme === "system") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [theme]);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), [setIntroComplete]);

  // --- Navigation ---
  const handleShopNavigate = (view: string) => {
    setShopView(view);
    window.scrollTo(0, 0);
  };

  const handleBusinessNavigate = (view: BirichiNexView) => {
    const hub = getHubForView(view);
    if (hub && hub.tab) {
      setActiveHubTab(hub.tab);
      setCurrentView(hub.view);
    } else {
      setCurrentView(view);
    }
    window.scrollTo(0, 0);
  };

  const handleToggleMode = () => {
    if (appMode === "shopping") {
      // Going to business
      if (accountType === "business") {
        setAppMode("business");
        setCurrentView("dashboard");
        if (!auditCompleted) openAiSetup();
      } else {
        // Shopper upgrading — run the discovery conversation first
        setAccountType("business");
        openAiSetup();
      }
    } else {
      // Going to shopping
      if (hasActiveSubscription) {
        addNotification({
          title: "Subscription active",
          body: `Your ${subscription.plan} plan runs until ${new Date(subscription.expiresAt).toLocaleDateString()}. You can switch back to shopper once it ends.`,
          type: "system",
          actionView: "membership",
        });
        return;
      }
      setAppMode("shopping");
      setShopView("home");
    }
    window.scrollTo(0, 0);
  };

  // Jump straight to a business tool from the shop home
  const handleOpenBusinessView = (view: BirichiNexView) => {
    if (accountType !== "business") {
      setAccountType("business");
      openAiSetup();
      return;
    }
    setAppMode("business");
    const hub = getHubForView(view);
    if (hub && hub.tab) {
      setActiveHubTab(hub.tab);
      setCurrentView(hub.view);
    } else {
      setCurrentView(view);
    }
    window.scrollTo(0, 0);
  };

  // --- AI Discovery Completion ---
  const handleOnboardingComplete = useCallback(() => {
    closeAiSetup();
    setAccountType("business");
    setAppMode("business");
    setCurrentView("dashboard");
    window.scrollTo(0, 0);
  }, [closeAiSetup, setAccountType, setAppMode, setCurrentView]);

  // --- Auth Handlers ---
  const handleLogin = (email: string, name: string) => {
    login(email, name);
    const loggedIn = useStore.getState().user;
    if (loggedIn?.accountType === "business") {
      setAppMode("business");
      setCurrentView("dashboard");
      if (!useStore.getState().auditCompleted) openAiSetup();
    } else {
      setAppMode("shopping");
      setShopView("home");
    }
  };

  const handleSignup = (email: string, name: string, accountType: AccountType, password?: string) => {
    signup(email, name, accountType, password);
    if (accountType === "business") {
      setAppMode("business");
      setCurrentView("dashboard");
      openAiSetup();
    } else {
      setAppMode("shopping");
      setShopView("home");
    }
  };

  // --- Intro Animation ---
  if (!introComplete) {
    return <AuthIntro onComplete={handleIntroComplete} />;
  }

  // --- Auth Pages ---
  if (!user) {
    if (authView === "signup") {
      return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthView("login")} />;
    }
    if (authView === "forgot") {
      return <ForgotPasswordPage onBackToLogin={() => setAuthView("login")} />;
    }
    return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthView("signup")} onSwitchToForgot={() => setAuthView("forgot")} />;
  }

  // --- AI Discovery Conversation (on-demand — launched from "Our AI") ---
  if (aiSetupOpen) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onExit={closeAiSetup} />;
  }

  // --- Shopping Router ---
  const renderShopPage = () => {
    if (shopView === "home") {
      return <ShopHomePage selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onAddToCart={addToCart} onOpenAiSetup={openAiSetup} onNavigateBusiness={handleOpenBusinessView} />;
    }

    if (shopView === "cart") {
      return <ShopCartPage cart={cart} selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onRemoveFromCart={removeFromCart} onUpdateQuantity={updateQuantity} />;
    }

    if (shopView === "checkout") {
      return <CheckoutPage cart={cart} selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onRemoveFromCart={removeFromCart} />;
    }

    if (shopView.startsWith("category:")) {
      return <ShopCategoryPage categoryPath={shopView} selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onAddToCart={addToCart} />;
    }

    if (shopView.startsWith("product:")) {
      const productId = shopView.split(":")[1];
      return <ShopProductPage productId={productId} selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onAddToCart={addToCart} />;
    }

    if (shopView === "deals") {
      return <DealsPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "orders") {
      return <OrderTrackingPage onNavigate={handleShopNavigate} scope="orders" />;
    }

    if (shopView === "account") {
      return <ShopAccountPage selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} />;
    }

    if (shopView === "bales") {
      return <BalesPage selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onAddToCart={addToCart} />;
    }

    if (shopView === "settings") {
      return <SettingsPage onNavigate={(view) => (view === "membership" ? handleOpenBusinessView("membership") : handleShopNavigate(view))} />;
    }

    return <ShopHomePage selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onAddToCart={addToCart} onOpenAiSetup={openAiSetup} onNavigateBusiness={handleOpenBusinessView} />;
  };

  // --- Business Router ---
  const renderBusinessPage = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardPage onNavigate={handleBusinessNavigate} />;
      case "sell":
        return <SellHub onNavigate={handleBusinessNavigate} />;
      case "customers":
        return <CustomersHub onNavigate={handleBusinessNavigate} />;
      case "products":
        return <ProductsHub onNavigate={handleBusinessNavigate} />;
      case "money":
        return <MoneyHub onNavigate={handleBusinessNavigate} />;
      case "orders":
        return <OrdersHub onNavigate={handleBusinessNavigate} />;
      case "grow":
        return <GrowHub onNavigate={handleBusinessNavigate} />;
      case "learn":
        return <LearnHub onNavigate={handleBusinessNavigate} />;
      case "account":
        return <AccountHub onNavigate={handleBusinessNavigate} />;
      case "marketplace":
        return <MarketplacePage onNavigate={handleBusinessNavigate} />;
      case "crm":
        return <CRMPage />;
      case "inventory":
        return <InventoryPage />;
      case "finance":
        return <FinancePage />;
      case "ai":
        return <AIAdvisorPage />;
      case "ai-agent":
        return <AISalesAgentPage />;
      case "finance-agent":
        return <FinanceAgentPage />;
      case "learning":
        return <LearningPage />;
      case "entrepreneur-hub":
        return <EntrepreneurHubPage onNavigate={handleBusinessNavigate} />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage onNavigate={handleBusinessNavigate} />;
      case "membership":
        return <MembershipPage />;
      case "dropshipping":
        return <DropshippingPage />;
      case "loyalty":
        return <LoyaltyPage />;
      case "procurement":
        return <ProcurementPage />;
      case "logistics":
        return <LogisticsPage />;
      case "payments":
        return <PaymentsPage />;
      case "documents":
        return <DocumentsPage />;
      case "automation":
        return <AutomationPage />;
      case "community":
        return <CommunityPage />;
      case "profile":
        return <ProfilePage onNavigate={handleBusinessNavigate} />;
      case "ai-advisor":
        return <AIAdvisorPage />;
      case "frameworks":
        return <FrameworkLibraryPage onNavigate={handleBusinessNavigate} />;
      case "routines":
        return <RoutinesPage onNavigate={handleBusinessNavigate} />;
      case "identity-access":
        return <SettingsPage onNavigate={handleBusinessNavigate} />;
      case "collaboration":
        return <CommunityPage />;
      case "integrations":
        return <SettingsPage onNavigate={handleBusinessNavigate} />;
      case "media":
        return <CommunityPage />;
      case "recruitment":
        return <CommunityPage />;
      default:
        return <DashboardPage onNavigate={handleBusinessNavigate} />;
    }
  };

  // --- Render ---
  if (appMode === "shopping") {
    return (
      <ShoppingShell
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setCurrency}
        cartCount={cartCount}
        userName={user.name}
        isSubscribed={true}
        onToggleMode={handleToggleMode}
        onNavigate={handleShopNavigate}
        currentView={shopView}
        loyaltyPoints={loyalty.points}
      >
        {renderShopPage()}
      </ShoppingShell>
    );
  }

  return (
    <NavigationShell
      currentView={currentView}
      onNavigate={handleBusinessNavigate}
      selectedCurrency={selectedCurrency}
      onCurrencyChange={setCurrency}
      onToggleMode={handleToggleMode}
      userName={user.name}
      cartCount={cartCount}
    >
      {renderBusinessPage()}
    </NavigationShell>
  );
}
