/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, Award, Users, BookOpen, Globe, ArrowRight, Sparkles, MessageSquare, 
  Send, Trash2, ShoppingCart, Check, RefreshCw, Layers, ShieldCheck, MapPin, 
  AlertCircle, ChevronRight, User, CheckCircle, Play, Laptop, FileText, Landmark, Phone, 
  Info, Mail, Search, Sparkle, LogIn, DollarSign, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeHero from "./components/home/HomeHero";
import CategoryShowcase from "./components/home/CategoryShowcase";
import HeroScene3D from "./components/3d/HeroScene3D";
import SupplyChainGlobe from "./components/3d/SupplyChainGlobe";
import ScrollReveal, { StaggerContainer, StaggerItem } from "./components/ui/ScrollReveal";
import TiltCard from "./components/ui/TiltCard";
import PageBanner from "./components/ui/PageBanner";
import { formatPrice, INITIAL_PRODUCTS, INITIAL_BALES } from "./utils";
import { IMAGES, getProductImage, TECH_IMAGES, BALE_IMAGES, ACADEMY_IMAGES } from "./assets/images";
import { ProductPrice, BaleOption, AcademyLesson, RefurbishedTech, SuccessStory, CartItem, UserProfile } from "./types";

// Static Data for Refurbished Tech
const REFURBISHED_TECH: RefurbishedTech[] = [
  {
    id: "tech-1",
    name: "HP EliteBook 840 G6 Laptop",
    category: "Laptops",
    priceTZS: 850000,
    condition: "Certified Premium",
    specs: ["Core i5 8th Gen", "16GB DDR4 RAM", "512GB NVMe SSD", "14\" Full HD Touch"],
    warranty: "12 Months Warranty",
    stock: 14,
  },
  {
    id: "tech-2",
    name: "Apple iPad Air 4th Gen",
    category: "Tablets",
    priceTZS: 950000,
    condition: "Refurbished Excellent",
    specs: ["Apple A14 Bionic", "64GB Storage", "10.9\" Liquid Retina Display", "Supports Apple Pencil 2"],
    warranty: "12 Months Warranty",
    stock: 8,
  },
  {
    id: "tech-3",
    name: "Lenovo ThinkPad T490",
    category: "Laptops",
    priceTZS: 1100000,
    condition: "Certified Premium",
    specs: ["Core i7 8th Gen", "16GB DDR4 RAM", "512GB SSD", "14\" IPS Panel"],
    warranty: "12 Months Warranty",
    stock: 9,
  },
  {
    id: "tech-4",
    name: "Samsung Galaxy S21 5G",
    category: "Phones",
    priceTZS: 750000,
    condition: "Refurbished Excellent",
    specs: ["8GB RAM", "128GB Storage", "6.2\" Dynamic AMOLED 2X", "Super Fast Charging"],
    warranty: "12 Months Warranty",
    stock: 12,
  },
  {
    id: "tech-5",
    name: "HP ProDesk 600 G4 Desktop Computer",
    category: "Desktops",
    priceTZS: 650000,
    condition: "Tested Good",
    specs: ["Intel Core i5 8500", "16GB RAM", "256GB SSD + 1TB HDD", "Windows 11 Pro Ready"],
    warranty: "6 Months Warranty",
    stock: 5,
  },
  {
    id: "tech-6",
    name: "Dual-Band Wireless Gigabit Router AC1200",
    category: "Networking",
    priceTZS: 95000,
    condition: "Tested Good",
    specs: ["4 External Antennas", "Up to 1200Mbps", "Gigabit WAN/LAN Ports"],
    warranty: "6 Months Warranty",
    stock: 22,
  }
];

// Academy Lessons Array
const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: "lesson-1",
    title: "How to Start a Mitumba Fashion Business",
    category: "Entrepreneurship Essentials",
    duration: "15 min read",
    difficulty: "Beginner",
    description: "Learn the foundational steps of starting your boutique or retail clothing business, from sourcing to selecting locations and getting licenses.",
    estimatedIncomeIncrease: "Increase monthly profits by 30%+",
    content: `
# STARTING A MITUMBA BUSINESS: THE COMPLETE PLAYBOOK

## Introduction
The second-hand clothing industry in East Africa (Mitumba) supports millions of livelihoods and constitutes the backbone of affordable, quality fashion. However, successful traders do not leave their profit margins to chance. This guide lays out a systematic approach to launching a clothing business.

## Step 1: Market Sourcing and Category Selection
One of the most common reasons beginners lose capital is buying randomized bales with unpredictable quality. This is why Portmetals Africa specializes in sorted wholesale supplies. 
- **Assess your target market**: Are your customers office workers (Men Cotton Shirts), college students (Flannel Shirts, Joggers), or local families (Kids Rummage)?
- **Begin with a high-yield, low-risk category**: Ladies Jeans or Men Cotton Shirts offer consistent local demand.

## Step 2: Location and Display Philosophy
Whether you are selling out of a physical stall (vibanda) or launching a modern boutique:
1. **The Iron and Fragrance Rule**: Never display clothes directly from a compressed bale. Iron every item, use a clean scent spray, and hang them neatly. This instantly doubles the perceived value.
2. **First-Grade Display**: Place your premium items (the "cream" of the selection) on front hangers to attract foot traffic.

## Step 3: Capital and Scaling
- **The rule of 2**: When you sell your first bale, use the revenue to buy two more bales rather than treating it as disposable income. This is how you transition from an individual trader to a wholesale distributor.
    `
  },
  {
    id: "lesson-2",
    title: "Smart Retail Pricing & Markup Rules",
    category: "Financial Discipline",
    duration: "10 min read",
    difficulty: "Beginner",
    description: "Master the mathematical approach to pricing individual clothing items from wholesale lots to guarantee positive unit economics.",
    estimatedIncomeIncrease: "Double your gross margins",
    content: `
# PRICING STRATEGY: HOW TO ELIMINATE TRADING UNCERTAINTY

## Introduction
Many traders fail because they don't calculate their unit costs. When you buy clothing in bulk, you must understand your unit cost and implement three tiers of pricing: Premium Cream, Standard Retail, and Clearance.

## The Mathematical Breakdown
Let's analyze a real-world scenario using **Portmetals Ladies Jeans** costing **15,000 TZS** per unit in wholesale:

1. **Calculate Your True Unit Cost**:
   - Item Cost: 15,000 TZS
   - Logistics, cleaning, and hanger overhead: 2,000 TZS
   - **True Unit Cost: 17,000 TZS**

2. **The 3-Tier Sort Strategy**:
   - **Tier 1: High-End Cream (Top 30%)**: Sell individually at 30,000 TZS to 35,000 TZS. This recovers almost your entire investment.
   - **Tier 2: Standard Grade A (Next 50%)**: Sell individually at 22,000 TZS. This is where your pure profit lies.
   - **Tier 3: Budget Clearance (Bottom 20%)**: Sell at 15,000 TZS to clear stock quickly and maintain liquidity.

## Sourcing and Reordering
Never let your cash flow dry up. Save 60% of daily sales specifically for your next inventory reorder. Reorder at least 4 days before your stock drops to 20% to avoid losing regular customers.
    `
  },
  {
    id: "lesson-3",
    title: "Leveraging TikTok and Instagram Live for Fashion Sales",
    category: "Digital Marketing",
    duration: "12 min read",
    difficulty: "Intermediate",
    description: "Harness the power of free social media traffic to sell out your stock within hours, bypass high rent, and build loyal community buyers.",
    estimatedIncomeIncrease: "Sell out stock 5x faster",
    content: `
# SOCIAL MEDIA SELLING: BYPASSING THE PHYSICAL STORE

## Introduction
You do not need an expensive shop in Westlands or downtown Mombasa to build a successful fashion business. Over 65% of young fashion entrepreneurs now sell directly on Instagram and TikTok using live shopping formats.

## Setting Up Your Digital Showroom
1. **The Lighting is Your Rent**: Invest in a high-quality ring light or stream in abundant natural light. Bad visual quality immediately signals low-grade products.
2. **Live Auctions & Claims**: Run structured TikTok Live events twice a week. Show each piece, highlight the European quality tag, call out the size, and let viewers "Claim" using item numbers.
3. **Delivery Partnership**: Partner with local boda-boda networks or regional parcel courier services. Offer reliable same-day delivery inside Nairobi/Mombasa, and overnight shipping to other regions.

## Building Customer Trust
Because digital buyers cannot touch the fabric, you must be extremely transparent about sizes and materials. Always mention any minor details, and offer a friendly size-exchange guarantee. This creates lifetime customers who buy from every new bale you open.
    `
  },
  {
    id: "lesson-4",
    title: "Financial Discipline & Inventory Management",
    category: "Business Systems",
    duration: "15 min read",
    difficulty: "Advanced",
    description: "Transform your side-hustle into a robust corporate asset. Master cash flow tracking, payroll management, and multi-location logistics.",
    estimatedIncomeIncrease: "Reduce inventory waste by 40%",
    content: `
# PROFESSIONAL CASH FLOW & BUSINESS SYSTEMS

## Separation of Finances
The absolute golden rule of business growth: **You are not your business.** 
- Set up a separate bank account or M-Pesa Till for all business transactions.
- Pay yourself a fixed monthly salary instead of taking cash out of the daily register.
- Never use stock capital for personal emergencies.

## Inventory Optimization
Maintain an active inventory register. Group items by age:
- **0-14 Days**: Fresh Arrivals (Maximum markup, premium display)
- **15-30 Days**: Mid-cycle (Promotional discounts, buy-one-get-one)
- **31+ Days**: Clearance (Sell at cost or slight loss to unlock capital)

Remember, cash tied up in unsold clothing is dead capital. It is always better to sell at cost and purchase a fresh, highly attractive bale than to sit on old inventory for months.
    `
  }
];

