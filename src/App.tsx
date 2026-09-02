import { useCallback, useEffect } from "react";
import NavigationShell from "./components/shell/NavigationShell";
import ShoppingShell from "./components/shell/ShoppingShell";
import AuthIntro from "./components/AuthIntro";
import EntryPage from "./pages/EntryPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import CRMPage from "./pages/CRMPage";
import InventoryPage from "./pages/InventoryPage";
import FinancePage from "./pages/FinancePage";
import AISalesAgentPage from "./pages/AISalesAgentPage";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
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
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CareersPage from "./pages/CareersPage";
import PressPage from "./pages/PressPage";
import SustainabilityPage from "./pages/SustainabilityPage";
import PartnersPage from "./pages/PartnersPage";
import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import CookiePage from "./pages/legal/CookiePage";
import AITermsPage from "./pages/legal/AITermsPage";
import SellerTermsPage from "./pages/legal/SellerTermsPage";
import MarketplaceTermsPage from "./pages/legal/MarketplaceTermsPage";
import ShippingPage from "./pages/legal/ShippingPage";
import ReturnsPage from "./pages/legal/ReturnsPage";
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
  const entrySeen = useStore((s) => s.entrySeen);

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
  const setEntrySeen = useStore((s) => s.setEntrySeen);
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
  const planStillValid =
    !subscription.expiresAt || new Date(subscription.expiresAt).getTime() > Date.now();
  const hasActiveSubscription =
    subscription.status === "active" && planStillValid && PAID_PLANS.includes(subscription.plan);
  const isSubscribed = subscription.status !== "cancelled" && subscription.status !== "expired";

  // ── Cloud state sync (Supabase) ──────────────────────────────────────────
  useEffect(() => {
    void pullSnapshot({ requireBlank: true }).then((r) => {
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

  // The app scrolls inside <main>, not the window – reset the active scroll
  // container so every navigation lands at the top of the new view.
  const scrollToTop = useCallback(() => {
    window.scrollTo(0, 0);
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
  }, []);

  // --- Navigation ---
  const handleExplore = useCallback(() => {
    if (!useStore.getState().user) {
      setEntrySeen(true);
      setAuthView(null);
      setAppMode("shopping");
      setShopView("home");
      scrollToTop();
    }
  }, [setEntrySeen, setAuthView, setAppMode, setShopView, scrollToTop]);

  // Personalized/transacting shop views require an account — guests see the
  // sign-in screen instead of the view (registration is always optional).
  const requiresAccount = useCallback(
    (view: string) => view === "checkout" || view === "orders" || view === "account" || view === "settings",
    []
  );

  const handleShopNavigate = (view: string) => {
    if (requiresAccount(view)) {
      if (!useStore.getState().user) setAuthView("login");
      return;
    }
    setShopView(view);
    scrollToTop();
  };

  const handleBusinessNavigate = (view: BirichiNexView) => {
    const hub = getHubForView(view);
    if (hub && hub.tab) {
      setActiveHubTab(hub.tab);
      setCurrentView(hub.view);
    } else {
      setCurrentView(view);
    }
    scrollToTop();
  };

  const handleToggleMode = () => {
    if (!user) {
      setAuthView("signup");
      return;
    }
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
          body: `Your ${subscription.plan} plan runs until ${new Date(subscription.expiresAt ?? Date.now()).toLocaleDateString()}. You can switch back to shopper once it ends.`,
          type: "system",
          actionView: "membership",
        });
        return;
      }
      setAppMode("shopping");
      setShopView("home");
    }
    scrollToTop();
  };

  // Jump straight to a business tool from the shop home
  const handleOpenBusinessView = (view: BirichiNexView) => {
    if (!user) {
      setAuthView("signup");
      return;
    }
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
    scrollToTop();
  };

  // --- AI Discovery Completion ---
  const handleOnboardingComplete = useCallback(() => {
    closeAiSetup();
    setAccountType("business");
    setAppMode("business");
    setCurrentView("dashboard");
    scrollToTop();
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

  // Returns a guest from the auth screens to another point of exploration —
  // no account required, matching the "Explore BirichiNex" promise.
  const handleBackFromAuth = useCallback(() => {
    setAuthView(null);
    setEntrySeen(true);
    setAppMode("shopping");
    setShopView("home");
    scrollToTop();
  }, [setAuthView, setEntrySeen, setAppMode, setShopView, scrollToTop]);

  // --- Intro Animation ---
  if (!introComplete) {
    return <AuthIntro onComplete={handleIntroComplete} />;
  }

  // --- Entry / Auth Pages ---
  if (!user) {
    if (authView === "signup") {
      return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthView("login")} onBack={handleBackFromAuth} onNavigate={(view) => { setAuthView(null); setEntrySeen(true); setAppMode("shopping"); setShopView(view); scrollToTop(); }} />;
    }
    if (authView === "forgot") {
      return <ForgotPasswordPage onBackToLogin={() => setAuthView("login")} onBack={handleBackFromAuth} />;
    }
    // Explicit sign-in intent (returning member after logout, gated shop views)
    if (authView === "login") {
      return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthView("signup")} onSwitchToForgot={() => setAuthView("forgot")} onBack={handleBackFromAuth} />;
    }
    // First contact with the platform — explore before registering.
    if (!entrySeen) {
      return (
        <EntryPage
          onExplore={handleExplore}
          onSignIn={() => setAuthView("login")}
          onCreateAccount={() => setAuthView("signup")}
        />
      );
    }
    // Returning guest — straight into the platform, no account wall.
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

    if (shopView === "about") {
      return <AboutPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "contact") {
      return <ContactPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "careers") {
      return <CareersPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "press") {
      return <PressPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "sustainability") {
      return <SustainabilityPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "partners") {
      return <PartnersPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "legal:terms") {
      return <TermsPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "legal:privacy") {
      return <PrivacyPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "legal:cookies") {
      return <CookiePage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "legal:ai") {
      return <AITermsPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "legal:seller") {
      return <SellerTermsPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "legal:marketplace") {
      return <MarketplaceTermsPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "legal:shipping") {
      return <ShippingPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "legal:returns") {
      return <ReturnsPage onNavigate={handleShopNavigate} />;
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
      <>
        <ShoppingShell
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setCurrency}
          cartCount={cartCount}
          userName={user?.name ?? "Guest"}
          isSubscribed={isSubscribed}
          onToggleMode={handleToggleMode}
          onNavigate={handleShopNavigate}
          currentView={shopView}
          loyaltyPoints={loyalty.points}
          onOpenAiSetup={openAiSetup}
          onSignIn={() => setAuthView("login")}
          onSignUp={() => setAuthView("signup")}
        >
          {renderShopPage()}
        </ShoppingShell>
        <FloatingAIAssistant />
      </>
    );
  }

  return (
    <>
      <NavigationShell
        currentView={currentView}
        onNavigate={handleBusinessNavigate}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setCurrency}
        onToggleMode={handleToggleMode}
        userName={user?.name ?? "Guest"}
        cartCount={cartCount}
      >
        {renderBusinessPage()}
      </NavigationShell>
      <FloatingAIAssistant />
    </>
  );
}
