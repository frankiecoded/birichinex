export interface KnowledgeEntry {
  id: string;
  topic: string;
  subtopic: string;
  keywords: string[];
  content: string;
  tips: string[];
  examples: string[];
  relatedTopics: string[];
  category: 'platform' | 'business' | 'advisory' | 'operations' | 'finance' | 'marketing' | 'technology' | 'legal' | 'market-intelligence';
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PLATFORM (15 entries)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'birichinex-overview',
    topic: 'BirichiNex Platform',
    subtopic: 'Overview',
    keywords: ['birichinex', 'platform', 'overview', 'what is', 'about', 'system', 'ecosystem'],
    content: 'BirichiNex™ is a dual-shell business platform serving both customers (Shopping Shell) and businesses (Business Shell). It integrates 19 business capabilities including CRM, Inventory, Finance, Analytics, Dropshipping, Loyalty, Marketplace, Learning Academy, AI Advisor, and more. The Shopping Shell features a floating frosted-glass pill navigation with Apple Liquid Glass design. The Business Shell provides a full operating system with sidebar navigation across Commerce, Operations, Intelligence, and Growth sections. Philosophy: Technology should never dictate how businesses operate — businesses should define technology.',
    tips: [
      'Toggle between Shopping and Business modes using the mode toggle in the nav',
      'The floating pill nav collapses to a minimal frosted glass bar at the bottom',
      'All business data persists via Zustand with localStorage',
      'The AI Advisor can access your real business data when Context Toggle is ON',
    ],
    examples: [
      'A fashion retailer uses Shopping mode to browse bales, then switches to Business mode to manage inventory and track sales',
    ],
    relatedTopics: ['shopping-features', 'business-dashboard', 'currency-system'],
    category: 'platform',
  },
  {
    id: 'shopping-features',
    topic: 'BirichiNex Platform',
    subtopic: 'Shopping Shell',
    keywords: ['shopping', 'shop', 'browse', 'products', 'cart', 'categories', 'fashion', 'technology'],
    content: 'The Shopping Shell provides a premium e-commerce experience with 3D components (ParticleField, HeroScene3D, TiltCard), product browsing across Fashion and Technology categories, wholesale bales, and a deals section. Products display with grade ratings (A+ to C), supplier info, and multi-currency pricing. The floating pill nav at bottom center provides quick access to Home, Fashion, Tech, Deals, Orders, Cart, and Account.',
    tips: [
      'Use the currency selector (TZS, KES, UGX, RWF, USD) to see prices in your preferred currency',
      'The Deals section features flash sales with countdown timers and bundle offers',
      'Click any product to see full details, specifications, and add to cart',
      'Wholesale Bales offer bulk pricing for resellers starting from 25kg',
    ],
    examples: [
      'A buyer in Nairobi browses Fashion, finds a 45kg wholesale bale at TZS 700,000 (~KES 42,000), adds to cart, and checks out with M-Pesa',
    ],
    relatedTopics: ['checkout-system', 'marketplace-system', 'currency-system'],
    category: 'platform',
  },
  {
    id: 'checkout-system',
    topic: 'BirichiNex Platform',
    subtopic: 'Checkout & Payments',
    keywords: ['checkout', 'payment', 'mpesa', 'airtel', 'bank', 'card', 'cod', 'cash on delivery', 'order'],
    content: 'BirichiNex checkout is a 3-step flow: Shipping (address + delivery zone) → Payment (method selection) → Confirmation (order ID + ETA). Five payment methods supported: M-Pesa (most popular in Kenya/Tanzania), Airtel Money, Bank Transfer, Card Payment, and Cash on Delivery. Each payment method shows relevant instructions. Orders generate a unique PM-XXXXXXXX tracking number. Loyalty points are automatically earned at 1 point per 150 KES spent.',
    tips: [
      'M-Pesa is the fastest payment method — confirmations arrive in seconds',
      'Cash on Delivery adds a small fee and is only available in select zones',
      'Bank transfers take 1-2 business days to confirm',
      'Earn loyalty points on every purchase — tier multipliers apply (up to 3x for Platinum)',
    ],
    examples: [
      'Customer places a TZS 500,000 order, pays via M-Pesa, earns 3,333 loyalty points (Platinum 3x multiplier), receives order ID PM-KE-2026-001',
    ],
    relatedTopics: ['loyalty-points', 'order-tracking', 'currency-system'],
    category: 'platform',
  },
  {
    id: 'business-dashboard',
    topic: 'BirichiNex Platform',
    subtopic: 'Business Dashboard',
    keywords: ['dashboard', 'business', 'overview', 'kpis', 'analytics', 'widgets', 'home'],
    content: 'The Business Dashboard provides a bird\'s-eye view with KPI cards (Revenue, Orders, Customers, Growth), activity feed with recent transactions and CRM updates, quick action buttons to common tasks, and analytics widgets showing top products and revenue trends. The sidebar navigation organizes capabilities into Commerce (Marketplace, Dropshipping, Inventory, Procurement, Logistics), Operations (CRM, Payments, Finance, Documents), Intelligence (AI, Analytics, Automation), and Growth (Entrepreneur Hub, Learning, Loyalty, Community, Profile, Settings, Membership).',
    tips: [
      'Click any KPI card to drill down into detailed analytics',
      'The activity feed shows the last 10 actions across all modules',
      'Quick actions provide one-click access to your most-used features',
      'The dashboard updates in real-time as you add transactions and contacts',
    ],
    examples: [
      'Dashboard shows TZS 2.5M revenue this month, 45 orders, 120 contacts, 12% growth — all from live store data',
    ],
    relatedTopics: ['crm-system', 'inventory-management', 'finance-module'],
    category: 'platform',
  },
  {
    id: 'crm-system',
    topic: 'BirichiNex Platform',
    subtopic: 'CRM & Contacts',
    keywords: ['crm', 'contacts', 'customers', 'leads', 'pipeline', 'relationship', 'prospect'],
    content: 'The CRM module manages business contacts with full CRUD operations. Each contact has: name, email, phone, company, type (supplier/customer/partner/distributor), status (Lead → Prospect → Active → Inactive), tags, notes, and location. Features include search by name/company, filter by status/type, pipeline view showing contacts by stage, and activity logging. Contacts are the foundation for sales tracking and relationship management.',
    tips: [
      'Tag contacts with categories like "VIP", "Wholesale", "Retail" for easy filtering',
      'Use the pipeline view to see how many leads are at each stage',
      'Add notes after every interaction to maintain relationship context',
      'Import contacts in bulk via the CSV import feature',
    ],
    examples: [
      'A textile business has 120 contacts: 30 suppliers (China, India), 60 active customers, 20 leads from trade shows, 10 distribution partners',
    ],
    relatedTopics: ['business-dashboard', 'inventory-management', 'customer-acquisition'],
    category: 'platform',
  },
  {
    id: 'inventory-management',
    topic: 'BirichiNex Platform',
    subtopic: 'Inventory & Stock',
    keywords: ['inventory', 'stock', 'items', 'warehouse', 'alerts', 'reorder', 'quantity'],
    content: 'Inventory Management tracks all products with: name, SKU, category, quantity, cost price, selling price, reorder level, location, supplier, and source (manual entry or dropship). Low-stock alerts trigger when quantity falls below reorder level. Items sourced from dropshipping display a "Dropship" badge. Items can be posted to or removed from the marketplace with "Sell"/"Unlist" buttons. Search by name or category. Inventory integrates with sales — when an order is placed, stock decreases automatically.',
    tips: [
      'Set reorder levels at 20% of your typical monthly sales to avoid stockouts',
      'Use the "Sell" button to list inventory items on the marketplace with your markup',
      'Dropship items automatically appear in inventory when you choose "Store in Inventory" at checkout',
      'Run inventory audits monthly — count physical stock vs system stock',
    ],
    examples: [
      'Business has 45 inventory items: 30 manual entries (wholesale bales, local purchases), 15 dropship items (electronics from suppliers). 5 items below reorder level trigger alerts.',
    ],
    relatedTopics: ['marketplace-system', 'order-tracking', 'inventory-forecasting'],
    category: 'platform',
  },
  {
    id: 'finance-module',
    topic: 'BirichiNex Platform',
    subtopic: 'Finance & Transactions',
    keywords: ['finance', 'transactions', 'income', 'expense', 'money', 'revenue', 'profit', 'budget'],
    content: 'The Finance module tracks all monetary transactions with: type (income/expense), category, amount, currency, description, status (completed/pending/failed), date, and payment reference. Categories include Sales, Purchases, Shipping, Marketing, Rent, Salaries, Utilities, and more. Features include transaction filtering by type/status/category, financial summaries (total income, total expenses, net profit), and export capabilities. All amounts support multi-currency display.',
    tips: [
      'Categorize every transaction immediately — don\'t let them pile up as "uncategorized"',
      'Review your top 3 expense categories monthly — look for reduction opportunities',
      'Track both cash and mobile money transactions separately',
      'Set up a monthly financial review to compare actual vs budgeted spending',
    ],
    examples: [
      'Monthly view: TZS 5.2M income (42 sales), TZS 3.1M expenses (suppliers, rent, marketing), TZS 2.1M net profit (40% margin)',
    ],
    relatedTopics: ['cash-flow-management', 'pricing-mathematics', 'invoice-management'],
    category: 'platform',
  },
  {
    id: 'learning-academy',
    topic: 'BirichiNex Platform',
    subtopic: 'Learning Academy',
    keywords: ['learning', 'courses', 'education', 'training', 'lessons', 'academy', 'study'],
    content: 'The Learning Academy offers courses across 5 categories: Business Fundamentals, Financial Literacy, Digital Marketing, Supply Chain, and Technology. Each course has structured lessons with content, duration, and completion tracking. Courses are tiered (Silver/Gold/Platinum) — higher membership tiers unlock more courses. Completing courses earns loyalty points and vouchers. Progress is tracked per-lesson with percentage completion.',
    tips: [
      'Start with "Starting Your Business in East Africa" if you\'re new to entrepreneurship',
      'Complete courses to earn loyalty points — some offer 500-2000 TZS vouchers',
      'The WhatsApp Business Masterclass is the fastest way to start selling (5 lessons, 45 min)',
      'Higher membership tiers unlock advanced courses on investment and scaling',
    ],
    examples: [
      'A new entrepreneur completes 3 beginner courses in a week, earns 1,500 loyalty points, and unlocks intermediate supply chain courses',
    ],
    relatedTopics: ['membership-tiers', 'loyalty-points', 'e-commerce-strategy'],
    category: 'platform',
  },
  {
    id: 'ai-assistant',
    topic: 'BirichiNex Platform',
    subtopic: 'AI Business Advisor',
    keywords: ['ai', 'assistant', 'advisor', 'artificial intelligence', 'chat', 'help', 'advice'],
    content: 'The BirichiNex AI Advisor is a comprehensive business advisory system with a 100+ entry knowledge base covering platform features, business strategy, finance, marketing, operations, compliance, and East African market intelligence. It features intent classification with 100+ patterns, entity extraction, conversation memory, and a Context Toggle that incorporates your real business data (inventory, transactions, contacts, loyalty) into personalized responses. The system supports API integration with OpenAI and Anthropic, with local fallback for offline use.',
    tips: [
      'Turn ON the Context Toggle to get advice based on your actual business data',
      'Ask specific questions for better answers — "How should I price cotton shirts in Nairobi?" beats "pricing advice"',
      'The AI remembers your conversation context — ask follow-up questions',
      'Configure API keys in Settings to use GPT-4o or Claude for even smarter responses',
    ],
    examples: [
      'With Context ON, asking "How\'s my inventory?" returns: "You have 45 items, 5 below reorder. Your top mover is Cotton Shirts (500 units). Consider restocking Ladies Jeans (350 left, selling 12/day)."',
    ],
    relatedTopics: ['birichinex-overview', 'business-dashboard', 'membership-tiers'],
    category: 'platform',
  },
  {
    id: 'dropshipping-system',
    topic: 'BirichiNex Platform',
    subtopic: 'Dropshipping',
    keywords: ['dropship', 'dropshipping', 'supplier', 'fulfillment', 'deliver', 'source'],
    content: 'BirichiNex Dropshipping connects you to suppliers with 4 subscription tiers: Starter (free, 5% discount, 50 products), Growth (KES 5,000/mo, 15% discount, 200 products), Pro (KES 15,000/mo, 25% discount, 500 products), Enterprise (KES 50,000/mo, 35% discount, unlimited). When placing a dropship order, you choose fulfillment: "Deliver to Customer" (ship directly to them) or "Store in Inventory" (add to your stock for later sale). The catalog includes 40+ products across Electronics, Fashion, Home, Beauty, and Accessories.',
    tips: [
      'Start with the Growth tier — the 15% discount covers the monthly fee after just KES 33,333 in orders',
      'Use "Store in Inventory" for products you sell regularly — it\'s cheaper per unit than per-order fulfillment',
      'Check the catalog weekly — new products are added based on market demand',
      'You can downgrade tiers but lose the higher discount rate',
    ],
    examples: [
      'Pro subscriber orders 10 MacBook Airs at 25% discount (TZS 850K each → TZS 637.5K), saves TZS 2.125M on one order',
    ],
    relatedTopics: ['inventory-management', 'membership-tiers', 'sourcing-strategy'],
    category: 'platform',
  },
  {
    id: 'membership-tiers',
    topic: 'BirichiNex Platform',
    subtopic: 'Membership',
    keywords: ['membership', 'subscription', 'tier', 'silver', 'gold', 'platinum', 'enterprise', 'plan'],
    content: 'Four membership tiers: Silver (KES 50,000/mo) — Basic AI access, 1 user seat, standard analytics, email support. Gold (KES 150,000/mo) — Advanced AI, 3 user seats, custom reports, priority support, dropshipping access. Platinum (KES 400,000/mo) — Full AI suite, 10 user seats, white-label options, dedicated account manager, API access. Enterprise (Custom pricing) — Unlimited users, custom integrations, SLA guarantee, on-site training, multi-branch support. You can upgrade or downgrade anytime — downgrades take effect at the next billing cycle.',
    tips: [
      'Gold tier is the sweet spot for most growing businesses — the AI and analytics alone justify the cost',
      'Platinum includes API access — integrate BirichiNex with your existing POS or ERP systems',
      'Enterprise pricing is negotiated based on user count and feature needs',
      'All tiers include the core platform — you\'re paying for AI power, seats, and support level',
    ],
    examples: [
      'A fashion retailer upgrades from Silver to Gold after hitting 50 contacts and needing better analytics — the custom reports help identify their top 20% of customers generating 80% of revenue',
    ],
    relatedTopics: ['ai-assistant', 'loyalty-points', 'dropshipping-system'],
    category: 'platform',
  },
  {
    id: 'loyalty-points',
    topic: 'BirichiNex Platform',
    subtopic: 'Loyalty Program',
    keywords: ['loyalty', 'points', 'rewards', 'earn', 'redeem', 'tier', 'bronze', 'silver', 'gold', 'platinum'],
    content: 'Earn 1 loyalty point for every 150 KES spent. Tier multipliers: Bronze (1x, default), Silver (1.5x, earned at 500K total spend), Gold (2x, at 2M), Platinum (3x, at 5M). Points are redeemable ONLY for products (not subscriptions). Maximum 30% of order value can be paid with points. Points expire after 1 year. History tracks all earnings and redemptions with timestamps and descriptions.',
    tips: [
      'Points can ONLY be used for product purchases — not for subscriptions or memberships',
      'At Platinum tier with 3x multiplier, a 150K purchase earns 3 points instead of 1',
      'Redeem points before they expire — set a calendar reminder at 11 months',
      'The loyalty page shows your progress toward the next tier and estimated time to reach it',
    ],
    examples: [
      'A Gold customer (2x multiplier) spends 300K on products → earns 4 points (2 base × 2 multiplier). Over a year, accumulates 500 points → worth 500 KES in product discounts.',
    ],
    relatedTopics: ['membership-tiers', 'checkout-system', 'pricing-strategy'],
    category: 'platform',
  },
  {
    id: 'marketplace-system',
    topic: 'BirichiNex Platform',
    subtopic: 'Marketplace',
    keywords: ['marketplace', 'listing', 'sell', 'products', 'categories', 'grade', 'supplier'],
    content: 'The BirichiNex Marketplace features 22+ product categories with items graded A+ (premium) to C (economy). Each listing shows: product name, description, grade, price (multi-currency), supplier, origin country, specifications, stock level, and minimum order quantity. Items can be sourced from your own inventory (manual) or from dropshippers. Posted items display "Listed" badges. Search and filter by category, price range, and grade.',
    tips: [
      'Grade A+ items command 30-50% premium over Grade B — ensure quality justifies the grade',
      'Set minimum order quantities to ensure each sale is profitable after shipping',
      'Post your inventory items to the marketplace to reach more buyers',
      'Cross-reference marketplace prices with your costs to maintain healthy margins',
    ],
    examples: [
      'Marketplace shows 16 fashion items (8 products × 2 variants) and 8 tech items. A buyer filters by "A+ Grade Laptops" and finds MacBook Air M2 at TZS 850K.',
    ],
    relatedTopics: ['inventory-management', 'pricing-strategy', 'wholesale-business'],
    category: 'platform',
  },
  {
    id: 'order-tracking',
    topic: 'BirichiNex Platform',
    subtopic: 'Order Tracking',
    keywords: ['tracking', 'order', 'map', 'delivery', 'eta', 'timeline', 'shipping', 'route'],
    content: 'The Order Tracking system uses Leaflet maps with animated markers to show all orders in real-time. Features: interactive dark-themed map of East Africa, pulsing status-colored markers, origin/destination pins, dashed polyline routes, ETA countdown timers, full reverse-chronological timeline, tracking number copy, and delivery pricing calculator. Orders are categorized by status: Placed → Confirmed → Processing → Picked Up → In Transit → Out for Delivery → Delivered. The pricing tab shows Nairobi zone pricing (17 zones), country-level pricing for Kenya/Tanzania/Uganda/Rwanda, and cross-border route costs.',
    tips: [
      'Click any order on the map to see its full timeline and route',
      'Use the status filter to focus on orders needing attention (e.g., "In Transit")',
      'The pricing calculator helps you quote delivery costs to customers instantly',
      'Cross-border orders take 3-4 days — factor this into customer promises',
    ],
    examples: [
      'Order PM-TZ-2026-001 (Men Cotton Shirt ×5) is in transit from Dar es Salaam to Nairobi, currently near Arusha, ETA 12 hours. Route shown as dashed teal line on map.',
    ],
    relatedTopics: ['checkout-system', 'logistics-planning', 'delivery-pricing'],
    category: 'platform',
  },
  {
    id: 'currency-system',
    topic: 'BirichiNex Platform',
    subtopic: 'Multi-Currency',
    keywords: ['currency', 'exchange', 'rates', 'tzs', 'kes', 'ugx', 'rwf', 'usd', 'convert'],
    content: 'BirichiNex supports 5 currencies: Tanzanian Shilling (TZS), Kenyan Shilling (KES), Ugandan Shilling (UGX), Rwandan Franc (RWF), and US Dollar (USD). All product prices are stored in TZS and converted in real-time using exchange rates. The currency selector in the shopping shell applies to all displayed prices. Exchange rates: 1 USD ≈ 2,500 TZS, 1 USD ≈ 150 KES, 1 USD ≈ 3,700 UGX, 1 USD ≈ 1,300 RWF. All financial calculations use the selected currency for display.',
    tips: [
      'Always check prices in your local currency to avoid conversion surprises',
      'USD pricing is useful for international supplier negotiations',
      'Exchange rates are approximate — actual rates may vary at time of payment',
      'The finance module shows all amounts in your selected currency',
    ],
    examples: [
      'A product priced at TZS 27,000 displays as KES 1,620 (÷150) or UGX 5,940 (÷4.54) or USD 10.80',
    ],
    relatedTopics: ['checkout-system', 'finance-module', 'pricing-mathematics'],
    category: 'platform',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS ADVISORY (20 entries)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sourcing-strategy',
    topic: 'Sourcing',
    subtopic: 'Product Sourcing',
    keywords: ['sourcing', 'supplier', 'find', 'where', 'buy', 'wholesale', 'alibaba', 'china', 'india'],
    content: 'East African businesses source from three tiers: Local (Gikomba Market Nairobi, Kariakoo Dar, Owino Kampala — best for mitumba/secondhand), Regional (manufacturers in Kenya/Tanzania — textiles, food processing), and International (China via Alibaba/Globalsources, India, Turkey, UAE — best for electronics, new fashion, raw materials). China sourcing requires minimum orders of 500-1000 units. Alibaba MOQ is typically 10-100 units. India excels in textiles and spices. Turkey is strong in leather and fashion. UAE/Dubai offers electronics and re-exports.',
    tips: [
      'Start with local sourcing to test demand before committing to international orders',
      'Always order samples before placing bulk orders — budget 5-10% of order for sampling',
      'Use Alibaba Trade Assurance for buyer protection on first-time suppliers',
      'Visit Trade Shows: Canton Fair (China), Magic Show (USA), Texworld (France) — or local ones like Kenyan International Trade Fair',
    ],
    examples: [
      'A Nairobi fashion retailer sources cotton shirts from Dhaka, Bangladesh at $3.50/pc (MOQ 500), sells at KES 800 ($5.30) — 51% markup after shipping.',
    ],
    relatedTopics: ['wholesale-business', 'supply-chain-optimization', 'quality-control'],
    category: 'advisory',
  },
  {
    id: 'pricing-strategy',
    topic: 'Pricing',
    subtopic: 'Pricing Strategy',
    keywords: ['pricing', 'price', 'margin', 'markup', 'discount', 'strategy', 'how much', 'charge'],
    content: 'Four core pricing strategies for East African markets: (1) Cost-Plus: Calculate total landed cost (product + shipping + duties + handling) then add 30-100% markup. (2) Value-Based: Price based on perceived customer value — premium brands use 200-500% markup. (3) Competitive: Match or undercut competitors — monitor Jumia, Kilimall, Instagram sellers. (4) Psychological: Use charm pricing (KES 999 instead of 1,000), bundle pricing (3 for 2), anchor pricing (show original price crossed out). For mitumba/wholesale: typical margins are 50-200%. For electronics: 15-40%. For fashion: 80-300%.',
    tips: [
      'Never compete on price alone — add value through service, packaging, or convenience',
      'Test prices in small batches before changing your whole catalog',
      'Factor in ALL costs: product, shipping, duties, M-Pesa fees (2%), rent, staff, packaging',
      'Bundle slow-moving items with popular ones to clear inventory while maintaining margins',
    ],
    examples: [
      'Shirt cost: TZS 5,000 (product) + TZS 500 (shipping) + TZS 250 (duties) = TZS 5,750 landed. At 100% markup → sell at TZS 11,500. After M-Pesa fee (2% = TZS 230), net margin = TZS 5,520 (96% markup on cost).',
    ],
    relatedTopics: ['pricing-mathematics', 'wholesale-business', 'revenue-optimization'],
    category: 'advisory',
  },
  {
    id: 'market-entry-kenya',
    topic: 'Market Entry',
    subtopic: 'Kenya',
    keywords: ['kenya', 'nairobi', 'register', 'ecitizen', 'kra', 'license', 'start', 'entry'],
    content: 'Starting a business in Kenya: (1) Register via eCitizen platform (KES 10,000-25,000), (2) Get KRA PIN (free, same day), (3) Register for VAT if turnover >KES 5M/year, (4) County business license (KES 5,000-50,000 depending on county and category), (5) Open a business bank account. Nairobi is the commercial hub with 60% of formal retail. Mombasa is the port city — best for import/export. Kisumu serves the Lake Region. Key sectors: retail, agriculture, real estate, fintech, tourism. Mobile money penetration is 85%+ — every business must accept M-Pesa.',
    tips: [
      'eCitizen registration takes 1-3 days — have your ID and passport photo ready',
      'KRA PIN is mandatory for all business transactions — get it before opening a bank account',
      'Nairobi County license costs depend on business category and location (CBD vs suburbs)',
      'Join the Kenya Association of Manufacturers (KAM) for networking and advocacy',
    ],
    examples: [
      'Fashion retailer in Nairobi Westlands: eCitizen (KES 15K) + KRA PIN (free) + County License (KES 25K) + Shop Deposit (KES 50K) = KES 90K startup cost. Monthly: Rent 80K + Staff 40K + Stock 200K = KES 320K.',
    ],
    relatedTopics: ['market-entry-tanzania', 'compliance-guide', 'tax-compliance-kenya'],
    category: 'advisory',
  },
  {
    id: 'market-entry-tanzania',
    topic: 'Market Entry',
    subtopic: 'Tanzania',
    keywords: ['tanzania', 'dar', 'dodoma', 'brela', 'tin', 'register', 'start'],
    content: 'Starting a business in Tanzania: (1) Register via BRELA (Business Registrations and Licensing Agency) online portal (TZS 50,000-200,000), (2) Get TIN (Taxpayer Identification Number) from TRA, (3) Register for VAT if turnover >TZS 200M/year, (4) Obtain a business license from your municipality. Dar es Salaam is the commercial capital — 90% of import/export passes through Dar port. Arusha is the tourism gateway (Serengeti, Ngorongoro). Dodoma is the political capital. Key sectors: agriculture (40% GDP), mining, tourism, construction, textiles.',
    tips: [
      'BRELA registration can be done online — process takes 3-7 business days',
      'TANAPA (Tanzania National Parks Authority) is a huge market for safari-related products',
      'Dar es Salaam has the largest informal market (Kariakoo) — great for sourcing and selling',
      'Tanzania requires fiscal receipts for all transactions — invest in a proper POS system',
    ],
    examples: [
      'Import business in Dar: BRELA (TZS 150K) + TIN (free) + Municipal License (TZS 300K) + Trade License (TZS 200K) = TZS 650K startup. Monthly: Warehouse 500K + Staff 300K + Stock 2M.',
    ],
    relatedTopics: ['market-entry-kenya', 'import-regulations', 'tax-compliance-tanzania'],
    category: 'advisory',
  },
  {
    id: 'market-entry-uganda',
    topic: 'Market Entry',
    subtopic: 'Uganda',
    keywords: ['uganda', 'kampala', 'ursb', 'ura', 'register', 'start', 'jinja'],
    content: 'Starting a business in Uganda: (1) Register via URSB (Uganda Registration Services Bureau) — UGX 100,000-500,000, (2) Get TIN from URA (Uganda Revenue Authority), (3) Register for VAT if turnover >UGX 350M/year, (4) Obtain a trade license from KCCA (Kampala) or relevant municipality. Kampala is the commercial hub — Owino (St. Balikuddembe) Market is East Africa\'s largest informal market. Jinja is the industrial corridor (Nile Breweries, steel mills). Key sectors: agriculture, telecoms, real estate, tourism.',
    tips: [
      'URSB registration takes 1-5 days depending on business type',
      'Kampala City Council Authority (KCCA) license is separate from URSB registration',
      'Owino Market is perfect for wholesale clothing — negotiate hard, start with smaller quantities',
      'Uganda has strong dairy and agriculture sectors — related products sell well',
    ],
    examples: [
      'Electronics shop in Kampala: URSB (UGX 200K) + TIN (free) + KCCA License (UGX 300K) = UGX 500K (~KES 1,350) startup. Very affordable entry.',
    ],
    relatedTopics: ['market-entry-kenya', 'market-entry-tanzania', 'compliance-guide'],
    category: 'advisory',
  },
  {
    id: 'customer-acquisition',
    topic: 'Marketing',
    subtopic: 'Customer Acquisition',
    keywords: ['customer', 'acquisition', 'cac', 'get customers', 'find buyers', 'attract'],
    content: 'Customer Acquisition Cost (CAC) = Total Marketing Spend ÷ New Customers Acquired. In East Africa, typical CAC ranges: Social Media (KES 100-500/customer), WhatsApp (KES 50-200/customer), Referrals (KES 50-100/customer), Market Stalls (KES 200-1,000/customer). The most effective channels for EA: (1) WhatsApp Business — catalog + broadcasts, (2) Instagram — visual products, (3) Facebook Groups — community selling, (4) TikTok — product demos, (5) Referral programs — word-of-mouth is king.',
    tips: [
      'WhatsApp has the highest ROI for East African businesses — 80% of your customers are on it',
      'Start a referral program: give KES 100 credit for every new customer referred',
      'Join Facebook Groups in your niche — post valuable content, not just ads',
      'Instagram Reels showing product quality/authenticity build trust fast',
    ],
    examples: [
      'Boutique spends KES 50,000/month on Instagram ads, gets 200 clicks, converts 20 into buyers = CAC of KES 2,500. With average order of KES 5,000, that\'s 50% CAC ratio — too high. Switches to WhatsApp broadcasts (KES 5,000/month) → 50 customers = KES 100 CAC.',
    ],
    relatedTopics: ['digital-marketing-overview', 'whatsapp-business', 'referral-programs'],
    category: 'marketing',
  },
  {
    id: 'financial-planning',
    topic: 'Finance',
    subtopic: 'Financial Planning',
    keywords: ['financial', 'planning', 'budget', 'forecast', 'cash flow', 'emergency fund'],
    content: 'Financial planning for East African SMEs: (1) Emergency Fund — save 3-6 months of operating expenses before investing in growth. (2) Monthly Budget — allocate: 40% stock/inventory, 20% rent/utilities, 15% staff, 10% marketing, 10% savings, 5% miscellaneous. (3) Cash Flow Forecast — project income/expenses for next 90 days, update weekly. (4) Working Capital — you need at least 2x your monthly expenses in liquid capital to handle delays. (5) Profit Reinvest — reinvest 30-50% of profits into stock, 20% into marketing, save 20%.',
    tips: [
      'Separate personal and business finances from day one — open a business bank account',
      'Track every shilling — use BirichiNex Finance module for automatic categorization',
      'Negotiate 30-60 day payment terms with suppliers to improve cash flow',
      'Seasonal businesses should save 40% of peak-season profits for off-season',
    ],
    examples: [
      'Monthly: Revenue 3M, Costs 2.2M, Profit 800K. Allocation: Stock reinvestment 400K, Marketing 200K, Savings 160K, Emergency fund 40K. After 6 months: 240K emergency fund + 960K reinvested.',
    ],
    relatedTopics: ['cash-flow-management', 'budgeting-methods', 'cost-reduction'],
    category: 'finance',
  },
  {
    id: 'risk-management',
    topic: 'Risk',
    subtopic: 'Risk Management',
    keywords: ['risk', 'manage', 'protect', 'insurance', 'fraud', 'loss', 'mitigation'],
    content: 'Key risks for East African businesses: (1) Currency Risk — TZS/KES/UGX fluctuate; hedge by holding some USD stock. (2) Supply Chain — delays from China/India (21-30 days); maintain 2-month buffer stock. (3) Political — election years disrupt trade; diversify across countries. (4) Theft/Fraud — implement inventory controls, CCTV, daily reconciliation. (5) Weather — rainy season affects logistics; plan deliveries around weather. (6) Customer Default — COD orders have 5-10% default rate; use mobile money prepayment. (7) Regulatory — tax laws change; stay updated via KRA/TRA/URA bulletins.',
    tips: [
      'Never have more than 20% of capital in one supplier or one product category',
      'Get cargo insurance — it costs 1-2% of shipment value but saves you from total loss',
      'For COD deliveries, confirm orders via phone call before dispatching',
      'Keep digital backups of all receipts and contracts — tax audits happen',
    ],
    examples: [
      'Business with TZS 10M capital: Max 2M per supplier, max 2M per product category. Cargo insurance on all shipments (TZS 100K/year). 2-month buffer stock worth TZS 4M.',
    ],
    relatedTopics: ['insurance-coverage', 'supply-chain-optimization', 'currency-management'],
    category: 'advisory',
  },
  {
    id: 'compliance-guide',
    topic: 'Compliance',
    subtopic: 'Business Compliance',
    keywords: ['compliance', 'tax', 'vat', 'register', 'legal', 'license', ' regulation'],
    content: 'Essential compliance for East African businesses: (1) Business Registration — mandatory in all countries. (2) Tax Registration — KRA (Kenya), TRA (Tanzania), URA (Uganda), RRA (Rwanda). (3) VAT Registration — required above thresholds (Kenya KES 5M, Tanzania TZS 200M, Uganda UGX 350M). (4) Annual Returns — file company annual return with registrar. (5) Employment Compliance — PAYE, NSSF/NHIF contributions for employees. (6) Import Compliance — customs duties, KEBS/TBS/UNBS standards, import declarations. (7) Data Protection — comply with local data laws when collecting customer information.',
    tips: [
      'Set calendar reminders for all filing deadlines — penalties compound quickly',
      'Hire a local accountant for KES 10-20K/month — it pays for itself in avoided penalties',
      'Keep 7 years of financial records — it\'s the law in most EA countries',
      'Join your industry association for updates on regulatory changes',
    ],
    examples: [
      'Kenya retailer: Monthly VAT filing (by 20th), quarterly PAYE, annual returns (within 60 days of year-end). Late VAT penalty: 25% of tax due + 2% per month. Total potential penalty on TZS 100K VAT: TZS 145K.',
    ],
    relatedTopics: ['tax-compliance-kenya', 'tax-compliance-tanzania', 'tax-compliance-uganda'],
    category: 'legal',
  },
  {
    id: 'e-commerce-strategy',
    topic: 'E-Commerce',
    subtopic: 'Online Selling',
    keywords: ['ecommerce', 'e-commerce', 'online', 'instagram', 'whatsapp', 'jumia', 'kilimall', 'website'],
    content: 'East African e-commerce channels: (1) Instagram — best for fashion/beauty, 1M+ Kenyan businesses sell here. (2) WhatsApp Business — catalog, broadcasts, status updates — direct to customer. (3) Jumia/Kilimall — marketplace reach but 15-25% commission. (4) Facebook Marketplace — free listing, large audience. (5) TikTok — product demos go viral, 15M+ EA users. (6) Own Website — Shopify/WooCommerce, higher trust, but requires marketing spend. Social commerce (Instagram + WhatsApp) accounts for 60% of online sales in EA. Cash on Delivery is still 50%+ of transactions.',
    tips: [
      'Start with WhatsApp Business + Instagram — zero cost, maximum reach',
      'Post product photos daily on Instagram — use consistent branding and hashtags',
      'Create a WhatsApp Broadcast list for repeat customers — send new arrivals weekly',
      'Offer multiple payment options — M-Pesa for 80% of customers, COD for hesitant buyers',
    ],
    examples: [
      'Fashion seller: Instagram (15K followers, 50 DMs/day) → WhatsApp Business (catalog of 200 items) → M-Pesa payment → same-day delivery in Nairobi. Monthly: 400 orders × KES 3,000 avg = KES 1.2M revenue.',
    ],
    relatedTopics: ['whatsapp-business', 'instagram-selling', 'social-media-strategy'],
    category: 'marketing',
  },
  {
    id: 'wholesale-business',
    topic: 'Wholesale',
    subtopic: 'Wholesale & Bale Business',
    keywords: ['wholesale', 'bale', 'mitumba', 'bulk', 'resell', 'markup', 'volume'],
    content: 'Wholesale/Bale business in East Africa: Mitumba (secondhand clothing) bales cost $200-800 depending on origin (USA/UK/Korea) and weight (25-70kg). A 45kg bale from USA contains 150-180 pieces. Grading: Grade A (designer/pieces sell at KES 500-2000), Grade B (branded/mid-range KES 200-500), Grade C (basic KES 50-200). Average selling price per piece: KES 200-400. Total bale revenue: KES 30,000-72,000. Cost including shipping/customs: KES 25,000-50,000. Margin: 20-60%. Best ports: Mombasa (Kenya), Dar es Salaam (Tanzania). Import duty: 25% + VAT 16% (Kenya).',
    tips: [
      'Start with 1-2 bales to test quality before buying container loads',
      'Open bales in front of customers — the "unboxing" experience sells',
      'Separate pieces by grade immediately — sell Grade A at premium, Grade B at standard, Grade C in bundles',
      'Build relationships with clearing agents at the port for better rates and faster processing',
    ],
    examples: [
      'Buy 45kg USA bale: $500 (KES 75,000) + shipping $200 (KES 30,000) + duty KES 26,400 = KES 131,400 total. Yields 160 pieces. Sell: 20 × KES 800 + 80 × KES 300 + 60 × KES 150 = KES 55,000. Profit per bale: KES 55,000 (42% margin).',
    ],
    relatedTopics: ['sourcing-strategy', 'pricing-strategy', 'import-regulations'],
    category: 'advisory',
  },
  {
    id: 'cross-border-trade',
    topic: 'Trade',
    subtopic: 'Cross-Border',
    keywords: ['cross-border', 'import', 'export', 'customs', 'duty', 'clearing', 'border'],
    content: 'Cross-border trade in East Africa: COMESA (Common Market for Eastern and Southern Africa) reduces duties between member states. Rules of Origin certificate can reduce/eliminate duties within COMESA. Key borders: Namanga (Kenya-Tanzania), Busia (Kenya-Uganda), Taveta (Kenya-Tanzania). Clearing agents charge 2-5% of shipment value. Documentation needed: Commercial Invoice, Packing List, Bill of Lading/Airway Bill, Certificate of Origin, Import Declaration Form (Kenya), Customs Entry. Duty rates vary: Electronics 25%, Textiles 25-35%, Food 10-25%.',
    tips: [
      'Hire a clearing agent for your first 10 shipments — learn the process before doing it yourself',
      'COMESA Certificate of Origin can save 10-25% on duties between member states',
      'Air freight is faster (3-7 days) but 5-10x more expensive than sea freight (21-35 days)',
      'Always insure shipments — the cost is 1-2% of value but protects against total loss',
    ],
    examples: [
      'Ship 500kg textile from Mombasa to Dar es Salaam: Sea freight KES 50,000 + Clearing KES 25,000 + Duty TZS 500,000 (~KES 30,000) = KES 105,000. Transit: 3 days sea + 2 days clearing = 5 days.',
    ],
    relatedTopics: ['import-regulations', 'supply-chain-routes', 'sourcing-strategy'],
    category: 'operations',
  },
  {
    id: 'negotiation-skills',
    topic: 'Skills',
    subtopic: 'Negotiation',
    keywords: ['negotiate', 'bargain', 'deal', 'discount', 'haggle', 'supplier', 'price'],
    content: 'Negotiation framework for East African business: (1) BATNA — know your Best Alternative To Negotiated Agreement before any negotiation. If supplier X won\'t lower price, you have supplier Y. (2) Anchoring — make the first offer 20-30% below your target to anchor the negotiation. (3) Volume Commitment — offer guaranteed monthly volumes for 10-20% discounts. (4) Payment Terms — offer faster payment (7 days vs 30 days) for 5% discount. (5) Relationship Building — invest in long-term relationships. A 2-year supplier relationship can yield 30% better pricing than a new one.',
    tips: [
      'Never accept the first price — always negotiate at least once',
      'Walk away power is real — the ability to walk away gives you leverage',
      'In Kenya/Tanzania, relationship matters as much as price — take suppliers for chai/coffee',
      'Document agreed prices in writing — verbal agreements lead to disputes',
    ],
    examples: [
      'Supplier quotes TZS 7,000/shirt for 500 units. Offer: TZS 5,000 for 500 units + commitment to order 1,000/month for 6 months. Counter: TZS 5,800. Final: TZS 5,500 with 14-day payment terms. Savings: TZS 750/unit × 500 = TZS 375,000.',
    ],
    relatedTopics: ['sourcing-strategy', 'vendor-management', 'pricing-strategy'],
    category: 'advisory',
  },
  {
    id: 'brand-building',
    topic: 'Branding',
    subtopic: 'Brand Building',
    keywords: ['brand', 'identity', 'logo', 'positioning', 'differentiation', 'packaging'],
    content: 'Building a brand in East Africa: (1) Brand Identity — professional logo (KES 5,000-50,000 on Fiverr/local designer), consistent colors, brand name that\'s easy to pronounce locally. (2) Value Proposition — what makes you different? Price? Quality? Speed? Service? (3) Packaging — invest in branded bags/boxes (KES 5-20 per unit), it increases perceived value by 40-60%. (4) Social Media Presence — consistent posting (daily Instagram, 3x/week WhatsApp Status). (5) Customer Experience — fast response (<1 hour), professional communication, follow-up after sale.',
    tips: [
      'Your brand is what people say about you when you\'re not in the room — make it count',
      'Branded packaging costs 5-10% more but increases repeat purchase rate by 30%',
      'Use a consistent Instagram grid layout — alternating product shots and lifestyle images',
      'Create a brand story: why you started, what you stand for, who you serve',
    ],
    examples: [
      '"Nairobi Threads" — branded packaging (KES 10/bag × 400 orders = KES 4,000/month). Increases average order from KES 2,500 to KES 3,200 (28% increase). Net: +KES 280,000/month revenue for KES 4,000 cost.',
    ],
    relatedTopics: ['customer-acquisition', 'digital-marketing-overview', 'packaging-strategy'],
    category: 'marketing',
  },
  {
    id: 'investment-readiness',
    topic: 'Investment',
    subtopic: 'Getting Funded',
    keywords: ['investment', 'funding', 'investor', 'pitch', 'fundraise', 'raise money', 'capital'],
    content: 'Investment landscape in East Africa: (1) Bootstrapping — self-fund from savings/revenue. Most common. (2) Friends & Family — KES 100K-5M. (3) Microfinance — KES 50K-5M at 15-30% interest. (4) SACCOs — savings and credit cooperatives, lower rates. (5) Angel Investors — KES 1-10M for 10-30% equity. (6) Venture Capital — KES 10M-500M for high-growth startups. (7) Grants — USAID, DFID, Mastercard Foundation, Google for Startups Africa. Pitch deck essentials: Problem, Solution, Market Size (East Africa TAM), Business Model, Traction (revenue/growth), Team, Financials, Ask (how much + use of funds).',
    tips: [
      'Investors invest in traction first, team second, idea third — show revenue before asking for money',
      'Join an accelerator (Nairobi: iLab, CcHub; Kigali: kLab; Kampala: Startup Uganda)',
      'Microfinance is the easiest first step — SACCOs offer 6-12% interest vs 15-30% commercial',
      'Grants don\'t require equity — apply to Mastercard Foundation, USAID, and Google for Startups',
    ],
    examples: [
      'Fashion startup: 6 months of trading, TZS 5M revenue, 40% margins, 500 customers. Pitch to angel: "TZS 5M investment for 15% equity. Use: 60% inventory expansion, 20% marketing, 20% operations. Projected Year 1 revenue: TZS 20M."',
    ],
    relatedTopics: ['financial-planning', 'financial-statements', 'pitch-deck-structure'],
    category: 'advisory',
  },
  {
    id: 'growth-hacking',
    topic: 'Growth',
    subtopic: 'Growth Hacking',
    keywords: ['growth', 'scale', 'hack', 'viral', 'expand', 'accelerate', 'fast'],
    content: 'Growth strategies for East African businesses: (1) Referral Programs — "Give KES 500, Get KES 500" for every successful referral. (2) Bundle Deals — 3-for-2 promotions increase average order by 50%. (3) Cross-Selling — "Customers who bought X also buy Y." (4) Seasonal Campaigns — Back-to-school, Christmas, Ramadan, Easter. (5) Partnerships — partner with complementary businesses (shoe seller × bag seller). (6) Pop-Up Shops — test new locations with low commitment. (7) WhatsApp Status Marketing — post 5-10 product photos daily. (8) Influencer Micro-Deals — KES 5,000-20,000 per post from nano-influencers (1K-10K followers).',
    tips: [
      'Focus on retention over acquisition — repeat customers are 5x cheaper than new ones',
      'WhatsApp Status has higher engagement than Instagram in East Africa',
      'Bundle slow-movers with fast-movers to clear inventory while increasing average order',
      'Track every channel — know which marketing drives actual sales, not just likes',
    ],
    examples: [
      'Electronics seller: Implements referral program. Month 1: 50 referrals → 15 convert (30%) → KES 7,500 cost. Month 6: Referral channel generates 25% of all new customers at KES 500 CAC vs KES 2,500 from ads.',
    ],
    relatedTopics: ['customer-acquisition', 'referral-programs', 'promotional-strategies'],
    category: 'advisory',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONS (15 entries)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'supply-chain-optimization',
    topic: 'Supply Chain',
    subtopic: 'Optimization',
    keywords: ['supply chain', 'optimize', 'lead time', 'buffer', 'jit', 'efficiency'],
    content: 'Supply chain optimization for East African businesses: (1) Lead Time Management — China sea freight: 21-30 days, India: 14-21 days, Dubai: 7-14 days, Local: 1-3 days. Buffer stock = daily sales × lead time × 1.5 safety factor. (2) Supplier Diversification — never rely on one supplier for more than 60% of stock. (3) JIT (Just-in-Time) — risky in EA due to logistics uncertainty; keep 2-4 weeks buffer. (4) Consolidation — combine small orders into larger shipments to reduce per-unit shipping costs by 30-50%.',
    tips: [
      'Calculate your reorder point: (average daily sales × lead time) + safety stock',
      'Air freight for emergencies, sea freight for routine — never air freight for standard inventory',
      'Build relationships with 2-3 clearing agents at each port for redundancy',
      'Track lead times per supplier — reliability is as important as price',
    ],
    examples: [
      'Shirt business: Sells 20/day. China lead time: 30 days. Buffer stock: 20 × 30 × 1.5 = 900 units. Reorder when stock hits 900. Order 1,200 units (60 days supply) to fill container for better shipping rate.',
    ],
    relatedTopics: ['inventory-forecasting', 'logistics-planning', 'vendor-management'],
    category: 'operations',
  },
  {
    id: 'order-fulfillment',
    topic: 'Operations',
    subtopic: 'Order Fulfillment',
    keywords: ['fulfillment', 'packing', 'shipping', 'delivery', 'process', 'workflow'],
    content: 'Order fulfillment workflow: (1) Order Received → verify payment (M-Pesa confirmation), (2) Pick items from warehouse/inventory, (3) Quality check — inspect for defects, correct items, correct quantity, (4) Pack — branded packaging, bubble wrap for fragile items, invoice/receipt inside, (5) Label — shipping label with tracking number, delivery address, phone, (6) Dispatch — assign to carrier (G4S, Wells Fargo, Sendy, Fargo), (7) Track — monitor until delivered, (8) Confirm — mark delivered, follow up for feedback. Same-day delivery available for orders before 2PM in major cities.',
    tips: [
      'Create a fulfillment checklist — tape to packing station for consistency',
      'Pack orders the same day they\'re paid — speed builds trust and repeat business',
      'Include a thank-you card or small freebie — it increases repeat purchase by 25%',
      'For COD orders, call to confirm before dispatching — reduces return rate by 40%',
    ],
    examples: [
      'Boutique processes 30 orders/day. Fulfillment time: Pick (5 min) + Check (2 min) + Pack (3 min) + Label (1 min) = 11 min/order. Total: 5.5 hours/day. With 2 staff: 2.75 hours. Efficiency improves to 8 min/order after 3 months.',
    ],
    relatedTopics: ['logistics-planning', 'packaging-strategy', 'returns-management'],
    category: 'operations',
  },
  {
    id: 'inventory-forecasting',
    topic: 'Inventory',
    subtopic: 'Forecasting',
    keywords: ['forecast', 'predict', 'demand', 'reorder', 'safety stock', 'abc analysis'],
    content: 'Inventory forecasting methods for SMEs: (1) Moving Average — average of last 3 months\' sales. (2) Seasonal Adjustment — multiply by seasonal index (Nov-Dec: 1.5x, Jan-Feb: 0.7x, Mar-Apr: 0.9x, May-Aug: 1.0x, Sep-Oct: 1.1x). (3) ABC Analysis — A items (top 20% by revenue = 80% of sales), B items (next 30%), C items (bottom 50%). Focus stocking on A items. (4) Safety Stock Formula: (Maximum Daily Sales × Maximum Lead Time) - (Average Daily Sales × Average Lead Time).',
    tips: [
      'Track daily sales in a spreadsheet for 3 months minimum before forecasting',
      'A items (top 20%) should never stock out — set higher reorder points',
      'Review forecasts monthly — compare predicted vs actual and adjust',
      'Holiday season (Nov-Dec) in EA requires 50% more stock than average months',
    ],
    examples: [
      'Electronics store: Monthly sales — Laptops 50, Phones 200, Accessories 500. ABC: A=Accessories (50% revenue), B=Phones (35%), C=Laptops (15%). Stock 30-day supply of A items, 20-day for B, 15-day for C.',
    ],
    relatedTopics: ['supply-chain-optimization', 'inventory-management', 'warehouse-management'],
    category: 'operations',
  },
  {
    id: 'vendor-management',
    topic: 'Supply Chain',
    subtopic: 'Vendor Management',
    keywords: ['vendor', 'supplier', 'relationship', 'scorecard', 'contract', 'performance'],
    content: 'Vendor management framework: (1) Supplier Scorecard — rate on Quality (defect rate), Delivery (on-time %), Price (competitiveness), Communication (response time), Flexibility (ability to handle changes). Score 1-5 on each dimension. (2) Payment Terms — negotiate 30/60/90 day terms. Offer early payment discount (2/10 net 30 = 2% discount if paid in 10 days). (3) Contracts — written agreements for orders >KES 100,000. Include quality specs, delivery dates, penalty clauses, return policy. (4) Relationship Investment — visit key suppliers annually, attend their events, maintain regular communication.',
    tips: [
      'Never give more than 40% of your business to one supplier — maintain leverage',
      'Visit suppliers in person at least once a year — builds trust and reveals their operations',
      'Pay on time consistently — it gives you negotiating power for better terms',
      'Keep a backup supplier for every critical product category',
    ],
    examples: [
      'Textile business with 5 suppliers: Supplier A (40% of stock, score 4.2/5), B (25%, 3.8), C (20%, 4.0), D (10%, 3.5), E (5%, 4.5). Reduce A to 30%, increase B and E. Negotiate 45-day terms with A for 8% discount.',
    ],
    relatedTopics: ['sourcing-strategy', 'negotiation-skills', 'quality-control'],
    category: 'operations',
  },
  {
    id: 'returns-management',
    topic: 'Operations',
    subtopic: 'Returns',
    keywords: ['returns', 'refund', 'exchange', 'reverse logistics', 'complaint'],
    content: 'Returns management policy: (1) Return Window — 7 days for defective items, 3 days for change of mind. (2) Conditions — original packaging, tags attached, unused. (3) Process — customer contacts via WhatsApp with photo evidence → approve/deny within 24 hours → refund via original payment method or store credit (offer 10% bonus for store credit). (4) Tracking — log all returns with reason code (defective/wrong size/not as described/changed mind). Target return rate: <5%. If higher, investigate product quality or description accuracy.',
    tips: [
      'Make returns easy — a good return experience creates loyal customers',
      'Offer store credit with bonus instead of cash refunds — retains revenue',
      'Photo evidence requirement reduces fraudulent returns by 60%',
      'Track return reasons weekly — if "defective" spikes, contact your supplier immediately',
    ],
    examples: [
      'Boutique: 400 orders/month, 15 returns (3.75%). Reasons: Defective (5), Wrong Size (4), Not as Described (3), Changed Mind (3). Action: Improved product photos (reduced "Not as Described" to 1), added size guide (reduced "Wrong Size" to 1). New return rate: 2.25%.',
    ],
    relatedTopics: ['customer-service', 'quality-control', 'order-fulfillment'],
    category: 'operations',
  },
  {
    id: 'packaging-strategy',
    topic: 'Operations',
    subtopic: 'Packaging',
    keywords: ['packaging', 'box', 'bag', 'brand', 'protect', 'unboxing'],
    content: 'Packaging strategy: (1) Branded Packaging — custom bags/boxes with logo (KES 5-30/unit). Increases perceived value by 40-60%. (2) Protective Packaging — bubble wrap (KES 1/pc), tissue paper (KES 0.50/pc), foam inserts for electronics. (3) Eco-Friendly Options — recycled paper bags, biodegradable packaging — premium positioning. (4) Unboxing Experience — branded sticker, thank-you card, small free sample. (5) Cost Optimization — buy packaging in bulk (1000+ units = 40% discount). Order tracking inserts with QR code for returns.',
    tips: [
      'Invest in branded packaging early — it\'s the cheapest marketing you can do',
      'Buy packaging materials in bulk from industrial areas (Nairobi: Industrial Area, Dar: Temeke)',
      'Include a "Tag us @yourbrand" card — customers share unboxing photos on social media',
      'Different packaging for different tiers — premium wrapping for high-value orders',
    ],
    examples: [
      'Fashion seller: Plain poly bags (KES 2) → Branded paper bags (KES 12). Cost increase: KES 10/order × 400 orders = KES 4,000/month. Result: 30% increase in Instagram tags, 15% increase in repeat purchases. Revenue impact: +KES 180,000/month.',
    ],
    relatedTopics: ['brand-building', 'order-fulfillment', 'sustainability-practices'],
    category: 'operations',
  },
  {
    id: 'customer-service',
    topic: 'Operations',
    subtopic: 'Customer Service',
    keywords: ['customer service', 'support', 'complaint', 'response', 'satisfaction', 'nps'],
    content: 'Customer service standards for East African businesses: (1) Response Time — WhatsApp: <1 hour during business hours, Instagram DM: <2 hours, Phone: immediate. (2) Resolution Time — Simple issues: same day, Complex issues: 48 hours. (3) Escalation — Front-line → Manager → Owner. (4) Follow-up — Call/message 3 days after resolution to confirm satisfaction. (5) NPS (Net Promoter Score) — "How likely are you to recommend us?" Scale 0-10. Target: >50. Promoters (9-10): ask for referrals. Detractors (0-6): immediate follow-up to resolve.',
    tips: [
      'Respond to complaints within 1 hour — even if you don\'t have a solution yet, acknowledge the issue',
      'Never argue with a customer — "I understand your frustration, let me fix this"',
      'Keep a FAQ document — answer common questions once, share the document',
      'Turn complaints into marketing — "We resolved this in 2 hours" builds trust',
    ],
    examples: [
      'Clothing store: Monthly 500 interactions, 45 complaints (9%). Resolution: 40 same-day, 5 next-day. NPS: 62 (excellent). Strategy: Respond in <30 min, offer exchange + KES 200 voucher for inconvenience. Repeat rate from complaint resolution: 78%.',
    ],
    relatedTopics: ['returns-management', 'brand-building', 'customer-acquisition'],
    category: 'operations',
  },
  {
    id: 'data-analytics',
    topic: 'Analytics',
    subtopic: 'Business Analytics',
    keywords: ['analytics', 'data', 'kpi', 'metrics', 'report', 'dashboard', 'trend'],
    content: 'Key analytics for East African SMEs: (1) Revenue Metrics — daily/weekly/monthly revenue, average order value (AOV), revenue per customer. (2) Customer Metrics — CAC, CLV (Customer Lifetime Value = AOV × purchase frequency × retention period), churn rate. (3) Product Metrics — units sold, margin per product, stock turnover rate (COGS ÷ average inventory). (4) Marketing Metrics — conversion rate, ROI per channel, engagement rate. (5) Financial Metrics — gross margin, net margin, cash conversion cycle. Target benchmarks: Gross margin >40%, Net margin >15%, Stock turnover >4x/year.',
    tips: [
      'Track 5 KPIs maximum — more than that becomes overwhelming',
      'Review KPIs weekly — don\'t wait for month-end to discover problems',
      'Use BirichiNex Analytics module for automated KPI tracking',
      'Compare month-over-month and year-over-year to identify trends',
    ],
    examples: [
      'Electronics shop KPIs: Revenue TZS 5M/month, AOV TZS 25,000, CAC TZS 2,000, CLV TZS 150,000, Gross Margin 32%, Stock Turnover 6x/year. Insight: CLV:CAC ratio is 75:1 (healthy, target >3:1). Focus: increase AOV by 15% through bundling.',
    ],
    relatedTopics: ['business-dashboard', 'financial-statements', 'customer-segmentation'],
    category: 'operations',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE (15 entries)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'cash-flow-management',
    topic: 'Finance',
    subtopic: 'Cash Flow',
    keywords: ['cash flow', 'cashflow', 'money', 'inflow', 'outflow', 'working capital'],
    content: 'Cash flow management is the #1 killer of East African SMEs. 60% of businesses that fail do so because of cash flow problems, not lack of profit. Key principles: (1) Cash Flow ≠ Profit. You can be profitable on paper but bankrupt in the bank. (2) Timing Matters — if you pay suppliers in 7 days but collect from customers in 30, you need 23 days of working capital. (3) Cash Flow Statement: Operating Activities (sales - expenses) + Investing Activities (assets) + Financing Activities (loans) = Net Cash Flow. (4) Target: Positive cash flow 10 out of 12 months.',
    tips: [
      'Invoice immediately upon delivery — don\'t wait until month-end',
      'Negotiate longer payment terms with suppliers (45-60 days) and shorter with customers (7-14 days)',
      'Keep a cash reserve equal to 2 months of fixed costs',
      'Use BirichiNex Finance module to forecast 90-day cash flow',
    ],
    examples: [
      'Business buys stock for TZS 5M (pay supplier in 7 days), sells for TZS 8M (customers pay in 30 days via COD). Gap: 23 days × TZS 71,429/day = TZS 1.64M needed in working capital. Solution: 50% M-Pesa prepayment reduces gap to 11.5 days.',
    ],
    relatedTopics: ['financial-planning', 'budgeting-methods', 'invoice-management'],
    category: 'finance',
  },
  {
    id: 'pricing-mathematics',
    topic: 'Finance',
    subtopic: 'Pricing Math',
    keywords: ['margin', 'markup', 'break even', 'calculate', 'formula', 'profit'],
    content: 'Essential pricing formulas: (1) Markup = (Selling Price - Cost) ÷ Cost × 100. Example: Cost TZS 100, Sell TZS 150 → Markup = 50%. (2) Margin = (Selling Price - Cost) ÷ Selling Price × 100. Example: Cost TZS 100, Sell TZS 150 → Margin = 33%. (3) Break-Even Point = Fixed Costs ÷ (Selling Price - Variable Cost per Unit). Example: Fixed costs TZS 500,000/month, selling TZS 150, variable cost TZS 100 → Break-even = 10,000 units. (4) Target Profit = (Fixed Costs + Target Profit) ÷ Margin per Unit.',
    tips: [
      'Markup and margin are NOT the same — a 50% markup is only 33% margin',
      'Always calculate break-even before setting prices — know how many you need to sell',
      'Include ALL costs in your calculation: rent, staff, M-Pesa fees, packaging, transport',
      'Use BirichiNex Finance to track actual margins vs target margins per product',
    ],
    examples: [
      'Shirt: Cost TZS 5,000 (product+shipping+duties). Fixed costs TZS 300,000/month. Staff TZS 100,000. Target profit TZS 200,000. Need: (300K+100K+200K) ÷ (15,000-5,000) = 60 shirts/month. At 2 shirts/day = 60/month → meets target.',
    ],
    relatedTopics: ['pricing-strategy', 'cash-flow-management', 'revenue-optimization'],
    category: 'finance',
  },
  {
    id: 'tax-compliance-kenya',
    topic: 'Tax',
    subtopic: 'Kenya Tax',
    keywords: ['kenya tax', 'kra', 'vat', 'income tax', 'paye', 'withholding'],
    content: 'Kenya tax obligations: (1) VAT — 16% on most goods/services. Register if annual turnover >KES 5M. File monthly by 20th of following month. (2) Corporate Income Tax — 30% on net profits. File annually. (3) PAYE — employee tax, 10-35% progressive rates. File monthly. (4) Withholding Tax — 5% on payments to non-VAT registered suppliers, 2% on professional fees. (5) Digital Service Tax — 1.5% on digital marketplace revenues. (6) Turnover Tax — 1% of gross turnover for businesses below KES 25M. Filing: via iTax portal (KRA). Penalties: 25% of tax due + 2% per month for late filing.',
    tips: [
      'Register for iTax immediately — all filing is online now',
      'Keep digital copies of all receipts — KRA audits are increasingly common',
      'Engage a tax consultant for KES 15-30K/year — saves multiples in penalties',
      'Use the Small Business Tax rate (1% turnover) if below KES 25M — simpler and often cheaper',
    ],
    examples: [
      'Small retailer: Annual turnover KES 8M (above 5M threshold). VAT: 16% × 8M = KES 1.28M collected, minus input VAT KES 400K = KES 880K payable. Corporate tax: 30% × (KES 2M profit) = KES 600K. Total tax: KES 1.48M (18.5% effective rate).',
    ],
    relatedTopics: ['compliance-guide', 'tax-compliance-tanzania', 'bookkeeping-basics'],
    category: 'legal',
  },
  {
    id: 'tax-compliance-tanzania',
    topic: 'Tax',
    subtopic: 'Tanzania Tax',
    keywords: ['tanzania tax', 'tra', 'vat', 'tin', 'fiscal receipt'],
    content: 'Tanzania tax obligations: (1) VAT — 18% on most goods/services. Register if annual turnover >TZS 200M. File monthly via TRA e-filing. (2) Corporate Income Tax — 30% on net profits. (3) PAYE — progressive rates 0-30%. (4) Skills Development Levy (SDL) — 4.5% of gross payroll. (5) Withholding Tax — 5-15% on various payments. (6) Fiscal Receipt — mandatory for all transactions above TZS 1,000. Use approved fiscal devices (EFD). Penalties: Heavy fines for non-compliance, potential business closure.',
    tips: [
      'Get a fiscal device (EFD) immediately — penalties for non-issuance are severe in Tanzania',
      'SDL (4.5% of payroll) is often overlooked — budget for it separately',
      'TRA conducts random inspections — keep all records organized and accessible',
      'Import duties vary by product: Textiles 25-35%, Electronics 25%, Food 10-25%',
    ],
    examples: [
      'Dar es Salaam shop: Annual revenue TZS 500M. VAT: 18% × 500M = TZS 90M collected, input VAT TZS 30M = TZS 60M payable. Corporate tax: 30% × TZS 80M profit = TZS 24M. SDL: 4.5% × TZS 48M payroll = TZS 2.16M. Total: TZS 86.16M.',
    ],
    relatedTopics: ['compliance-guide', 'tax-compliance-kenya', 'tax-compliance-uganda'],
    category: 'legal',
  },
  {
    id: 'bookkeeping-basics',
    topic: 'Finance',
    subtopic: 'Bookkeeping',
    keywords: ['bookkeeping', 'accounting', 'journal', 'ledger', 'trial balance', 'double entry'],
    content: 'Bookkeeping fundamentals: (1) Double-Entry — every transaction has a debit and credit. Cash sale: Debit Cash, Credit Revenue. (2) Chart of Accounts — list of all accounts: Assets (Cash, Inventory, Equipment), Liabilities (Loans, Payables), Equity (Capital, Retained Earnings), Revenue (Sales), Expenses (Rent, Salaries, Cost of Goods). (3) Journal Entries — record transactions chronologically. (4) General Ledger — summarize all transactions by account. (5) Trial Balance — verify debits = credits. (6) Bank Reconciliation — match your records with bank statements monthly.',
    tips: [
      'Use accounting software (QuickBooks, Wave, or BirichiNex Finance) from day one',
      'Reconcile your bank account weekly — don\'t wait for month-end',
      'Separate personal and business transactions — never mix them',
      'Keep receipts for every expense above KES 1,000',
    ],
    examples: [
      'Monthly entries for a small shop: 150 sales (debit Cash, credit Revenue), 50 purchases (debit Inventory, credit Cash), 1 rent (debit Rent Expense, credit Cash), 2 salary (debit Salary Expense, credit Cash). Trial balance: Total debits = Total credits = TZS 8.5M.',
    ],
    relatedTopics: ['financial-statements', 'cash-flow-management', 'invoice-management'],
    category: 'finance',
  },
  {
    id: 'financial-statements',
    topic: 'Finance',
    subtopic: 'Financial Statements',
    keywords: ['financial statement', 'income statement', 'balance sheet', 'profit', 'loss', 'p&l'],
    content: 'Three core financial statements: (1) Income Statement (P&L) — Revenue - Cost of Goods Sold = Gross Profit - Operating Expenses = Net Profit. Shows profitability over a period. (2) Balance Sheet — Assets = Liabilities + Equity. Snapshot at a point in time. (3) Cash Flow Statement — Operating + Investing + Financing activities. Shows actual cash movement. Key ratios: Gross Margin (target >40%), Net Margin (target >15%), Current Ratio (target >1.5), Debt-to-Equity (target <1.0).',
    tips: [
      'Review your P&L monthly — it\'s your business\'s report card',
      'A profitable P&L but negative cash flow means you have a collections problem',
      'Your balance sheet should grow in equity over time — if liabilities grow faster, you\'re over-leveraged',
      'Use ratios to benchmark against industry standards',
    ],
    examples: [
      'P&L: Revenue TZS 10M, COGS TZS 6M, Gross Profit TZS 4M (40%), Operating Expenses TZS 2.5M, Net Profit TZS 1.5M (15%). Balance Sheet: Assets TZS 8M = Liabilities TZS 3M + Equity TZS 5M. Current Ratio: 2.0 (healthy).',
    ],
    relatedTopics: ['bookkeeping-basics', 'cash-flow-management', 'data-analytics'],
    category: 'finance',
  },
  {
    id: 'budgeting-methods',
    topic: 'Finance',
    subtopic: 'Budgeting',
    keywords: ['budget', 'planning', 'forecast', 'variance', 'allocation'],
    content: 'Budgeting for East African SMEs: (1) Zero-Based Budgeting — start from zero, justify every expense. Best for cost control. (2) Incremental Budgeting — last year\'s budget ± adjustment. Easiest method. (3) Rolling Forecast — update 12-month forecast monthly. Most accurate. (4) 50/30/20 Rule — 50% essential costs (rent, stock, staff), 30% growth (marketing, expansion), 20% savings/reserves. Budget variance = (Actual - Budget) ÷ Budget × 100. Target: variance <10%.',
    tips: [
      'Budget for irregular expenses: annual licenses, equipment replacement, tax payments',
      'Include a 10% contingency buffer for unexpected costs',
      'Review budget vs actual every month — adjust next month\'s spending accordingly',
      'Create separate budgets for peak season and off-season',
    ],
    examples: [
      'Monthly budget: Revenue target TZS 5M. Costs: Stock TZS 2M (40%), Rent TZS 500K (10%), Staff TZS 750K (15%), Marketing TZS 250K (5%), Utilities TZS 150K (3%), Transport TZS 200K (4%), Savings TZS 500K (10%), Contingency TZS 150K (3%). Total: TZS 4.5M.',
    ],
    relatedTopics: ['financial-planning', 'cash-flow-management', 'cost-reduction'],
    category: 'finance',
  },
  {
    id: 'invoice-management',
    topic: 'Finance',
    subtopic: 'Invoicing',
    keywords: ['invoice', 'bill', 'payment terms', 'collections', 'receivables'],
    content: 'Invoice management best practices: (1) Invoice immediately upon delivery. (2) Payment Terms — Net 7 (best for cash flow), Net 30 (standard), Net 60 (large corporates). Offer 2% discount for payment within 10 days (2/10 Net 30). (3) Invoice Elements — your business details, customer details, invoice number (sequential), date, items (description, quantity, unit price, total), total amount, tax (VAT), payment terms, bank/M-Pesa details. (4) Collections — send reminder at 7 days overdue, call at 14 days, final notice at 30 days, write off or pursue legally at 90 days.',
    tips: [
      'Use sequential invoice numbers — it\'s a legal requirement in most EA countries',
      'Include M-Pesa Business Number on invoices — it speeds up payment',
      'Follow up on overdue invoices weekly — don\'t let them pile up',
      'For repeat customers, consider auto-debit from their mobile money',
    ],
    examples: [
      'Wholesale customer: Invoice TZS 500,000, Net 30 terms. Day 10: polite WhatsApp reminder. Day 20: phone call. Day 30: final notice. Day 40: 5% late fee applied. Day 60: referred to collections. Result: 85% pay on time, 10% within 30 days late, 5% require escalation.',
    ],
    relatedTopics: ['cash-flow-management', 'bookkeeping-basics', 'cost-reduction'],
    category: 'finance',
  },
  {
    id: 'cost-reduction',
    topic: 'Finance',
    subtopic: 'Cost Reduction',
    keywords: ['cost', 'reduce', 'save', 'cut', 'efficiency', 'overhead'],
    content: 'Cost reduction strategies: (1) Procurement — buy in bulk (30-40% savings), negotiate with multiple suppliers, join buying cooperatives. (2) Rent — consider shared spaces, home-based business, or lower-cost areas. (3) Staff — cross-train employees, use performance-based commissions, consider part-time for peak hours. (4) Marketing — focus on organic social media (free) vs paid ads. WhatsApp is free. (5) Operations — automate repetitive tasks, reduce waste, optimize delivery routes. (6) Energy — switch to LED, solar for lighting, energy-efficient appliances. Target: reduce costs by 10-20% without impacting quality.',
    tips: [
      'Audit every expense quarterly — cancel anything you haven\'t used in 3 months',
      'Buy packaging and supplies from manufacturers directly, not middlemen',
      'Energy costs can be cut 30-50% with solar — payback in 12-18 months in EA',
      'Share warehouse space with complementary businesses to split rent',
    ],
    examples: [
      'Monthly cost audit: Packaging from middleman KES 15/unit → direct from manufacturer KES 8/unit (47% savings). Energy KES 25K/month → solar panels (KES 200K one-time, payback 8 months) → KES 8K/month. Transport optimized routes save KES 15K/month. Total: KES 42K saved/month.',
    ],
    relatedTopics: ['budgeting-methods', 'financial-planning', 'sustainability-practices'],
    category: 'finance',
  },
  {
    id: 'revenue-optimization',
    topic: 'Finance',
    subtopic: 'Revenue Growth',
    keywords: ['revenue', 'upsell', 'cross-sell', 'bundle', 'increase', 'grow income'],
    content: 'Revenue optimization strategies: (1) Upselling — offer premium version (e.g., Grade A+ instead of Grade A, +30% price). (2) Cross-Selling — "Would you like a matching belt with those shoes?" (3) Bundle Offers — "Buy 3 shirts, get 1 free" (margin maintained through volume). (4) Volume Discounts — "10+ units: 15% off, 50+ units: 25% off." (5) Seasonal Pricing — premium pricing during peak demand (holidays, back-to-school). (6) Subscription/Repeat — "Monthly fashion box: TZS 50,000/month for curated selection." Target: increase average order value by 20-30% within 6 months.',
    tips: [
      'Train staff to suggest complementary products at checkout — increases AOV by 15-25%',
      'Create 3 product tiers (Good/Better/Best) — most customers choose the middle option',
      'Bundle slow-movers with best-sellers to clear inventory',
      'Offer free delivery above a threshold (e.g., "Free delivery on orders over KES 5,000")',
    ],
    examples: [
      'Electronics store: Average order KES 25,000. Strategy: Add accessories shelf near checkout. Cable KES 1,500, Case KES 2,000, Screen Protector KES 800. Attach rate: 40%. New AOV: KES 25,000 + (0.4 × KES 4,300) = KES 26,720 (+6.9%). Monthly impact: +KES 68K on 400 orders.',
    ],
    relatedTopics: ['pricing-strategy', 'pricing-mathematics', 'promotional-strategies'],
    category: 'finance',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKETING (15 entries)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'digital-marketing-overview',
    topic: 'Marketing',
    subtopic: 'Digital Marketing',
    keywords: ['digital marketing', 'online marketing', 'internet', 'ads', 'campaign'],
    content: 'Digital marketing channels ranked by ROI for East African businesses: (1) WhatsApp Business — FREE, highest conversion rate (15-25%), best for repeat customers. (2) Instagram — FREE organic reach declining, but best for product discovery. Reels get 2-5x more reach. (3) Facebook Groups — FREE, community selling, high trust. (4) TikTok — FREE, viral potential, younger audience (18-35). (5) Google Ads — KES 5-50 per click, best for high-intent searches. (6) Instagram/Facebook Ads — KES 10-100 per click, good for awareness. Budget allocation: 60% organic (WhatsApp, Instagram, TikTok), 30% paid (Facebook/Instagram Ads), 10% influencer.',
    tips: [
      'Post on Instagram 5-7x/week, WhatsApp Status 3-5x/day, TikTok 3-5x/week',
      'Use hashtags strategically: 5-10 per post, mix popular (#fashion) and niche (#nairobifashion)',
      'Create content that educates, entertains, or inspires — don\'t just post product photos',
      'Track which posts drive actual DMs/sales — double down on what works',
    ],
    examples: [
      'Fashion brand: Instagram (8K followers, 500 reach/post), WhatsApp (2K contacts, 200 views/status), TikTok (3K followers, 2K views/video). Monthly: 50 orders from Instagram, 80 from WhatsApp, 30 from TikTok. Total: 160 orders × KES 3,500 = KES 560K.',
    ],
    relatedTopics: ['whatsapp-business', 'instagram-selling', 'social-media-strategy'],
    category: 'marketing',
  },
  {
    id: 'whatsapp-business',
    topic: 'Marketing',
    subtopic: 'WhatsApp Business',
    keywords: ['whatsapp', 'business', 'catalog', 'broadcast', 'status', 'quick replies'],
    content: 'WhatsApp Business is the #1 sales channel in East Africa with 85%+ penetration. Setup: (1) Download WhatsApp Business (separate from personal), (2) Complete business profile (name, address, hours, website), (3) Add product catalog (up to 500 products with photos, descriptions, prices), (4) Create broadcast lists (segmented: VIP, Wholesale, New, etc.), (5) Set up quick replies (FAQ responses), (6) Use labels to organize conversations (New Order, Pending, Delivered, VIP). Broadcast messaging: send to up to 256 contacts per list. Status updates: post 3-5x daily with product photos.',
    tips: [
      'Create broadcast lists by customer segment — VIP gets first access to new arrivals',
      'Use quick replies for common questions: sizing, payment methods, delivery times',
      'Post WhatsApp Status 3-5x daily — it\'s your free billboard',
      'Catalog photos should be well-lit, on-brand, and show the product clearly',
    ],
    examples: [
      'Boutique: 3,000 WhatsApp contacts. Segmented into 5 broadcast lists (600 each). New arrival broadcast → 60% open rate → 15% click catalog → 5% purchase. Per broadcast: 3,000 × 0.6 × 0.05 = 90 orders. 4 broadcasts/month = 360 orders × KES 3,000 = KES 1.08M.',
    ],
    relatedTopics: ['e-commerce-strategy', 'customer-acquisition', 'digital-marketing-overview'],
    category: 'marketing',
  },
  {
    id: 'instagram-selling',
    topic: 'Marketing',
    subtopic: 'Instagram',
    keywords: ['instagram', 'reels', 'stories', 'hashtag', 'influencer', 'shopping'],
    content: 'Instagram selling strategy: (1) Profile — professional photo, bio with value prop, link in bio (Linktree or WhatsApp link). (2) Content Mix — 40% product shots, 30% lifestyle/behind-scenes, 20% customer testimonials, 10% educational. (3) Reels — 15-30 second product demos get 2-5x more reach than photos. (4) Stories — daily polls, Q&As, countdown timers for sales, "swipe up" for links. (5) Hashtags — 5-10 per post, mix of popular (#fashion 50M+), medium (#nairobifashion 500K), and niche (#mitumba 100K). (6) Instagram Shopping — tag products in posts for direct purchase.',
    tips: [
      'Post Reels 3-5x/week — they get 2-5x the reach of static posts',
      'Use Instagram\'s "Add Yours" sticker to encourage user-generated content',
      'Reply to every comment and DM within 1 hour — engagement drives the algorithm',
      'Collaborate with nano-influencers (1K-10K followers) — they have higher engagement rates',
    ],
    examples: [
      'Fashion seller: 10K Instagram followers. Reels (3x/week) average 5K views. 2% click WhatsApp link = 100 DMs/week. 30% convert = 30 orders/week × KES 4,000 = KES 120K/week = KES 480K/month from Instagram alone.',
    ],
    relatedTopics: ['digital-marketing-overview', 'social-media-strategy', 'brand-building'],
    category: 'marketing',
  },
  {
    id: 'referral-programs',
    topic: 'Marketing',
    subtopic: 'Referrals',
    keywords: ['referral', 'refer', 'word of mouth', 'viral', 'recommend'],
    content: 'Referral programs for East African businesses: (1) Double-Sided Reward — both referrer and new customer get benefit (KES 500 credit each). (2) Tiered Rewards — 1 referral: KES 250, 3 referrals: KES 500 each, 5 referrals: KES 750 each. (3) Non-Monetary — free product, VIP access, exclusive previews. (4) Tracking — unique referral codes, QR codes, or "referred by [Name]" field at checkout. (5) Promotion — WhatsApp Status, in-store signage, invoice inserts, social media posts. Target: 20-30% of new customers from referrals. Cost: typically 5-10% of first order value.',
    tips: [
      'Word-of-mouth is the most trusted marketing channel — 92% of Africans trust recommendations from friends',
      'Make referring easy — one WhatsApp message with their code',
      'Reward immediately — don\'t make people wait for their incentive',
      'Feature top referrers on social media — social recognition is powerful',
    ],
    examples: [
      'Electronics store: "Refer a friend, both get KES 500 off." Month 1: 20 referrals → 8 convert (40%). Cost: KES 8,000. Revenue from 8 new customers: KES 200,000. CAC: KES 1,000 (vs KES 3,000 from ads). Referral customers have 2x higher lifetime value.',
    ],
    relatedTopics: ['customer-acquisition', 'growth-hacking', 'customer-retention'],
    category: 'marketing',
  },
  {
    id: 'promotional-strategies',
    topic: 'Marketing',
    subtopic: 'Promotions',
    keywords: ['promotion', 'sale', 'discount', 'flash sale', 'bogo', 'bundle', 'deal'],
    content: 'Promotional strategies for East African businesses: (1) Flash Sales — 24-48 hour sales with 20-40% discounts. Create urgency. (2) Bundle Deals — "Buy 2 Get 1 Free" or "Shirt + Belt + Tie = KES 15,000 (save KES 5,000)". (3) BOGO — "Buy One Get One 50% Off" (not free — maintains margin). (4) Clearance Sales — 40-60% off end-of-season stock. (5) Loyalty Rewards — "Every 5th purchase: 20% off." (6) Holiday Promotions — Christmas, Easter, Back-to-School, Valentine\'s Day. (7) Volume Discounts — "Buy 10+: 15% off, Buy 50+: 25% off."',
    tips: [
      'Plan promotions 2 weeks in advance — build anticipation with teasers',
      'Flash sales work best on WhatsApp Status + Instagram Stories simultaneously',
      'Never discount below your margin floor — know your break-even price',
      'Track promotion ROI: (Incremental Revenue - Discount Cost) ÷ Discount Cost',
    ],
    examples: [
      'Fashion store: Weekend flash sale, 30% off all jeans. Normal: 50 jeans/week × KES 4,000 = KES 200K. Sale: 120 jeans × KES 2,800 = KES 336K. Incremental revenue: KES 136K. Discount cost: 70 × KES 1,200 = KES 84K. ROI: 62%.',
    ],
    relatedTopics: ['growth-hacking', 'pricing-strategy', 'seasonal-planning'],
    category: 'marketing',
  },
  {
    id: 'customer-retention',
    topic: 'Marketing',
    subtopic: 'Retention',
    keywords: ['retention', 'repeat', 'loyal', 'churn', 'lifecycle', 'back'],
    content: 'Customer retention strategies: (1) Loyalty Program — points per purchase (BirichiNex Loyalty: 1 point per 150 KES). (2) Follow-Up — WhatsApp message 3 days after purchase: "How\'s the [product]? Need anything?" (3) Personalized Offers — birthday discounts, anniversary rewards, "We miss you" for 30-day inactive customers. (4) Exclusive Access — first look at new arrivals for top customers. (5) Community — create a VIP WhatsApp group for top 50 customers. (6) Consistent Quality — the best retention strategy is a great product. CLV (Customer Lifetime Value) = Average Order Value × Purchase Frequency × Customer Lifespan. Target: CLV > 3x CAC.',
    tips: [
      'It costs 5x more to acquire a new customer than retain an existing one',
      'A 5% increase in retention can increase profits by 25-95%',
      'Track your repeat purchase rate monthly — target >30% within 6 months',
      'Send "We miss you" messages to customers inactive for 30+ days with a 10% discount',
    ],
    examples: [
      'Boutique: 500 customers, 30% repeat rate (150 repeat). Strategy: WhatsApp follow-up + birthday discount. Month 6: repeat rate up to 45% (225 repeat). Revenue impact: +KES 225K/month from retained customers.',
    ],
    relatedTopics: ['loyalty-points', 'whatsapp-business', 'growth-hacking'],
    category: 'marketing',
  },
  {
    id: 'content-marketing',
    topic: 'Marketing',
    subtopic: 'Content',
    keywords: ['content', 'blog', 'video', 'testimonial', 'ugc', 'storytelling'],
    content: 'Content marketing for East African businesses: (1) Product Videos — 15-30 second clips showing product quality, features, styling. (2) Behind-the-Scenes — warehouse visits, packaging process, team introductions. (3) Customer Testimonials — video or text reviews from real customers. (4) Educational Content — "How to style a blazer," "5 ways to wear a scarf." (5) User-Generated Content — repost customer photos/videos with credit. (6) Brand Story — why you started, your mission, the problem you solve. Content pillars: Product (40%), Lifestyle (30%), Education (20%), Community (10%).',
    tips: [
      'Consistency beats perfection — post daily even if the content isn\'t perfect',
      'Repurpose content: one video → Instagram Reel + TikTok + WhatsApp Status + YouTube Short',
      'Customer testimonials are your most powerful content — ask every satisfied customer',
      'Show the human side — faces get 38% more engagement than product-only posts',
    ],
    examples: [
      'Fashion brand: 3 content pieces/day. Morning: Product Reel (Instagram/TikTok). Afternoon: Customer photo repost (Stories). Evening: Styling tip (WhatsApp Status). Monthly engagement: 15K likes, 2K comments, 500 shares. Sales from content: 100 orders × KES 4,000 = KES 400K.',
    ],
    relatedTopics: ['digital-marketing-overview', 'instagram-selling', 'brand-building'],
    category: 'marketing',
  },
  {
    id: 'seasonal-planning',
    topic: 'Marketing',
    subtopic: 'Seasonal',
    keywords: ['seasonal', 'holiday', 'christmas', 'easter', 'ramadan', 'back to school', 'peak'],
    content: 'East African seasonal calendar for business: (1) Jan-Feb: Back-to-School rush (uniforms, shoes, bags). (2) Mar-Apr: Lent/Easter — moderate sales. (3) May-Aug: Slow season — focus on clearance and customer retention. (4) Sep-Oct: Building momentum — new collections. (5) Nov-Dec: Peak season — Christmas, Black Friday, end-of-year shopping. Sales spike 50-200%. (6) Ramadan (Islamic calendar) — modest fashion, gifts, home decor. (7) National holidays — Madaraka Day (Kenya), Union Day (Tanzania), Independence Days. Plan inventory 6-8 weeks before peak seasons.',
    tips: [
      'Start Christmas stocking in September — suppliers get overwhelmed by November',
      'Back-to-school is the second biggest season in EA — stock uniforms and stationery',
      'Use slow seasons to clear old inventory at discount while building new collection',
      'Create seasonal marketing calendars 3 months in advance',
    ],
    examples: [
      'Clothing retailer: Jan (back-to-school) TZS 3M, Feb-Apr TZS 1.5M/month, May-Aug TZS 1M/month (clearance), Sep-Oct TZS 2M/month (new collections), Nov-Dec TZS 5M/month (Christmas). Annual: TZS 27M.',
    ],
    relatedTopics: ['inventory-forecasting', 'promotional-strategies', 'pricing-strategy'],
    category: 'marketing',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKET INTELLIGENCE (20 entries)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'kenya-market-overview',
    topic: 'Market Intelligence',
    subtopic: 'Kenya',
    keywords: ['kenya', 'nairobi', 'economy', 'gdp', 'population', 'market'],
    content: 'Kenya is East Africa\'s largest economy (GDP $110B, population 55M). Nairobi is the commercial hub with 5M+ people. Mobile penetration: 90%+. M-Pesa processes $300B+ annually. Key sectors: Services (55% GDP), Agriculture (22%), Industry (17%). Growing middle class (25% of population) with disposable income. E-commerce growing 25% annually. Consumer spending: 60% on food, 15% on transport, 10% on housing, 8% on clothing, 7% on other. Retail market: $80B, with 80% in informal sector. Formal retail growing 12% annually.',
    tips: [
      'Nairobi alone represents 60% of Kenya\'s formal retail market',
      'M-Pesa adoption means mobile money payments are mandatory for any business',
      'Kenya has the most developed startup ecosystem in East Africa',
      'Import duties in Kenya: 25% on most consumer goods + 16% VAT',
    ],
    examples: [
      'Kenya fashion market: KES 80B annually. Formal retail (Naivas, Carrefour): 20%. Informal (Gikomba, Toi Market): 40%. Online (Instagram, Jumia): 15%. Other (boutiques, malls): 25%.',
    ],
    relatedTopics: ['market-entry-kenya', 'tanzania-market-overview', 'uganda-market-overview'],
    category: 'market-intelligence',
  },
  {
    id: 'tanzania-market-overview',
    topic: 'Market Intelligence',
    subtopic: 'Tanzania',
    keywords: ['tanzania', 'dar', 'economy', 'gdp', 'population', 'market'],
    content: 'Tanzania is East Africa\'s second largest economy (GDP $75B, population 65M — youngest population in EA, median age 17). Dar es Salaam is the commercial capital (7M+ people). Key sectors: Agriculture (40% GDP), Mining (gold, diamonds), Tourism (Serengeti, Zanzibar), Construction. Mobile money growing rapidly — Tigo Pesa and Vodacom M-Pesa leading. Consumer spending: 65% on food, 12% on transport, 8% on housing, 7% on clothing. Retail market: $50B, predominantly informal. Rapid urbanization creating new consumer class.',
    tips: [
      'Dar es Salaam port handles 95% of Tanzania\'s imports — logistics hub for the region',
      'Tanzania has the youngest population in EA — youth-focused products sell well',
      'Tourism in Arusha creates premium market for safari gear and crafts',
      'Fiscal receipts (EFD) are mandatory — invest in proper POS/fiscal devices',
    ],
    examples: [
      'Tanzania fashion market: TZS 2T annually. Kariakoo Market dominates wholesale. Formal retail growing in Dar malls (Slipway, Sea Cliff Village). Online still <5% but growing 30% annually.',
    ],
    relatedTopics: ['market-entry-tanzania', 'kenya-market-overview', 'uganda-market-overview'],
    category: 'market-intelligence',
  },
  {
    id: 'uganda-market-overview',
    topic: 'Market Intelligence',
    subtopic: 'Uganda',
    keywords: ['uganda', 'kampala', 'economy', 'gdp', 'population', 'market'],
    content: 'Uganda (GDP $45B, population 48M — fastest growing population in EA at 3.3%/year). Kampala is the commercial hub (3M+ people). Key sectors: Agriculture (25% GDP), Services (45%), Industry (20%). Mobile money: MTN MoMo dominates. Owino (St. Balikuddembe) Market is East Africa\'s largest informal market. Consumer spending: 60% food, 15% transport, 10% housing, 8% clothing. Young population — median age 16. Growing tech ecosystem. Juba (South Sudan) is a key export market from Uganda.',
    tips: [
      'Owino Market in Kampala is the best place for wholesale clothing in East Africa',
      'Uganda\'s young population means huge demand for school supplies, fashion, and electronics',
      'MTN MoMo is the dominant mobile money platform — ensure you accept it',
      'South Sudan exports from Uganda represent a significant trade corridor',
    ],
    examples: [
      'Uganda fashion market: UGX 3.5T annually. Owino Market alone: 40% of all clothing sales. Formal retail (Shoprite, Capital Shoppers): 15%. Online: <3% but growing.',
    ],
    relatedTopics: ['market-entry-uganda', 'kenya-market-overview', 'tanzania-market-overview'],
    category: 'market-intelligence',
  },
  {
    id: 'rwanda-market-overview',
    topic: 'Market Intelligence',
    subtopic: 'Rwanda',
    keywords: ['rwanda', 'kigali', 'economy', 'gdp', 'tech', 'innovation'],
    content: 'Rwanda (GDP $13B, population 14M — smallest but fastest-growing EA economy at 8% GDP growth). Kigali is the hub — cleanest city in Africa. Key sectors: Services (40% GDP), Agriculture (33%), Mining, Tourism (gorilla trekking). Tech-forward: drone delivery, cashless society push, smart city initiatives. Mobile money adoption: 75%+. Ease of Doing Business: #38 globally (best in EA). Limited domestic market size but serves as a hub for Central/East Africa. Free trade zones attract manufacturing.',
    tips: [
      'Rwanda is the easiest country in EA to start a business — 1-day registration',
      'Small market size means you need to plan for cross-border expansion from day one',
      'Rwanda\'s tech ecosystem is the most advanced in EA — leverage digital tools',
      'Free trade zones (Kigali Special Economic Zone) offer tax incentives for manufacturers',
    ],
    examples: [
      'Rwanda tech startup: Registered in 1 day via RDB online portal. No minimum capital requirement. 0% corporate tax for 7 years in Special Economic Zone. Kigali Innovation City houses 50+ tech companies.',
    ],
    relatedTopics: ['market-entry-rwanda', 'kenya-market-overview', 'startup-ecosystem-ea'],
    category: 'market-intelligence',
  },
  {
    id: 'fashion-industry-ea',
    topic: 'Market Intelligence',
    subtopic: 'Fashion',
    keywords: ['fashion', 'clothing', 'mitumba', 'textile', 'apparel', 'wear'],
    content: 'East African fashion market: (1) Mitumba (Secondhand) — $1B+ annually across EA. Kenya imports 100,000+ tonnes/year. Average bale: $300-600. (2) Local Manufacturing — growing but still <15% of market. EPZ factories produce for export. (3) Fast Fashion — Chinese imports dominating low-end. (4) Premium/Designer — small but growing in Nairobi, Dar, Kigali. Key segments: Men\'s casual (35%), Women\'s casual (30%), Children\'s (20%), Formal wear (15%). Online fashion: growing 30% annually. Average fashion spend: KES 5,000-15,000 per person per year.',
    tips: [
      'Mitumba offers the best margins — buy bales, sort by grade, sell at 100-300% markup',
      'Local manufacturing is growing — consider sourcing from Kenyan/Tanzanian factories',
      'Children\'s clothing has the highest repeat purchase rate — parents buy every 3-6 months',
      'Online fashion photography quality directly impacts sales — invest in good photos',
    ],
    examples: [
      'Nairobi fashion ecosystem: Gikomba Market (wholesale mitumba), Toi Market (retail), Village Market (premium), Online (Instagram sellers). Total annual market: KES 80B. Growth rate: 15% annually.',
    ],
    relatedTopics: ['wholesale-bale-market', 'sourcing-strategy', 'e-commerce-landscape-ea'],
    category: 'market-intelligence',
  },
  {
    id: 'e-commerce-landscape-ea',
    topic: 'Market Intelligence',
    subtopic: 'E-Commerce',
    keywords: ['ecommerce', 'jumia', 'kilimall', 'copia', 'online selling', 'social commerce'],
    content: 'East African e-commerce landscape: (1) Jumia — largest marketplace, operates in Kenya, Tanzania, Uganda. Commission: 15-25%. (2) Kilimall — Kenya-focused, Chinese-backed. Commission: 10-20%. (3) Copia — targets rural Kenya with agent-based model. (4) Social Commerce — Instagram + WhatsApp accounts for 60% of online sales. (5) Instagram Selling — 1M+ businesses in Kenya alone. (6) TikTok Commerce — growing rapidly, video-first. E-commerce total: ~$5B across EA, growing 25% annually. COD still 50%+ of transactions. Mobile money is primary digital payment. Last-mile delivery is the biggest challenge.',
    tips: [
      'Social commerce (Instagram + WhatsApp) has lower fees than marketplaces (0% vs 15-25%)',
      'Jumia/Kilimall provide reach but charge 15-25% commission — factor this into pricing',
      'COD is still dominant — offer it to reduce cart abandonment but verify orders before shipping',
      'Last-mile delivery partners: Sendy, Glovo, local bodaboda riders for same-day delivery',
    ],
    examples: [
      'E-commerce breakdown: Social commerce 60% (Instagram 35%, WhatsApp 25%), Marketplaces 25% (Jumia 15%, Kilimall 10%), Own website 10%, Other 5%. Average order value: KES 3,500. Conversion rate: 2-5%.',
    ],
    relatedTopics: ['e-commerce-strategy', 'whatsapp-business', 'instagram-selling'],
    category: 'market-intelligence',
  },
  {
    id: 'mobile-money-landscape',
    topic: 'Market Intelligence',
    subtopic: 'Mobile Money',
    keywords: ['m-pesa', 'mobile money', 'mpesa', 'tigo pesa', 'mtn momo', 'payment'],
    content: 'Mobile money in East Africa: (1) M-Pesa (Kenya) — 30M+ users, processes $300B+ annually. 96% of Kenyan adults use it. Merchant payments (Lipa Na M-Pesa) growing 40%/year. (2) Tigo Pesa/Vodacom M-Pesa (Tanzania) — 25M+ users. Dar es Salaam is the mobile money capital of Tanzania. (3) MTN MoMo (Uganda) — 15M+ users. Dominant platform. (4) MTN MoMo (Rwanda) — 8M+ users. Transaction fees: 1-3% depending on amount and type. Business registration: USSD short code or API integration. Bulk payments available for salary disbursement.',
    tips: [
      'M-Pesa paybill/till number is essential for any Kenyan business — customers expect it',
      'Tanzania requires EFD (fiscal device) for all M-Pesa transactions above TZS 1,000',
      'Transaction fees eat into margins — batch payments where possible',
      'M-Pesa business account gives you better rates and transaction limits',
    ],
    examples: [
      'Kenya retailer: 80% M-Pesa payments, 15% card, 5% cash. Monthly M-Pesa volume: KES 2M. Fees at 1.5%: KES 30,000. Annual: KES 360,000. Negotiated business rate: 1% → saves KES 10,000/month.',
    ],
    relatedTopics: ['checkout-system', 'payment-processing', 'currency-management'],
    category: 'market-intelligence',
  },
  {
    id: 'supply-chain-routes',
    topic: 'Market Intelligence',
    subtopic: 'Supply Routes',
    keywords: ['supply chain', 'route', 'shipping', 'china', 'india', 'dubai', 'turkey', 'freight'],
    content: 'Major supply chain routes to East Africa: (1) China → Mombasa — 21-30 days sea freight. Cheapest for electronics, textiles. Cost: $2-4/kg. (2) India → Dar es Salaam — 14-21 days. Textiles, spices, pharmaceuticals. Cost: $2-3/kg. (3) Dubai → Nairobi — 7-14 days. Electronics, re-exports, gold. Cost: $3-5/kg. (4) Turkey → Dar — 18-25 days. Leather, fashion, textiles. Cost: $3-5/kg. (5) Bangladesh → Mombasa — 25-35 days. Garments, textiles. Cost: $1.5-3/kg. (6) Local/Regional — 1-3 days. Food, agricultural products. Cost: varies by distance.',
    tips: [
      'Sea freight is 5-10x cheaper than air freight — always use sea for non-urgent shipments',
      'Consolidate shipments — 20ft container from China: $3,000-5,000 (holds 25-28 tonnes)',
      'Build relationships with freight forwarders — they can negotiate better rates',
      'Factor in port charges: Mombasa handling $100-200/tonne, Dar $80-150/tonne',
    ],
    examples: [
      'Container from China to Mombasa: 20ft container ($3,500) + insurance ($100) + clearing ($500) + duty (25% of goods value) + local transport ($200). Total: ~$5,000 + duty. If goods value is $20,000 → duty $5,000 → total $10,000. Per kg: $0.40/kg.',
    ],
    relatedTopics: ['cross-border-trade', 'import-regulations', 'logistics-planning'],
    category: 'market-intelligence',
  },
  {
    id: 'competition-landscape',
    topic: 'Market Intelligence',
    subtopic: 'Competition',
    keywords: ['competition', 'competitor', 'benchmark', 'market share', 'rival'],
    content: 'Competitive landscape in East African retail: (1) Formal Retail — Naivas (Kenya, 80+ stores), Carrefour (Kenya, 15+), Game/Shoprite (regional). (2) E-Commerce — Jumia (regional), Kilimall (Kenya), Copia (rural Kenya). (3) Social Commerce — millions of Instagram/WhatsApp sellers. (4) Wholesale Markets — Gikomba (Nairobi), Kariakoo (Dar), Owino (Kampala). (5) Shopping Malls — Sarit Centre, Two Rivers (Nairobi), Slipway (Dar), Garden City (Kampala). Key competitive advantages for SMEs: personal service, niche specialization, local knowledge, speed, flexibility.',
    tips: [
      'Don\'t try to compete with Naivas/Carrefour on price — compete on service and specialization',
      'Find your niche: premium mitumba, children\'s clothing, specific ethnic wear, etc.',
      'Monitor competitor pricing weekly — know what they charge for similar products',
      'Your advantage over big retailers: faster response, personal relationships, flexibility',
    ],
    examples: [
      'Nairobi fashion competition: Gikomba (wholesale, lowest prices), Toi Market (retail, mid-range), Boutiques (premium, high margin), Instagram sellers (convenience, delivery). Each serves a different customer segment.',
    ],
    relatedTopics: ['market-entry-kenya', 'pricing-strategy', 'e-commerce-landscape-ea'],
    category: 'market-intelligence',
  },
  {
    id: 'consumer-behavior-ea',
    topic: 'Market Intelligence',
    subtopic: 'Consumer Behavior',
    keywords: ['consumer', 'behavior', 'spending', 'habits', 'preference', 'buying'],
    content: 'East African consumer behavior: (1) Mobile-First — 80% of internet access is via smartphone. (2) Price-Sensitive — comparison shopping is standard; cheapest option often wins. (3) Trust-Driven — brand loyalty is high once trust is established. (4) COD Preference — 50%+ prefer Cash on Delivery for first-time purchases. (5) Social Proof — reviews, testimonials, and friend recommendations heavily influence purchases. (6) WhatsApp-Centric — preferred communication channel for business. (7) Cash Economy — still 70%+ cash transactions in rural areas. (8) Brand Conscious — willing to pay premium for perceived quality/authenticity.',
    tips: [
      'Offer COD for first-time customers to build trust — switch to mobile money for repeat',
      'Show customer reviews and testimonials prominently — social proof is crucial',
      'Price anchoring works — show original price crossed out next to sale price',
      'Respond to WhatsApp inquiries within 1 hour — speed = professionalism = trust',
    ],
    examples: [
      'Consumer journey: Sees product on Instagram → Asks friends about the brand → Checks WhatsApp catalog → Compares with 2-3 competitors → Orders via M-Pesa (if trusted) or COD (if new). Average: 3-5 touchpoints before purchase.',
    ],
    relatedTopics: ['e-commerce-landscape-ea', 'mobile-money-landscape', 'customer-acquisition'],
    category: 'market-intelligence',
  },
  {
    id: 'manufacturing-opportunities',
    topic: 'Market Intelligence',
    subtopic: 'Manufacturing',
    keywords: ['manufacturing', 'factory', 'production', 'epz', 'local', 'make'],
    content: 'Manufacturing opportunities in East Africa: (1) Textiles & Garments — Kenya has EPZ factories producing for export. Tanzania has cotton-growing regions (Mwanza, Shinyanga). (2) Food Processing — fruit processing (mango, pineapple), coffee roasting, tea packaging. (3) Assembly — electronics assembly, phone accessories, solar products. (4) Building Materials — cement, tiles, steel, paint. EPZ benefits: 10-year corporate tax holiday, duty-free raw materials for export, streamlined regulations. AfCFTA (African Continental Free Trade Area) opens continental market.',
    tips: [
      'Start small — cottage industry scale before investing in factory',
      'EPZ status is ideal for export-focused manufacturing — 10-year tax holiday',
      'Local sourcing of raw materials reduces costs and currency risk',
      'AfCFTA creates a continental market of 1.3B people — plan for export from day one',
    ],
    examples: [
      'Textile factory in EPZ: Investment TZS 50M. Produces 10,000 shirts/month at TZS 3,000 cost. Sells export at $5 (TZS 12,500). Monthly revenue: TZS 125M. After tax holiday: corporate tax 30%. Break-even: 8 months.',
    ],
    relatedTopics: ['sourcing-strategy', 'supply-chain-routes', 'cross-border-trade'],
    category: 'market-intelligence',
  },
  {
    id: 'import-regulations',
    topic: 'Compliance',
    subtopic: 'Import Regulations',
    keywords: ['import', 'customs', 'duty', 'kebs', 'tbs', 'unbs', 'standards', 'declaration'],
    content: 'Import regulations by country: (1) Kenya — KEBS (Kenya Bureau of Standards) certification required for most goods. Import Declaration Form (IDF) via Kenya TradeNet System. Duty rates: Electronics 25%, Textiles 25-35%, Food 10-25%. (2) Tanzania — TBS (Tanzania Bureau of Standards) certification. Customs entry via Tanzania Revenue Authority. Duty rates similar to Kenya. (3) Uganda — UNBS (Uganda National Bureau of Standards). Import duty + VAT (18%). (4) Rwanda — RBS (Rwanda Bureau of Standards). Easier process, lower duties. Required documents: Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, Product Standards Certificate.',
    tips: [
      'Get a clearing agent for your first 10 shipments — the process is complex',
      'KEBS/TBS/UNBS certification can take 2-4 weeks — apply before shipment arrives',
      'Incorrect declarations can result in seizure + fines — be accurate with values and quantities',
      'COMESA Certificate of Origin reduces duties between member states by 10-25%',
    ],
    examples: [
      'Importing 500kg of cotton shirts from China to Kenya: CIF value $2,500. Duty: 25% × $2,500 = $625. VAT: 16% × ($2,500 + $625) = $500. KEBS fee: $100. IDF fee: $50. Clearing agent: $200. Total import cost: $1,475 (59% of goods value).',
    ],
    relatedTopics: ['cross-border-trade', 'compliance-guide', 'tax-compliance-kenya'],
    category: 'legal',
  },
  {
    id: 'startup-ecosystem-ea',
    topic: 'Market Intelligence',
    subtopic: 'Startup Ecosystem',
    keywords: ['startup', 'ecosystem', 'hub', 'accelerator', 'incubator', 'funding'],
    content: 'East African startup ecosystem: (1) Kenya — most mature. iHub (Nairobi), CcHub (Nairobi), Founders Factory Africa. $1B+ raised in 2023. (2) Rwanda — fastest-growing. kLab (Kigali), Rwanda Development Board support. (3) Tanzania — emerging. Buni Hub (Dar), Village Capital accelerator. (4) Uganda — growing. Outbox (Kampala), Startup Uganda. Key sectors: Fintech (40%), Agritech (20%), E-commerce (15%), Healthtech (10%), Other (15%). Funding stages: Pre-seed ($10K-100K), Seed ($100K-500K), Series A ($500K-5M). Government support: Rwanda offers 7-year tax holiday for tech startups in special zones.',
    tips: [
      'Join a co-working space or hub for networking and mentorship',
      'Apply to accelerators — they provide funding, mentorship, and investor connections',
      'Build traction before seeking investment — revenue speaks louder than pitch decks',
      'Attend tech events: Africa Technology Summit, Africa Fintech Summit, DEMO Africa',
    ],
    examples: [
      'Kenyan fintech startup: Raised $500K seed from TLcom Capital. Product: mobile lending for SMEs. Post-seed: 10,000 users, $500K ARR. Next: Series A targeting $3-5M for expansion to Tanzania and Uganda.',
    ],
    relatedTopics: ['investment-readiness', 'kenya-market-overview', 'rwanda-market-overview'],
    category: 'market-intelligence',
  },
  {
    id: 'agriculture-products',
    topic: 'Market Intelligence',
    subtopic: 'Agriculture',
    keywords: ['agriculture', 'coffee', 'tea', 'farming', 'food', 'cashew', 'macadamia'],
    content: 'Agricultural products from East Africa: (1) Coffee — Kenya AA is among world\'s best ($6-12/kg green). Tanzania Peaberry ($4-8/kg). Uganda Robusta ($3-5/kg). (2) Tea — Kenya is world\'s largest black tea exporter. Tanzania grows premium highland tea. (3) Horticulture — Kenya exports cut flowers (€500M+), vegetables, herbs to Europe. (4) Cashew Nuts — Tanzania is Africa\'s largest producer (Mtwara region). Raw: $1-2/kg, Processed: $4-8/kg. (5) Macadamia Nuts — Kenya is world\'s 3rd largest producer ($6-10/kg). (6) Spices — Zanzibar (cloves, vanilla, cardamom). Huge value-addition opportunity.',
    tips: [
      'Coffee roasting locally adds 200-400% value over green bean export',
      'Macadamia farming in Kenya has 10-year payback but 40%+ annual returns thereafter',
      'Zanzibar spices are world-class — packaging and branding can create premium export products',
      'Value-addition (processing, packaging, branding) is the key to unlocking agricultural wealth',
    ],
    examples: [
      'Kenya AA coffee: Farm gate price KES 600/kg. Roasted and packaged (250g): KES 1,500 retail. Value addition: 6x. Export to US/EU: $15-25/250g bag. Opportunity: Start with small roaster (KES 200K), roast 50kg/week.',
    ],
    relatedTopics: ['sourcing-strategy', 'cross-border-trade', 'manufacturing-opportunities'],
    category: 'market-intelligence',
  },
  {
    id: 'currency-trends',
    topic: 'Market Intelligence',
    subtopic: 'Currency',
    keywords: ['currency', 'exchange rate', 'forex', 'kes', 'tzs', 'ugx', 'fluctuation'],
    content: 'Currency trends in East Africa: (1) KES/USD — fluctuates between 130-160. Volatile during election years and global events. (2) TZS/USD — gradual depreciation, 2,300-2,600 range. (3) UGX/USD — relatively stable, 3,500-3,800 range. (4) RWF/USD — tightly managed, 1,000-1,300 range. Impact on business: If KES weakens, imports become more expensive (higher cost of goods), but exports become more competitive. Hedging strategies: (a) Hold some USD stock, (b) Buy forward contracts for large orders, (c) Price contracts in USD for international suppliers, (d) Diversify suppliers across countries.',
    tips: [
      'Price your products with a 5-10% currency buffer to absorb fluctuations',
      'Buy USD when rates are favorable — hold as reserve for import payments',
      'For large orders (>TZS 5M), consider forward contracts with your bank',
      'Track KES/USD daily — it affects all imported goods pricing',
    ],
    examples: [
      'Importer buys from China in USD. Order: $5,000. At KES 145/$: cost KES 725,000. At KES 155/$: cost KES 775,000. Difference: KES 50,000 (7%). Solution: Buy USD in advance when rate is favorable, or add 10% currency buffer to pricing.',
    ],
    relatedTopics: ['currency-system', 'risk-management', 'import-regulations'],
    category: 'market-intelligence',
  },
];

