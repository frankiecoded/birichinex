import { useCallback } from "react";
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
import AIAssistantPage from "./pages/AIAssistantPage";
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
import OnboardingFlow from "./pages/OnboardingFlow";
import PlaceholderPage from "./pages/PlaceholderPage";
import ShopHomePage from "./pages/shop/ShopHomePage";
import ShopCategoryPage from "./pages/shop/ShopCategoryPage";
import ShopProductPage from "./pages/shop/ShopProductPage";
import ShopCartPage from "./pages/shop/ShopCartPage";
import CheckoutPage from "./pages/shop/CheckoutPage";
import DealsPage from "./pages/DealsPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ShopAccountPage from "./pages/shop/ShopAccountPage";
import { BirichiNexView } from "./types";
import { useStore } from "./store/useStore";

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
  const setCurrency = useStore((s) => s.setCurrency);
  const addToCart = useStore((s) => s.addToCart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const login = useStore((s) => s.login);
  const signup = useStore((s) => s.signup);
  const setAuthView = useStore((s) => s.setAuthView);
  const setIntroComplete = useStore((s) => s.setIntroComplete);
  const loyalty = useStore((s) => s.loyalty);

  const cartProducts = cart.map((ci) => ci.product);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), [setIntroComplete]);

  // --- Navigation ---
  const handleShopNavigate = (view: string) => {
    setShopView(view);
    window.scrollTo(0, 0);
  };

  const handleBusinessNavigate = (view: BirichiNexView) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleToggleMode = () => {
    setAppMode(appMode === "shopping" ? "business" : "shopping");
    window.scrollTo(0, 0);
  };

  // --- Auth Handlers ---
  const handleLogin = (email: string, name: string) => login(email, name);
  const handleSignup = (email: string, name: string) => signup(email, name);

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

  // --- Shopping Router ---
  const renderShopPage = () => {
    if (shopView === "home") {
      return <ShopHomePage selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onAddToCart={addToCart} />;
    }

    if (shopView === "cart") {
      return <ShopCartPage cart={cartProducts} selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onRemoveFromCart={removeFromCart} />;
    }

    if (shopView === "checkout") {
      return <CheckoutPage cart={cartProducts} selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onRemoveFromCart={removeFromCart} />;
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
      return <OrderTrackingPage onNavigate={handleShopNavigate} />;
    }

    if (shopView === "account") {
      return <ShopAccountPage selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} />;
    }

    if (shopView === "bales") {
      return <ShopCategoryPage categoryPath="category:fashion" selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onAddToCart={addToCart} />;
    }

    if (shopView === "settings") {
      return <SettingsPage />;
    }

    return <ShopHomePage selectedCurrency={selectedCurrency} onNavigate={handleShopNavigate} onAddToCart={addToCart} />;
  };

  // --- Business Router ---
  const renderBusinessPage = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardPage onNavigate={handleBusinessNavigate} />;
      case "marketplace":
        return <MarketplacePage onNavigate={handleBusinessNavigate} />;
      case "crm":
        return <CRMPage />;
      case "inventory":
        return <InventoryPage />;
      case "finance":
        return <FinancePage />;
      case "ai":
        return <AIAssistantPage />;
      case "learning":
        return <LearningPage />;
      case "entrepreneur-hub":
        return <EntrepreneurHubPage onNavigate={handleBusinessNavigate} />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage />;
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
      case "identity-access":
        return <PlaceholderPage title="Identity & Access" description="Business profiles, authentication, permissions, roles, and security." icon="Shield" capability="identity-access" />;
      case "collaboration":
        return <PlaceholderPage title="Collaboration" description="Teamwork, project management, shared workspaces, and task management." icon="MessageSquare" capability="collaboration" />;
      case "integrations":
        return <PlaceholderPage title="Integrations" description="APIs, third-party software, banks, payment providers, and shipping companies." icon="Plug" capability="integrations" />;
      case "media":
        return <PlaceholderPage title="Media" description="Podcasts, Business TV, webinars, live streaming, and marketing content." icon="Play" capability="media" />;
      case "recruitment":
        return <PlaceholderPage title="Recruitment" description="Talent acquisition, hiring, freelancer management, and career opportunities." icon="UserPlus" capability="recruitment" />;
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
        cartCount={cart.length}
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
      cartCount={cart.length}
    >
      {renderBusinessPage()}
    </NavigationShell>
  );
}