// Success Stories Array
const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "story-1",
    name: "Halima Mwangi",
    businessType: "Instagram Premium Boutique",
    location: "Nairobi, Kenya",
    monthlyRevenueBefore: "180,000 TZS equivalent",
    monthlyRevenueAfter: "2,400,000 TZS equivalent",
    baleTypeUsed: "30kg Business Starter Bale",
    story: "Halima started with just one 25kg starter bale in her college room. After moving to Portmetals Africa's sorted Ladies Jeans and Men Shirts, she created a cohesive Instagram boutique that now employs two dispatch riders.",
    quote: "With Portmetals, I stopped buying uncertainty. Every single item in my sorted bale is retail-ready. It changed my business from a gamble to a real, predictable career.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "story-2",
    name: "Emmanuel John",
    businessType: "Market Stall & Wholesale Hub",
    location: "Mombasa, Kenya",
    monthlyRevenueBefore: "350,000 TZS",
    monthlyRevenueAfter: "4,500,000 TZS",
    baleTypeUsed: "55kg Premium Business Bale",
    story: "Emmanuel operated a small stall at the Kongowea market. He transitioned to buying wholesale bales from Portmetals Africa's Mombasa showroom. He now distributes sorted categories directly to smaller vendors.",
    quote: "The business academy taught me pricing formulas. I used to sell everything at flat rates. Now, I sort into premium tiers, and my income has quadrupled.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<"TZS" | "KES" | "USD">("TZS");
  const [user, setUser] = useState<UserProfile | null>({
    name: "Fatma Omary",
    email: "fatma.omary@fashionbiz.co.tz",
    phone: "+255 754 888 999",
    businessName: "Fatma Premium Fits",
    businessLocation: "Dar es Salaam, Tanzania",
    preferredCurrency: "TZS",
    completedLessons: ["lesson-1"],
    submittedQuotes: []
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    { role: "model", content: "Habari! I am Amani, your Portmetals Africa Business Advisor. I am here to help you select high-margin stock, understand European quality standards, or plan your next scaling milestone. Ask me anything about our reviewed prices or bale sizes!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Quote Generation & Playbook
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quotePlaybook, setQuotePlaybook] = useState<string | null>(null);

  // Search & Filter state
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>("All");
  const [marketplaceSearch, setMarketplaceSearch] = useState<string>("");
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBizName, setRegBizName] = useState("");
  const [regLocation, setRegLocation] = useState("");

  // Partners Form State
  const [partnerSent, setPartnerSent] = useState(false);

  // Scroll indicator or interactive state
  const [hoveredRouteStep, setHoveredRouteStep] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const handleAddToCart = (item: ProductPrice | BaleOption | RefurbishedTech, type: "product" | "bale" | "tech") => {
    const itemId = item.id.toString();
    const existing = cart.find(i => i.itemId === itemId && i.type === type);

    let priceTZS = 0;
    if (type === "product") priceTZS = (item as ProductPrice).priceTZS;
    else if (type === "bale") priceTZS = (item as BaleOption).priceTZS;
    else if (type === "tech") priceTZS = (item as RefurbishedTech).priceTZS;

    if (existing) {
      setCart(cart.map(i => i.itemId === itemId && i.type === type ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, {
        id: `${type}-${itemId}`,
        type,
        itemId,
        name: item.name,
        priceTZS,
        quantity: 1,
        details: type === "bale" ? (item as BaleOption).weight : undefined
      }]);
    }

  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.priceTZS * item.quantity), 0);
  };

  // Chat API Connection
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userText = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userText }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, { role: "user", content: userText }].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "model", content: data.text }]);
    } catch (err) {
      console.error("Chat error:", err);
      // Fallback
      setChatMessages(prev => [...prev, { 
        role: "model", 
        content: "I apologize, my satellite connection is currently optimization-testing. I can confirm our wholesale pricing remains active. Men Cotton Shirts are 27,000 TZS, Ladies Jeans are 15,000 TZS, and Flannel Shirts are 15,000 TZS. Would you like me to guide you on unit economics calculations?" 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quote Sourcing Analyzer
  const handleRequestQuotePlaybook = async () => {
    if (cart.length === 0) return;
    setIsQuoteLoading(true);
    setQuotePlaybook(null);
    setCurrentView("profile"); // Navigate to dashboard where playbook will show

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          businessProfile: user ? {
            businessName: user.businessName,
            businessLocation: user.businessLocation,
            experience: "Scale-seeking Boutique"
          } : null
        })
      });

      const data = await response.json();
      setQuotePlaybook(data.playbook);

      // Record in user profile
      if (user) {
        const newQuote = {
          id: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toLocaleDateString(),
          items: [...cart],
          status: "Advisor Contacted" as const,
          totalTZS: calculateTotal()
        };
        setUser({
          ...user,
          submittedQuotes: [newQuote, ...user.submittedQuotes]
        });
      }

      setCart([]); // Clear cart after successful submission
    } catch (err) {
      console.error("Quote error:", err);
      setQuotePlaybook(`
# PORTMETALS AFRICA CUSTOM RECONNAISSANCE PLAYBOOK
*An error occurred but we generated this fallback based on your cart.*

## Retail & Markup Advisory
- Keep your markups within 50% - 100% of individual item unit pricing.
- Ensure all items are steam pressed, lightly scented, and styled before display.

Your Portmetals Business Advisor has been notified. We will call you at your registered phone number shortly.
      `);
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handleRegister = (e: any) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) return;

    setUser({
      name: regName,
      email: regEmail,
      phone: regPhone,
      businessName: regBizName || `${regName}'s Enterprise`,
      businessLocation: regLocation || "East Africa Showroom Region",
      preferredCurrency: selectedCurrency,
      completedLessons: [],
      submittedQuotes: []
    });

    setCurrentView("home");
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Complete lesson in Academy
  const handleCompleteLesson = (lessonId: string) => {
    if (user && !user.completedLessons.includes(lessonId)) {
      setUser({
        ...user,
        completedLessons: [...user.completedLessons, lessonId]
      });
    }
  };

  // Categories based on Reviewed list
  const categoriesList = ["All", "Women's Fashion", "Men's Fashion", "Kids", "Sportswear", "Jackets", "Handbags", "Leather", "T-Shirts"];

  const filteredProducts = INITIAL_PRODUCTS.filter(p => {
    const matchesCategory = marketplaceFilter === "All" || p.category === marketplaceFilter;
    const matchesSearch = p.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) || p.description.toLowerCase().includes(marketplaceSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Top Banner Alert */}
      <div className="bg-zinc-950 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wider flex items-center justify-center space-x-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span>Mombasa Warehouse Fully Stocked with European Cream Sorted Bales. Fast Regional Dispatch Active.</span>
      </div>

      {/* Navigation */}
      <Navbar 
        currentView={currentView}
        onNavigate={setCurrentView}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        user={user}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
        {/* ================= HOME / OVERVIEW ================= */}
        {currentView === "home" && (
          <div className="flex-1 flex flex-col">
            <HomeHero
              onShopWholesale={() => setCurrentView("marketplace")}
              onAcademy={() => setCurrentView("academy")}
              onShowroom={() => setCurrentView("contact")}
            />

            <CategoryShowcase
              onSelectCategory={(cat) => setMarketplaceFilter(cat)}
              onNavigateMarketplace={() => setCurrentView("marketplace")}
            />

            {/* Interactive Sourcing Route Flowchart Section */}
            <section className="relative py-20 px-4 md:px-12 bg-zinc-950 text-white overflow-hidden">
              <HeroScene3D className="opacity-15 pointer-events-none" />
              <div className="max-w-7xl mx-auto relative z-10">
                <ScrollReveal className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold tracking-[0.2em] text-amber-500 uppercase">Africa-Europe Trade Platform</span>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight">The Modern Sourcing Loop</h2>
                  <p className="text-sm text-zinc-400 max-w-xl mx-auto">Europe → Portmetals Africa → Entrepreneurs → Businesses → Jobs → Communities</p>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-12">
                  <ScrollReveal direction="right" className="hidden lg:block rounded-[28px] overflow-hidden border border-zinc-800">
                    <img src={IMAGES.europe} alt="European sourcing hub" className="w-full aspect-video object-cover" />
                    <div className="p-4 bg-zinc-900">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Europe</p>
                      <p className="text-xs text-zinc-400 mt-1">Ethical sourcing from Germany, Italy & UK retail hubs</p>
                    </div>
                  </ScrollReveal>

                  <div className="rounded-[28px] overflow-hidden border border-amber-500/30 bg-zinc-900/50 backdrop-blur-sm">
                    <SupplyChainGlobe className="min-h-[300px]" />
                    <div className="p-4 text-center border-t border-zinc-800">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Live Supply Chain</p>
                    </div>
                  </div>

                  <ScrollReveal direction="left" className="hidden lg:block rounded-[28px] overflow-hidden border border-zinc-800">
                    <img src={IMAGES.africa} alt="African entrepreneurs" className="w-full aspect-video object-cover" />
                    <div className="p-4 bg-zinc-900">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">East Africa</p>
                      <p className="text-xs text-zinc-400 mt-1">5,000+ entrepreneurs building businesses & communities</p>
                    </div>
                  </ScrollReveal>
                </div>

                <StaggerContainer className="relative grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Visual Connection line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 hidden md:block -translate-y-1/2 z-0"></div>

                  {[
                    {
                      step: 1,
                      title: "1. Ethical Sourcing",
                      loc: "Europe (Germany, Italy)",
                      desc: "Surplus garments and high-grade overstocks are sourced directly from reputable retail hubs.",
                      details: "Certified with premium quality stamps, guaranteeing no heavy tears or dirty items."
                    },
                    {
                      step: 2,
                      title: "2. Precise Sorting",
                      loc: "Specialized Facilities",
                      desc: "Garments are classified into 22 exact categories (cotton shirts, denims, activewear) and pre-pressed.",
                      details: "Standardized weight tags of 25kg, 30kg, 45kg and 55kg are packed with accurate estimates."
                    },
                    {
                      step: 3,
                      title: "3. Direct Transit",
                      loc: "Port of Mombasa",
                      desc: "Locked high-capacity containers are shipped directly, skipping uncertified middlemen.",
                      details: "Optimized logistics keep supply chain expenses and final wholesale prices low."
                    },
                    {
                      step: 4,
                      title: "4. Showrooms Desk",
                      loc: "Mombasa & Nairobi",
                      desc: "Bales are unpacked, verified, and cataloged. Customers can inspect premium categories behind glass.",
                      details: "Equipped with a business consultation desk and training corners for entrepreneurs."
                    },
                    {
                      step: 5,
                      title: "5. Entrepreneur Growth",
                      loc: "Your Local Business",
                      desc: "You purchase with verified pricing, access our academy training, and sell with up to 150% profit margins.",
                      details: "Supported by on-demand dispatch, WhatsApp advisory, and high-conversion social media assets."
                    }
                  ].map((node) => (
                    <StaggerItem key={node.step}>
                    <div 
                      onMouseEnter={() => setHoveredRouteStep(node.step)}
                      onMouseLeave={() => setHoveredRouteStep(null)}
                      className={`relative z-10 p-6 rounded-2xl border transition-all duration-500 ${
                        hoveredRouteStep === node.step 
                          ? "bg-amber-600 border-amber-500 -translate-y-1 shadow-xl shadow-amber-600/25 scale-[1.02]" 
                          : "bg-zinc-950/80 backdrop-blur-sm border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${hoveredRouteStep === node.step ? "text-white" : "text-amber-500"}`}>{node.loc}</span>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${hoveredRouteStep === node.step ? "bg-white text-zinc-950" : "bg-zinc-800 text-white"}`}>
                          {node.step}
                        </div>
                      </div>
                      <h3 className="font-bold text-sm text-white mb-2">{node.title}</h3>
                      <p className={`text-xs leading-relaxed ${hoveredRouteStep === node.step ? "text-white/90" : "text-zinc-400"}`}>{node.desc}</p>
                      
                      {hoveredRouteStep === node.step && (
                        <div className="mt-4 pt-4 border-t border-white/20 text-[11px] text-white/90 leading-relaxed italic animate-fade-in">
                          {node.details}
                        </div>
                      )}
                    </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </section>

            {/* Why Choose Portmetals Section */}
            <section className="py-20 px-4 md:px-12 bg-white border-b border-zinc-200">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <ScrollReveal className="space-y-6">
                  <div className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold tracking-wider text-zinc-600 uppercase">
                    OUR ADVANTAGE
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-900">We Don’t Sell Uncertainty. We Sell Opportunity.</h2>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Unlike standard mitumba suppliers where buying a bale is an expensive gamble, Portmetals Africa uses meticulous European grade standards. Every clothing bale is sorted accurately by style, size, and category.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "Professionally sorted categories",
                      "Consistent European quality standards",
                      "Clean and steam-ready products",
                      "Transparent pricing with zero hidden fees",
                      "Predictable high retail value",
                      "Free Business Academy guidance",
                    ].map((adv, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5">
                        <CheckCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-zinc-700">{adv}</span>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="left">
                <TiltCard intensity={6}>
                <div className="relative rounded-[32px] overflow-hidden min-h-[420px] flex flex-col justify-end shadow-2xl shadow-zinc-900/20">
                  <img src={IMAGES.showroom.mombasa} alt="Portmetals Mombasa showroom" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                  
                  <div className="relative z-10 p-8 space-y-4">
                    <span className="px-2.5 py-0.5 bg-amber-600 rounded-full text-[9px] font-bold uppercase tracking-wider text-white">Interactive Showrooms</span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">Visit Our Modern Facilities</h3>
                    <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
                      Mombasa warehouse & Nairobi consultation suite. Inspect sorted categories behind glass, test certified electronics, consult with business advisors.
                    </p>
                    <div className="flex justify-between items-center text-[11px] text-zinc-400 font-mono pt-2">
                      <span>MOMBASA HUB • ACTIVE</span>
                      <span>NAIROBI SUITE • OPEN</span>
                    </div>
                    <motion.button 
                      onClick={() => setCurrentView("contact")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs tracking-wider uppercase rounded-xl transition-all"
                    >
                      Request Consultation & Visit
                    </motion.button>
                  </div>
                </div>
                </TiltCard>
                </ScrollReveal>
              </div>
            </section>

            {/* Success Story Spotlight */}
            <section className="py-20 px-4 md:px-12 bg-[#F5F5F7] border-b border-zinc-200">
              <div className="max-w-7xl mx-auto">
                <ScrollReveal className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">REAL ENTREPRENEURS</span>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">Impact & Transformation</h2>
                  </div>
                  <button 
                    onClick={() => setCurrentView("academy")}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                  >
                    <span>Read all growth stories in Academy</span>
                    <span>→</span>
                  </button>
                </ScrollReveal>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {SUCCESS_STORIES.map((story) => (
                    <StaggerItem key={story.id}>
                    <TiltCard intensity={5}>
                    <div className="bg-white rounded-[24px] overflow-hidden border border-zinc-200/50 shadow-sm hover:shadow-xl transition-shadow duration-500">
                      <div className="relative h-48 overflow-hidden">
                        <img src={story.imageUrl} alt={story.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                        <div className="absolute inset-0 image-overlay-gradient" />
                        <div className="absolute bottom-4 left-5">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{story.businessType}</span>
                          <h4 className="font-bold text-lg text-white mt-0.5">{story.name}</h4>
                        </div>
                      </div>
                      <div className="p-6 space-y-3">
                        <p className="text-[11px] text-zinc-400 font-semibold">{story.location} • Using {story.baleTypeUsed}</p>
                        <p className="text-xs text-zinc-500 leading-relaxed italic">&ldquo;{story.quote}&rdquo;</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">{story.story}</p>
                        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                          <p className="text-[10px] text-zinc-400 uppercase font-bold">Monthly Revenue Growth</p>
                          <p className="text-xs font-semibold text-zinc-800">
                            {story.monthlyRevenueBefore} <span className="text-zinc-400">→</span> <span className="text-amber-600 font-extrabold">{story.monthlyRevenueAfter}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    </TiltCard>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </section>

            {/* Partnership Call */}
            <section className="py-20 px-4 md:px-12 bg-white text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">JOIN THE MOVEMENT</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">Ready to transform your business or supply chain?</h2>
                <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
                  Portmetals Africa works with regional county distributors, European ethical clothing sorting plants, institutional investors, and independent digital traders. Let's create jobs and build solid business communities together.
                </p>
                
                <div className="pt-4">
                  {partnerSent ? (
                    <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3.5 rounded-full text-xs font-semibold">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Thank you. Our partnership board will email or call you within 24 hours.</span>
                    </div>
                  ) : (
                    <div className="bg-zinc-50 rounded-3xl p-6 md:p-8 border border-zinc-200/60 max-w-xl mx-auto text-left">
                      <h4 className="font-bold text-sm text-zinc-900 mb-4">Submit Quick Partnership Request</h4>
                      <form onSubmit={(e) => { e.preventDefault(); setPartnerSent(true); }} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text" 
                            placeholder="Full Name" 
                            required 
                            className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                          />
                          <input 
                            type="email" 
                            placeholder="Email Address" 
                            required 
                            className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select 
                            required
                            className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                          >
                            <option value="">Desired Partnership</option>
                            <option value="supplier">Become European Supplier</option>
                            <option value="distributor">Become Regional Distributor</option>
                            <option value="buyer">Corporate/Bulk Buyer</option>
                            <option value="investor">Institutional Investor</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Phone (WhatsApp preferred)" 
                            required 
                            className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full py-3 bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs tracking-wider uppercase rounded-xl transition-all"
                        >
                          Submit Application
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= WHOLESALE MARKETPLACE ================= */}
        {currentView === "marketplace" && (
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8 space-y-10">
            <PageBanner
              eyebrow="Wholesale Marketplace"
              title="General Supplies & Reviewed Prices"
              description="22 professionally sorted fashion categories with transparent European-grade pricing. No mystery bales — only opportunity."
              image={IMAGES.marketplace.hero}
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left sidebar: Filter panel & Custom Advisor pitch */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-5 border border-zinc-200/50 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Categories</span>
                    <span className="text-[10px] font-semibold text-zinc-400">{filteredProducts.length} items</span>
                  </div>

                  <div className="space-y-1">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setMarketplaceFilter(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          marketplaceFilter === cat
                            ? "bg-amber-50 text-amber-700 font-bold"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        <span>{cat}</span>
                        {marketplaceFilter === cat && <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Sourcing Stats Card */}
                <div className="bg-zinc-900 text-white rounded-2xl p-5 border border-zinc-800 space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Simulated Retail Potential</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Select categories, add them to your Sourcing Cart, and submit a bulk request to calculate custom margins, shipment timelines, and target retail pricing dynamically.
                  </p>
                  <button 
                    onClick={() => { setIsChatOpen(true); }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[10px] tracking-wider uppercase transition-all flex items-center justify-center space-x-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Talk with Advisor Amani</span>
                  </button>
                </div>
              </div>

              {/* Right panel: Sourcing Marketplace content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Search and view header */}
                <div className="bg-white rounded-2xl p-5 border border-zinc-200/50 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900">General supplies & catalog</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Reviewed Portmetals Africa wholesale pricing. Sorted under high European control.</p>
                  </div>

                  <div className="relative w-full sm:w-64 shrink-0">
                    <input
                      type="text"
                      placeholder="Search wholesale items..."
                      value={marketplaceSearch}
                      onChange={(e) => setMarketplaceSearch(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-amber-600"
                    />
                    <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* General supplies products catalog */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200/50">
                    <AlertCircle className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-600">No categories found matching your search parameters.</p>
                    <button onClick={() => { setMarketplaceFilter("All"); setMarketplaceSearch(""); }} className="mt-2 text-[11px] font-bold text-amber-600 hover:underline">
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredProducts.map((product) => (
                      <TiltCard key={product.id} intensity={6}>
                      <div 
                        className="card-shine bg-white rounded-[20px] overflow-hidden border border-zinc-200/50 shadow-sm flex flex-col hover:border-amber-500/50 hover:shadow-xl transition-all duration-500 group h-full"
                      >
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={getProductImage(product.id, product.category)}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="text-[9px] font-extrabold text-white uppercase tracking-widest bg-zinc-950/70 backdrop-blur-sm px-2.5 py-1 rounded-full">
                              {product.category}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 glass-panel px-2.5 py-1 rounded-full">
                            <span className="text-sm font-extrabold text-zinc-900">
                              {formatPrice(product.priceTZS, selectedCurrency)}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
                          <div className="space-y-2">
                            <h3 className="font-bold text-base text-zinc-900 group-hover:text-amber-600 transition-colors">{product.name}</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{product.description}</p>

                            <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 text-[11px] space-y-1">
                              <p className="text-zinc-600"><strong className="text-zinc-900 font-semibold">Resale:</strong> {product.resalePotential}</p>
                              <p className="text-zinc-600"><strong className="text-zinc-900 font-semibold">Bale:</strong> {product.baleSize || "45kg default"}</p>
                              <p className="text-zinc-600"><strong className="text-zinc-900 font-semibold">Target:</strong> {product.targetCustomer}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-emerald-600 text-[10px] font-bold">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Tested & Sorted</span>
                            </div>

                            <motion.button
                              onClick={() => handleAddToCart(product, "product")}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-zinc-950 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5"
                            >
                              <ShoppingCart className="h-3.5 w-3.5 text-amber-500" />
                              <span>Add to Cart</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      </TiltCard>
                    ))}
                  </div>
                )}

                {/* Bale comparison grid */}
                <div className="space-y-6 pt-6">
                  <div className="border-b border-zinc-200 pb-2">
                    <h2 className="text-lg font-bold text-zinc-950">Premium Compressed Bales Selection</h2>
                    <p className="text-xs text-zinc-500">Perfect for retail shop scaling, market stalls, and county wholesalers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {INITIAL_BALES.map((bale) => (
                      <TiltCard key={bale.id} intensity={5}>
                      <div 
                        className="bg-white rounded-[24px] border border-zinc-200/60 overflow-hidden shadow-sm flex flex-col justify-between hover:border-amber-500/60 hover:shadow-xl transition-all duration-500 relative h-full"
                      >
                        <div className="relative h-36 overflow-hidden">
                          <img src={BALE_IMAGES[bale.id]} alt={bale.name} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                          {bale.badge && (
                            <div className="absolute top-3 right-3 bg-amber-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                              {bale.badge}
                            </div>
                          )}
                          <div className="absolute bottom-3 left-4">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{bale.weight} weight</span>
                            <h3 className="font-extrabold text-base text-white">{bale.name}</h3>
                          </div>
                        </div>

                        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="bg-zinc-900 text-white rounded-xl p-3.5 text-center">
                            <span className="text-xl font-black text-white">
                              {formatPrice(bale.priceTZS, selectedCurrency)}
                            </span>
                            <p className="text-[9px] font-semibold text-amber-500 uppercase tracking-widest mt-0.5">
                              Estimated pieces: ~{bale.estimatedPieces} items
                            </p>
                          </div>

                          <div className="text-xs space-y-2 text-zinc-600">
                            <div className="flex items-start space-x-1.5">
                              <span className="font-bold text-zinc-950">Ideal For:</span>
                              <span>{bale.idealCustomer}</span>
                            </div>
                            <div className="flex items-start space-x-1.5">
                              <span className="font-bold text-zinc-950">Potential:</span>
                              <span className="text-emerald-700 font-semibold">{bale.expectedResalePotential}</span>
                            </div>
                            <div className="flex items-start space-x-1.5">
                              <span className="font-bold text-zinc-950">Storage:</span>
                              <span>{bale.storageRecommendation}</span>
                            </div>
                            <div className="flex items-start space-x-1.5">
                              <span className="font-bold text-zinc-950">Sourcing Edge:</span>
                              <span>{bale.profitOpportunity}</span>
                            </div>
                          </div>

                          <motion.button
                            onClick={() => handleAddToCart(bale, "bale")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all"
                          >
                            Source Bulk Bale
                          </motion.button>
                        </div>
                      </div>
                      </TiltCard>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= BUSINESS GROWTH ACADEMY ================= */}
        {currentView === "academy" && (
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8 space-y-10">
            <PageBanner
              eyebrow="Business Growth Academy"
              title="Knowledge Sourcing Classroom"
              description="Professional business systems, pricing math, and digital marketing secrets to build long-term legacy profits."
              image={IMAGES.academy.hero}
            >
              <div className="glass-dark rounded-2xl p-4 text-center shrink-0 min-w-[200px]">
                <span className="text-sm font-bold text-amber-400 uppercase tracking-widest">Your Student Record</span>
                <p className="text-2xl font-black text-white mt-1">
                  {user ? `${user.completedLessons.length} / ${ACADEMY_LESSONS.length}` : "0 / 4"}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Lessons Mastered</p>
              </div>
            </PageBanner>

            {/* Split Classroom view */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Lesson items list */}
              <div className="space-y-4 lg:col-span-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">CLASSROOM CURRICULUM</span>
                {ACADEMY_LESSONS.map((lesson) => {
                  const isCompleted = user?.completedLessons.includes(lesson.id);
                  const isSelected = activeLesson?.id === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`cursor-pointer rounded-2xl overflow-hidden border transition-all text-left ${
                        isSelected 
                          ? "bg-zinc-950 border-zinc-950 text-white shadow-xl scale-[1.02]"
                          : "bg-white border-zinc-200/50 hover:border-zinc-300 hover:shadow-md text-zinc-800"
                      }`}
                    >
                      <div className="relative h-28 overflow-hidden">
                        <img src={ACADEMY_IMAGES[lesson.id]} alt={lesson.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className={`absolute inset-0 ${isSelected ? "bg-zinc-950/60" : "bg-zinc-950/30"}`} />
                        {isCompleted && (
                          <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? "text-amber-500" : "text-zinc-400"}`}>
                          {lesson.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="text-[9px] px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full font-bold">
                            {lesson.duration}
                          </span>
                          {isCompleted && (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-sm leading-snug">{lesson.title}</h3>
                      <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                        {lesson.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className={`text-[10px] font-bold ${isSelected ? "text-white" : "text-amber-600"}`}>
                          {lesson.difficulty}
                        </span>
                        <span className="text-[9px] font-bold font-mono text-emerald-500">
                          {lesson.estimatedIncomeIncrease}
                        </span>
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Active reading sheet */}
              <div className="lg:col-span-2">
                {activeLesson ? (
                  <div className="bg-white rounded-3xl p-8 border border-zinc-200/60 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{activeLesson.category}</span>
                        <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900 mt-1">{activeLesson.title}</h2>
                      </div>
                      <button 
                        onClick={() => setActiveLesson(null)}
                        className="text-xs font-semibold text-zinc-400 hover:text-zinc-800"
                      >
                        Close Read
                      </button>
                    </div>

                    <div className="prose prose-sm text-xs md:text-sm text-zinc-600 space-y-4 max-w-none leading-relaxed">
                      {activeLesson.content.split("\n\n").map((para, pIdx) => {
                        if (para.startsWith("# ")) {
                          return <h3 key={pIdx} className="text-lg font-extrabold text-zinc-900 pt-3">{para.replace("# ", "")}</h3>;
                        }
                        if (para.startsWith("## ")) {
                          return <h4 key={pIdx} className="text-sm font-bold text-zinc-900 pt-2 border-b border-zinc-100 pb-1">{para.replace("## ", "")}</h4>;
                        }
                        if (para.startsWith("- ") || para.startsWith("* ")) {
                          return (
                            <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2">
                              {para.split("\n").map((li, lIdx) => (
                                <li key={lIdx}>{li.replace(/^[\s-*]+/, "")}</li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={pIdx}>{para}</p>;
                      })}
                    </div>

                    <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                      <div className="text-xs text-zinc-400 font-medium">
                        Expected outcome: <span className="font-semibold text-emerald-600">{activeLesson.estimatedIncomeIncrease}</span>
                      </div>

                      {user?.completedLessons.includes(activeLesson.id) ? (
                        <span className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold">
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>Lesson Mastered</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteLesson(activeLesson.id)}
                          className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-full font-bold text-xs tracking-wider uppercase transition-all"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900 text-white rounded-3xl p-12 text-center space-y-4 border border-zinc-800">
                    <BookOpen className="h-10 w-10 text-amber-500 mx-auto" />
                    <h3 className="text-xl font-bold tracking-tight">Select a Lesson from the Left</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Select any strategic masterclass topic to read the direct advice from Portmetals advisors. Track and record your progress to unlock premium wholesale discount vouchers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= REFURBISHED TECH STORE ================= */}
        {currentView === "tech" && (
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8 space-y-10">
            <PageBanner
              eyebrow="Refurbished Electronics"
              title="Certified Refurbished Technology"
              description="Imported from European corporate offices, tested, graded, and certified with warranty. Set up your digital showroom workspace affordably."
              image={IMAGES.tech.hero}
            >
              <div className="glass-dark rounded-2xl p-4 border border-emerald-500/20 flex items-center space-x-3 text-left">
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-xs text-white">Warranty Protection</h4>
                  <p className="text-[10px] text-zinc-400">Up to 12 months full warranty cover.</p>
                </div>
              </div>
            </PageBanner>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REFURBISHED_TECH.map((tech) => (
                <TiltCard key={tech.id} intensity={6}>
                <div 
                  className="card-shine bg-white rounded-[20px] overflow-hidden border border-zinc-200/50 shadow-sm flex flex-col hover:border-amber-500/60 hover:shadow-xl transition-all duration-500 group h-full"
                >
                  <div className="relative h-40 overflow-hidden bg-zinc-100">
                    <img
                      src={TECH_IMAGES[tech.id]}
                      alt={tech.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-extrabold text-white uppercase tracking-widest bg-zinc-950/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {tech.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-[9px] font-bold text-emerald-300 bg-emerald-900/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {tech.warranty}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 group-hover:text-amber-600 transition-colors">{tech.name}</h3>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="text-[9px] px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded font-bold uppercase">
                          {tech.condition}
                        </span>
                        <span className="text-[10px] text-zinc-400">Stock: {tech.stock} units</span>
                      </div>
                    </div>

                    <div className="border-t border-b border-zinc-100 py-3 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">HARDWARE SPECS</p>
                      <ul className="text-xs text-zinc-600 space-y-1">
                        {tech.specs.map((spec, sIdx) => (
                          <li key={sIdx} className="flex items-center space-x-1.5">
                            <span className="h-1 w-1 rounded-full bg-zinc-400"></span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-zinc-400">WHOLESALE VALUE</p>
                      <span className="text-base font-extrabold text-zinc-900">
                        {formatPrice(tech.priceTZS, selectedCurrency)}
                      </span>
                    </div>

                    <motion.button
                      onClick={() => handleAddToCart(tech, "tech")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-zinc-950 text-white rounded-xl font-bold text-xs flex items-center space-x-1"
                    >
                      <Laptop className="h-3.5 w-3.5 text-amber-500" />
                      <span>Request Sourcing</span>
                    </motion.button>
                  </div>
                  </div>
                </div>
                </TiltCard>
              ))}
            </div>
          </div>
        )}

        {/* ================= PROFILE / ENTREPRENEUR DASHBOARD ================= */}
        {currentView === "profile" && (
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8 space-y-10">
            {user ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Profile card left */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-zinc-200/50 shadow-sm space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white text-lg">
                        {user.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-zinc-950">{user.name}</h3>
                        <p className="text-[11px] text-zinc-400 font-semibold">{user.businessName}</p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-4 space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Contact Email:</span>
                        <span className="text-zinc-900 font-medium">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Mobile Phone:</span>
                        <span className="text-zinc-900 font-medium">{user.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Main Location:</span>
                        <span className="text-zinc-900 font-medium">{user.businessLocation}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold text-xs transition-all"
                    >
                      Sign Out
                    </button>
                  </div>

                  {/* Quick System Action */}
                  <div className="bg-zinc-900 text-white rounded-2xl p-5 space-y-4">
                    <h4 className="font-bold text-xs text-amber-500 uppercase tracking-widest">Growth Vouchers</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Complete all 4 masterclasses inside the Business Academy to unlock a wholesale transport voucher worth up to 100,000 TZS.
                    </p>
                    <button 
                      onClick={() => setCurrentView("academy")}
                      className="w-full py-2 bg-white text-zinc-950 hover:bg-zinc-100 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all"
                    >
                      Open Academy Classroom
                    </button>
                  </div>
                </div>

                {/* Dashboard logs & playbooks right */}
                <div className="lg:col-span-2 space-y-8">
                  {/* AI Playbook Area */}
                  {isQuoteLoading && (
                    <div className="bg-white rounded-3xl p-8 border border-zinc-200/50 shadow-sm text-center space-y-4">
                      <RefreshCw className="h-8 w-8 text-amber-600 animate-spin mx-auto" />
                      <h3 className="font-extrabold text-base text-zinc-900">Amani's AI Quote Advisor Analyzing</h3>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                        Formulating optimal unit economics, estimated retail targets inside {user.businessLocation}, and social media marketing calendars...
                      </p>
                    </div>
                  )}

                  {quotePlaybook && !isQuoteLoading && (
                    <div className="bg-amber-950/20 border border-amber-200 rounded-3xl p-6 md:p-8 space-y-4">
                      <div className="flex justify-between items-center border-b border-amber-200/50 pb-3">
                        <div className="flex items-center space-x-2">
                          <Sparkle className="h-5 w-5 text-amber-700 animate-pulse" />
                          <h3 className="font-extrabold text-sm md:text-base text-amber-900">Your AI Sourcing & Retail Playbook</h3>
                        </div>
                        <button 
                          onClick={() => setQuotePlaybook(null)}
                          className="text-[11px] font-bold text-amber-800 hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="prose prose-sm text-zinc-800 text-xs md:text-sm space-y-4 max-w-none leading-relaxed">
                        {quotePlaybook.split("\n\n").map((para, pIdx) => {
                          if (para.startsWith("# ")) {
                            return <h3 key={pIdx} className="text-base font-extrabold text-amber-950 pt-2">{para.replace("# ", "")}</h3>;
                          }
                          if (para.startsWith("## ")) {
                            return <h4 key={pIdx} className="text-xs font-bold text-amber-950 pt-1 uppercase tracking-widest border-b border-amber-200/35 pb-1">{para.replace("## ", "")}</h4>;
                          }
                          return <p key={pIdx}>{para}</p>;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Saved / submitted quotes */}
                  <div className="bg-white rounded-3xl p-6 border border-zinc-200/50 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-base text-zinc-900 border-b border-zinc-100 pb-3">
                      Sourcing History & Enquiries
                    </h3>

                    {user.submittedQuotes.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400 space-y-2">
                        <ShoppingCart className="h-8 w-8 text-zinc-300 mx-auto" />
                        <p className="text-xs font-medium">No previous bulk quotes submitted. Add items in Marketplace to generate advisor estimations.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {user.submittedQuotes.map((quote) => (
                          <div key={quote.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/50 space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[11px] font-bold text-zinc-400">{quote.date}</span>
                                <h4 className="font-bold text-xs text-zinc-900">{quote.id}</h4>
                              </div>
                              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                {quote.status}
                              </span>
                            </div>

                            <div className="space-y-1">
                              {quote.items.map((i) => (
                                <div key={i.id} className="flex justify-between text-[11px] text-zinc-600">
                                  <span>{i.name} (Qty: {i.quantity})</span>
                                  <span>{formatPrice(i.priceTZS * i.quantity, selectedCurrency)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-zinc-200/60 pt-2.5 flex justify-between items-center text-xs">
                              <span className="font-bold text-zinc-900">Estimated Sourcing Capital:</span>
                              <span className="font-extrabold text-amber-600">{formatPrice(quote.totalTZS, selectedCurrency)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-zinc-200/50 shadow-md">
                <div className="text-center space-y-2 mb-6">
                  <User className="h-8 w-8 text-amber-600 mx-auto" />
                  <h2 className="text-xl font-bold text-zinc-950">Entrepreneur Registration</h2>
                  <p className="text-xs text-zinc-400">Join Africa's leading wholesale system. Get access to smart price logs and AI-generated playbook advisors.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Fatma Omary"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. fatma@fashionbiz.co.tz"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. +255 754 888 999"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Business / Boutique Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Fatma Premium Fits"
                      value={regBizName}
                      onChange={(e) => setRegBizName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Target Showroom Region / Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dar es Salaam, Tanzania"
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-950 text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-md hover:bg-zinc-900 transition-all"
                  >
                    Create Free Profile
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= CONTACT / SHOWROOMS ================= */}
        {currentView === "contact" && (
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8 space-y-10">
            <PageBanner
              eyebrow="Our Showrooms"
              title="Visit Our Physical Hubs"
              description="Designed to inspire. Consult with business planners, inspect sorted categories behind glass, and pick up verified hardware technology."
              image={IMAGES.showroom.consultation}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <ScrollReveal className="space-y-6">
                <div className="grid grid-cols-1 gap-5">
                  <TiltCard intensity={5}>
                  <div className="rounded-[24px] overflow-hidden border border-zinc-200/50 shadow-sm">
                    <div className="relative h-48">
                      <img src={IMAGES.showroom.mombasa} alt="Mombasa showroom" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 image-overlay-gradient" />
                      <div className="absolute bottom-4 left-5">
                        <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest font-mono">PRIMARY WAREHOUSE & LOGISTICS HUB</span>
                        <h3 className="font-bold text-lg text-white mt-1">Mombasa Headquarters</h3>
                      </div>
                    </div>
                    <div className="p-5 bg-white space-y-2">
                      <p className="text-xs text-zinc-500 leading-relaxed">Ground Floor, Port Plaza, Mombasa-Malindi Highway, Shanzu, Mombasa.</p>
                      <div className="text-xs space-y-1 text-zinc-600">
                        <p><strong>Mobile:</strong> +254 700 111 222</p>
                        <p><strong>Hours:</strong> Mon - Sat: 8:00 AM - 5:30 PM</p>
                      </div>
                    </div>
                  </div>
                  </TiltCard>

                  <TiltCard intensity={5}>
                  <div className="rounded-[24px] overflow-hidden border border-zinc-200/50 shadow-sm">
                    <div className="relative h-48">
                      <img src={IMAGES.showroom.nairobi} alt="Nairobi consultation hub" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 image-overlay-gradient" />
                      <div className="absolute bottom-4 left-5">
                        <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest font-mono">CONSULTATION & TRADING REGION</span>
                        <h3 className="font-bold text-lg text-white mt-1">Nairobi Consultation Hub</h3>
                      </div>
                    </div>
                    <div className="p-5 bg-white space-y-2">
                      <p className="text-xs text-zinc-500 leading-relaxed">Senteu Plaza, Galana Road, Kilimani, Nairobi.</p>
                      <div className="text-xs space-y-1 text-zinc-600">
                        <p><strong>Mobile:</strong> +254 700 333 444</p>
                        <p><strong>Hours:</strong> Mon - Fri: 8:30 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                  </TiltCard>
                </div>

                <div className="rounded-[24px] overflow-hidden border border-zinc-200/50">
                  <img src={IMAGES.warehouse.bales} alt="Warehouse stock" className="w-full h-40 object-cover" />
                  <div className="p-4 bg-zinc-950 text-white">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Mombasa Warehouse</p>
                    <p className="text-sm font-semibold mt-1">Always Ready Stock • Fast Delivery • Professional Sorting</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Consultation Booking Form */}
              <ScrollReveal direction="left">
              <div className="bg-zinc-900 text-white rounded-[32px] p-8 border border-zinc-800 space-y-6 shadow-2xl">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Request an Invitation</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Ready to scale your clothing enterprise or electronic dealership? Book an exclusive appointment with a Senior Portmetals business planner inside our Nairobi or Mombasa hubs.
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setPartnerSent(true); }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Your Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Emmanuel John"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Mobile Number (WhatsApp preferred)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. +254 700 123 456"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Preferred Showroom Location</label>
                    <select 
                      required
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="mombasa">Mombasa Showroom & Warehouse</option>
                      <option value="nairobi">Nairobi Consultation Suite</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Estimated Sourcing Capital Budget</label>
                    <select 
                      required
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="starter">Below 500,000 TZS equivalent</option>
                      <option value="medium">500,000 - 1,500,000 TZS equivalent</option>
                      <option value="large">Above 1,500,000 TZS equivalent</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-white text-zinc-950 font-bold text-xs tracking-wider uppercase rounded-xl transition-all"
                  >
                    Confirm Booking Request
                  </button>
                </form>
              </div>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* ================= LEGAL PAGES ================= */}
        {currentView.startsWith("legal-") && (
          <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 sm:px-6 space-y-8">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-zinc-200/50 shadow-sm space-y-6">
              {currentView === "legal-terms" && (
                <>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950">Terms and Conditions of Sourcing</h1>
                  <p className="text-[11px] text-zinc-400">Effective Date: June 30, 2026</p>
                  
                  <div className="space-y-4 text-xs text-zinc-600 leading-relaxed">
                    <h3 className="font-bold text-zinc-900 text-sm">1. Sourcing and Ordering Definitions</h3>
                    <p>
                      Portmetals Africa General Supplies & Services operates exclusively as a wholesale supplier. All quotes submitted via our portal do not represent finalized purchase binding deeds but serve as bulk trade supply estimates.
                    </p>

                    <h3 className="font-bold text-zinc-900 text-sm">2. Quality Control & Sorted Grading Standards</h3>
                    <p>
                      Our clothing is sorted under stringent European guidelines. Minor aesthetic discrepancies are expected within recycled textiles, but we maintain that all premium graded categories are sorted cleanly to eliminate unwearable units completely.
                    </p>

                    <h3 className="font-bold text-zinc-900 text-sm">3. Logistics and Dispatch Timelines</h3>
                    <p>
                      Regional shipping times across Kenya, Tanzania, and wider East Africa depend heavily on third-party courier dispatch. Sourcing estimates do not encompass localized terminal tax duties unless explicitly quoted.
                    </p>
                  </div>
                </>
              )}

              {currentView === "legal-privacy" && (
                <>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950">Corporate Privacy and Data Stewardship</h1>
                  <p className="text-[11px] text-zinc-400">Effective Date: June 30, 2026</p>
                  
                  <div className="space-y-4 text-xs text-zinc-600 leading-relaxed">
                    <h3 className="font-bold text-zinc-900 text-sm">1. Collection of Entrepreneur Information</h3>
                    <p>
                      We strictly gather business information, locations, and transaction records to prepare optimal wholesale sourcing quotes, formulate AI retail playbooks, and track regional supply logs.
                    </p>

                    <h3 className="font-bold text-zinc-900 text-sm">2. Security of Transaction History</h3>
                    <p>
                      All submitted quotes, business profile attributes, and correspondence are preserved securely. We never sell or distribute entrepreneur contact points to external marketing networks.
                    </p>
                  </div>
                </>
              )}

              {currentView === "legal-cookie" && (
                <>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950">Regional Cookie and Localization Policy</h1>
                  <p className="text-[11px] text-zinc-400">Effective Date: June 30, 2026</p>
                  
                  <div className="space-y-4 text-xs text-zinc-600 leading-relaxed">
                    <h3 className="font-bold text-zinc-900 text-sm">1. Multi-Currency and Regional Storage</h3>
                    <p>
                      We utilize standard client localization storage (localStorage) to memorize your preferred trading currency (TZS, KES, USD) and preserve your cart categories across independent website visits. No tracking pixels are active.
                    </p>
                  </div>
                </>
              )}

              <div className="pt-6 border-t border-zinc-100">
                <button 
                  onClick={() => setCurrentView("home")}
                  className="px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Return to Main Overview
                </button>
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ================= SOURCING CART DRAWER ================= */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-zinc-200/60 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            <h3 className="font-extrabold text-sm text-zinc-950 uppercase tracking-wider">Sourcing Cart</h3>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-900"
          >
            Close Drawer
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 space-y-2">
              <ShoppingCart className="h-10 w-10 text-zinc-300 mx-auto" />
              <p className="text-xs font-medium">Your Sourcing Cart is currently empty.</p>
              <button 
                onClick={() => { setIsCartOpen(false); setCurrentView("marketplace"); }}
                className="text-[11px] font-bold text-amber-600 hover:underline"
              >
                Browse Wholesale Categories
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {cart.map((item) => (
                <div key={item.id} className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200/50 flex justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <span className="text-[8px] font-extrabold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                      {item.type === "product" ? "Fashion Lot" : item.type === "tech" ? "Hardware" : "Bulk Bale"}
                    </span>
                    <h4 className="font-bold text-xs text-zinc-950">{item.name}</h4>
                    {item.details && <span className="text-[10px] text-zinc-400">Specs: {item.details}</span>}
                    
                    <div className="text-[11px] text-zinc-900 font-extrabold pt-1">
                      {formatPrice(item.priceTZS, selectedCurrency)} each
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>

                    <div className="flex items-center space-x-2 bg-white border border-zinc-200 rounded px-1.5 py-0.5">
                      <button 
                        onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                        className="text-zinc-500 font-bold text-xs hover:text-zinc-900"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                        className="text-zinc-500 font-bold text-xs hover:text-zinc-900"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-500">Total Sourcing Overhead:</span>
            <span className="font-black text-sm text-zinc-950">
              {formatPrice(calculateTotal(), selectedCurrency)}
            </span>
          </div>

          <div className="space-y-2">
            {user ? (
              <button
                onClick={() => { setIsCartOpen(false); handleRequestQuotePlaybook(); }}
                disabled={cart.length === 0}
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all"
              >
                Submit Sourcing Quote Request
              </button>
            ) : (
              <button
                onClick={() => { setIsCartOpen(false); setCurrentView("profile"); }}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all text-center block"
              >
                Register to Sourcing Quote
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full py-2 bg-transparent text-zinc-500 hover:text-zinc-800 text-[11px] font-bold text-center"
            >
              Continue Sourcing Browse
            </button>
          </div>
        </div>
      </div>

      {/* ================= FLOATING ADVISOR CHAT ================= */}
      <div className="fixed bottom-6 right-6 z-40">
        {isChatOpen ? (
          <div className="bg-white border border-zinc-200 rounded-[24px] shadow-2xl w-80 md:w-96 h-[460px] flex flex-col justify-between overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white text-xs">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Advisor Amani Desk</h4>
                  <p className="text-[10px] text-zinc-400">Portmetals Lead Business Planner</p>
                </div>
              </div>

              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
              {chatMessages.map((msg, mIdx) => (
                <div 
                  key={mIdx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-[18px] px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-zinc-900 text-white"
                        : "bg-white border border-zinc-200 text-zinc-800 shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-zinc-200 text-zinc-400 text-xs px-3.5 py-2 rounded-[18px] animate-pulse">
                    Amani is writing strategic options...
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Inputs */}
            <div className="p-3 border-t border-zinc-100 flex items-center space-x-2 bg-white">
              <input
                type="text"
                placeholder="Ask about prices, margins, or sizing advice..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-600 text-zinc-900"
              />
              <button
                onClick={handleSendChat}
                className="h-8 w-8 rounded-full bg-zinc-950 text-white hover:bg-zinc-900 flex items-center justify-center transition-all shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={() => setIsChatOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ["0 10px 30px rgba(217,119,6,0.3)", "0 10px 40px rgba(217,119,6,0.5)", "0 10px 30px rgba(217,119,6,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-xl"
          >
            <MessageSquare className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      {/* Footer */}
      <Footer onNavigate={setCurrentView} />
    </div>
  );
}