/**
 * Search the knowledge base for entries matching a query
 */
export function searchKnowledge(query: string, limit: number = 5): KnowledgeEntry[] {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/).filter(w => w.length > 2);

  const scored = KNOWLEDGE_BASE.map(entry => {
    let score = 0;
    // Keyword match (highest weight)
    for (const keyword of entry.keywords) {
      if (queryLower.includes(keyword)) score += 10;
    }
    // Topic match
    if (queryLower.includes(entry.topic.toLowerCase())) score += 5;
    if (queryLower.includes(entry.subtopic.toLowerCase())) score += 5;
    // Content word match
    for (const word of words) {
      if (entry.content.toLowerCase().includes(word)) score += 2;
      if (entry.tips.some(t => t.toLowerCase().includes(word))) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

/**
 * Get related entries by ID
 */
export function getRelatedEntries(id: string): KnowledgeEntry[] {
  const entry = KNOWLEDGE_BASE.find(e => e.id === id);
  if (!entry) return [];
  return entry.relatedTopics
    .map(rid => KNOWLEDGE_BASE.find(e => e.id === rid))
    .filter((e): e is KnowledgeEntry => e !== undefined);
}

/**
 * Get entries by category
 */
export function getEntriesByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
  return KNOWLEDGE_BASE.filter(e => e.category === category);
}
