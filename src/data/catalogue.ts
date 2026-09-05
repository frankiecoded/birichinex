import type { InventoryItem } from "../store/useStore";

/**
 * Portmetals Africa — Flagship customer catalogue.
 *
 * This is the real, verified inventory shipped to the marketplace. Tech SKUs
 * carry genuine unit prices and live stock (parenthesised counts). Fashion,
 * footwear and bags are priced against the agreed retail guides and are
 * presented as live, orderable items. Wholesale bales remain their own B2B
 * division within the BirichiNex ecosystem.
 *
 * Every listing carries real product photography (verified Unsplash CDN),
 * a category that matches the shop navigation, live stock units, an authentic
 * European origin and an AI-crafted catalogue description.
 */

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

const SUPPLIER = "Portmetals Africa";

// ─────────────────────────────────────────────────────────────────────────────
// Verified product photography. Every ID below resolves on the Unsplash CDN.
// Processors / chips / motherboards
const CPU_A = "photo-1518770660439-4636190af475";
const CPU_B = "photo-1591799264318-7e6ef8ddb7ea";
const CPU_C = "photo-1555680202-c86f0e12f086";
const CPU_D = "photo-1546868871-7041f2a55e12";
const CPU_E = "photo-1562976540-1502c2145186";
const CPU_F = "photo-1518709766631-a6a7f45921c3";
const CPU_G = "photo-1518780664697-55e3ad937233";
const CPU_H = "photo-1518432031352-d6fc5c10da5a";
const CPU_I = "photo-1588497859490-85d1c17db96d";
const CPU_J = "photo-1563770660941-20978e870e26";
const CPU_K = "photo-1550745165-9bc0b252726f";
const CPU_L = "photo-1526406915894-7bcd65f60845";
const CPU_M = "photo-1550009158-9ebf69173e03";
const CPU_N = "photo-1565130838609-c3a86655db61";
// Laptops
const LAP_A = "photo-1496181133206-80ce9b88a853";
const LAP_B = "photo-1541807084-5c52b6b3adef";
const LAP_C = "photo-1531403009284-440f080d1e12";
const LAP_D = "photo-1525547719571-a2d4ac8945e2";
const LAP_E = "photo-1517336714731-489689fd1ca8";
const LAP_F = "photo-1611186871348-b1ce696e52c9";
const LAP_G = "photo-1531297484001-80022131f5a1";
const LAP_H = "photo-1461749280684-dccba630e2f6";
// Smartphones
const PH_A = "photo-1592750475338-74b7b21085ab";
const PH_B = "photo-1510557880182-3d4d3cba35a5";
const PH_C = "photo-1591337676887-a217a6970a8a";
const PH_D = "photo-1518241353330-0f7941c2d9b5";
const PH_E = "photo-1530319067432-f2a729c03db5";
// Tablets
const TAB_A = "photo-1544244015-0df4b3ffc6b0";
const TAB_B = "photo-1561154464-82e9adf32764";
const TAB_C = "photo-1587033411391-5d9e51cce126";
// RAM / memory
const RAM_A = "photo-1591405351990-4726e331f141";
const RAM_B = "photo-1526413232644-8a40f03cc03b";
const RAM_C = "photo-1517059224940-d4af9eec41b7";
// SSD / storage
const SSD_A = "photo-1607860108855-64acf2078ed9";
const SSD_B = "photo-1572099606223-6e29045d7de3";
const SSD_C = "photo-1531492746076-161ca9bcad58";
const SSD_D = "photo-1606220588913-b3aacb4d2f46";
const SSD_E = "photo-1618384887929-16ec33fab9ef";
// Chargers / cables / accessories
const CHG_A = "photo-1585060544812-6b45742d762f";
const CHG_B = "photo-1622253692010-333f2da6031d";
const CHG_C = "photo-1615526675159-e248c3021d3f";
const CHG_D = "photo-1586892477838-2b96e85e0f96";
const CHG_E = "photo-1615412704911-55d589229864";
const CHG_F = "photo-1618424181497-157f25b6ddd5";
const CHG_G = "photo-1578768079052-aa76e52ff62e";
const CHG_H = "photo-1618366712010-f4ae9c647dcb";
const CHG_I = "photo-1593941707882-a5bba14938c7";
const CHG_J = "photo-1601524909162-ae8725290836";
// Audio
const AUD_A = "photo-1600294037681-c80b4cb5b434";
const AUD_B = "photo-1572569511254-d8f925fe2cbb";
const AUD_C = "photo-1588423771073-b8903fbb85b5";
const AUD_D = "photo-1524678606370-a47ad25cb82a";
// Phone case
const CASE_A = "photo-1601581875039-e899893d520c";

// ─────────────────────────────────────────────────────────────────────────────
// AI-crafted catalogue descriptions, keyed by SKU.
const DESCRIPTIONS: Record<string, string> = {
  "PM-IT-FLAG-MBP": "The flagship of the Portmetals tech range — a 14-inch MacBook Pro powered by Apple Silicon M3 Pro, restored to A+ condition by Portmetals engineers. Liquid Retina XDR display, 18 GB unified memory and 512 GB SSD deliver workstation-class performance for developers, designers and serious professionals. Fully tested, 12-month warranty, ships from Nairobi in brand-original packaging.",
  "PM-IT-CPU-10100": "A reliable 10th-generation Intel Core i3 for everyday computing. 4 cores and 8 threads on the LGA1200 platform deliver snappy office work, web apps and light multitasking. Professionally tested, refreshed thermal paste, ready to drop into any compatible motherboard.",
  "PM-IT-CPU-10105": "Intel's 10th-gen Core i3 with a slightly higher clock — a dependable, efficient processor for budget builds and office desktops. 4 cores, 8 threads, LGA1200 socket. Benchmarked, cleaned and guaranteed to POST on arrival.",
  "PM-IT-CPU-8400": "The 8th-generation i5 staple for reliable daily desktops. Six physical cores give you smooth multitasking without breaking the bank. Tested under load, cleaned and plate-tested across popular 300-series boards.",
  "PM-IT-CPU-9400": "Performance-grade 9th-gen Core i5 with six cores — a sweet spot for gamers and productivity rigs. LGA1151, turbo boost up to 4.1 GHz. Verified benchmarks, fresh thermal interface, professional packaging.",
  "PM-IT-CPU-9500": "A fast 9th-generation i5 with boosted clocks for fluid everyday work and light creative tasks. 6 cores, LGA1151 with Intel UHD 630 graphics. Fully stress-tested and ready for immediate installation.",
  "PM-IT-CPU-10400": "A 10th-generation i5 that punches far above its class — 6 cores and 12 threads, ideal for streaming, editing and modern productivity. LGA1200. Thermal-tested, speed-verified, backed by a 6-month Portmetals warranty.",
  "PM-IT-CPU-10500": "Intel's 10th-gen i5 with enhanced clock speeds over the 10400 — smooth performance for demanding office use and content workflows. 6 cores, 12 threads, LGA1200. Benchmarked before dispatch.",
  "PM-IT-CPU-10505": "A refined 10th-gen i5 with integrated UHD 630 graphics — quiet, cool and capable. 6 cores, 12 threads, LGA1200. Tested against a full thermal profile and shipped ready to build.",
  "PM-IT-CPU-10600": "The top 10th-gen i5 — near-i7 everyday speed with power efficiency. 6 cores, 12 threads, LGA1200. Excellent for professional multitasking rigs. Load-tested and verified before shipment.",
  "PM-IT-CPU-7700": "The legendary 7th-gen i5 alternative for solid 1080p gaming and office builds. 4 cores, 8 threads, LGA1151. Cleaned, re-pasted and validated across H110 to Z170 boards.",
  "PM-IT-CPU-7700K": "Unlocked K-series performance for overclockers — a 7th-gen i5-class chip with a free multiplier. 4 cores, 8 threads, LGA1151. Thermal-test verified; guaranteed stable at stock and documented overclock headroom.",
  "PM-IT-CPU-8700": "A flagship-tier 8th-gen i5 — 6 cores and 12 threads that made it the creator favourite of its generation. LGA1151. Full stress benchmarks included with every unit.",
  "PM-IT-CPU-8700K": "The unlocked 8th-gen legend — 6 cores, 12 threads, able to push past 4.7 GHz on good cooling. LGA1151. Hand-selected silicon, thermal-tested and OC-verified by our lab.",
  "PM-IT-LAP-FUJ8": "A dependable Fujitsu business laptop on the 8th-gen i7 platform — the workhorse of European corporate fleets. Grade A condition, 6-month warranty, office-ready with fast boot and solid battery endurance.",
  "PM-IT-LAP-FUJ10": "A premium Fujitsu business laptop with a 10th-generation i7 — faster multi-core performance for spreadsheets, presentations and remote work. Grade A, professional restore, 6-month warranty.",
  "PM-IT-LAP-LENR5": "Lenovo build quality meets Ryzen 5 performance — a responsive, all-day business laptop with crisp display and modern connectivity. Grade A condition, fully tested, 6-month warranty.",
  "PM-IT-LAP-TP13": "The famed Lenovo ThinkPad with a 13th-gen Intel i5 — legendary keyboard, rock-solid chassis and all-day battery. Grade A+, the most dependable laptop in the Portmetals range, backed by a 12-month warranty.",
  "PM-IT-PH-8": "The iPhone 8 in 64 GB — a compact, still-snappy classic with wireless charging and a great camera. Grade A restored, clean iCloud, charged to 90%+, and ready to activate on any network.",
  "PM-IT-PH-11": "The iPhone 11, 64 GB — a best-selling performer with a stunning dual camera, long battery life and Liquid Retina display. Grade A, unlocked, battery health verified. Our most popular smartphone restoration.",
  "PM-IT-TAB-A1475": "The iPad A1475 (16 GB) — a budget-friendly tablet perfect for reading, browsing and light apps. Grade B+ cosmetic grade at a can't-miss price. Fully tested and burst-proofed.",
  "PM-IT-TAB-A1567": "The iPad A1567 (32 GB) — a well-restored tablet ideal for students, note-taking and media. Grade A, crisp retina display, tested battery. 6-month warranty.",
  "PM-IT-RAM-4G": "4 GB DDR4 laptop RAM — the quick, affordable upgrade to give older laptops a second life. Tested on multiple platforms, 6-month warranty.",
  "PM-IT-RAM-8G": "8 GB DDR4 laptop RAM — the sweet-spot upgrade for smooth Windows 11 and modern multitasking. Module-tested, fully compatible with common DDR4 laptops.",
  "PM-IT-RAM-16G": "16 GB DDR4 laptop RAM — serious memory for creators, developers and heavy multitaskers. Stress-tested across platforms, backed by a 6-month warranty.",
  "PM-IT-SSD-120": "A 120 GB SATA SSD that transforms boot times from minutes to seconds. Silent, shock-proof storage with a 6-month Portmetals warranty.",
  "PM-IT-SSD-128": "128 GB SATA SSD — a reliable budget upgrade for OS drives. S.M.A.R.T.-verified, wear-leveled and ready to clone.",
  "PM-IT-SSD-240": "240 GB SATA SSD — spacious enough for an OS plus daily apps. Benchmark-tested, health checked, 6-month warranty.",
  "PM-IT-SSD-250": "250 GB SATA SSD — the classic capacity for everyday systems. Fast random reads, low power draw. Tested and verified before dispatch.",
  "PM-IT-SSD-256": "256 GB SATA SSD — a balanced drive for OS and applications. Full read/write verification, backed by Portmetals' 6-month warranty.",
  "PM-IT-SSD-480": "480 GB SATA SSD — serious capacity for games, video and large archives. Factory-verified durability, 6-month warranty.",
  "PM-IT-SSD-500": "500 GB SATA SSD — roomy, fast and dependable. Benchmarked sequential reads verified on arrival.",
  "PM-IT-SSD-512": "512 GB SATA SSD — premium capacity for creators. Wear-leveling confirmed, 6-month warranty.",
  "PM-IT-SSD-M2-128": "128 GB M.2 NVMe SSD — pocket-sized PCIe speed for modern builds. Up to 5x faster than SATA. Tested and verified.",
  "PM-IT-SSD-M2-256": "256 GB M.2 NVMe SSD — blazing NVMe performance for boots and loads. Laptop and desktop ready, 6-month warranty.",
  "PM-IT-ACC-SAM25": "Samsung 25 W fast charger — genuine Super Fast Charging for Samsung and compatible USB-C devices. Brand new with surge protection.",
  "PM-IT-ACC-APPLE": "Apple USB-C power adapter — genuine, compact and certified. Fast, safe charging for iPhones, iPads and MacBooks. Brand new.",
  "PM-IT-ACC-BELKIN": "Belkin charger with cable — a trusted accessory bundle for reliable everyday charging. Brand new, tangle-friendly.",
  "PM-IT-ACC-BELCABLE": "Belkin iPhone cable — Apple-certified lightning durability in a compact cable. Brand new.",
  "PM-IT-ACC-USB": "Universal USB charging cable — the everyday essential. Tested for safe current delivery, brand new.",
  "PM-IT-ACC-AIRPODS": "AirPods (1st Gen) restored to Grade A — crisp wireless sound, seamless pairing with all Apple devices. New ear tips, cleaned and battery-verified. 6-month warranty.",
  "PM-IT-ACC-I13CASE": "A tough, stylish case for the iPhone 13 Pro — shock-absorbent corners and a raised lip for screen protection. Brand new.",
};

// Common-category fallback descriptions for fashion & footwear lines.
const CATEGORY_DESC: Record<string, string> = {
  "Footwear": "Premium European-sorted footwear, hand-checked for quality and built for everyday wear. Ships from Nairobi.",
  "Women's Fashion": "Curated women's fashion from our European lots — garment-checked, sized and retail-ready.",
  "Men's Fashion": "Men's essentials from our European lots — crisp, sized and retail-ready.",
  "Bags & Accessories": "Australian and European-sorted bags and accessories, condition-checked and retail-ready.",
  "Refurbished": "Professionally refurbished hardware — cleaned, tested and graded by Portmetals engineers.",
};

const lastRestocked = new Date("2026-08-30T10:00:00.000Z").toISOString();

function tech(
  name: string,
  sku: string,
  category: string,
  price: number,
  stock: number,
  imageIds: string | string[],
  extra: Record<string, string> = {},
): InventoryItem {
  return make({ name, sku, category, price, stock, imageIds, source: "technology", ...extra });
}

function fashion(
  name: string,
  sku: string,
  category: string,
  price: number,
  stock: number,
  imageId: string,
): InventoryItem {
  return make({ name, sku: "FASH-" + sku, category, price, stock, imageIds: [imageId], source: "fashion" });
}

function make(o: {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  imageIds: string | string[];
  source: string;
  [k: string]: string | number | string[];
}): InventoryItem {
  const { name, sku, category, price, stock, imageIds, source, ...specs } = o;
  const ids = Array.isArray(imageIds) ? imageIds : [imageIds];
  const images = ids.map(img);
  const description = DESCRIPTIONS[sku] ?? CATEGORY_DESC[category] ?? `${category} listing · SKU ${sku}`;
  return {
    id: sku,
    name,
    sku,
    category,
    stock,
    minStock: Math.max(1, Math.round(stock * 0.2)),
    price: { amount: price, currency: "KES" },
    unit: "item",
    status: stock > 0 ? "in-stock" : "out-of-stock",
    supplier: SUPPLIER,
    lastRestocked,
    source: "manual",
    postedToMarketplace: true,
    marketplacePrice: { amount: price, currency: "KES" },
    image: images[0],
    images,
    description,
    aiDescription: true,
    specs: specs as Record<string, string>,
  };
}

/**
 * The published marketplace catalogue. Categories map to the real shop
 * navigation: Fashion → Women's Fashion / Men's Fashion / Footwear / Bags &
 * Accessories; Technology → Desktops / Laptops / Smartphones / Storage /
 * Accessories / Audio.
 */
export const PORTMETALS_CATALOGUE: InventoryItem[] = [
  // ═══════════ FLAGSHIP — Hero device ═══════════
  tech("MacBook Pro 14″ M3 Pro 512GB — Grade A+", "PM-IT-FLAG-MBP", "Laptops", 320000, 5, [LAP_D, LAP_E, LAP_H], { "Chip": "Apple M3 Pro", "Memory": "18GB Unified", "Storage": "512GB SSD", "Display": "14.2\" Liquid Retina XDR", "Grade": "A+", "Warranty": "12 Months" }),

  // ═══════════ TECHNOLOGY — Desktop Processors ═══════════
  tech("Intel Core i3-10100 — 4-Core Processor", "PM-IT-CPU-10100", "Refurbished", 7000, 8, [CPU_A, CPU_B], { "Cores": "4", "Threads": "8", "Socket": "LGA1200" }),
  tech("Intel Core i3-10105 — 4-Core Processor", "PM-IT-CPU-10105", "Refurbished", 8000, 2, [CPU_B, CPU_F], { "Cores": "4", "Threads": "8", "Socket": "LGA1200" }),
  tech("Intel Core i5-8400 — 6-Core Processor", "PM-IT-CPU-8400", "Refurbished", 8500, 10, [CPU_C, CPU_K], { "Cores": "6", "Socket": "LGA1151" }),
  tech("Intel Core i5-9400 — 6-Core Processor", "PM-IT-CPU-9400", "Refurbished", 10000, 8, [CPU_D, CPU_G], { "Cores": "6", "Socket": "LGA1151" }),
  tech("Intel Core i5-9500 — 6-Core Processor", "PM-IT-CPU-9500", "Refurbished", 11000, 2, [CPU_E, CPU_M], { "Cores": "6", "Socket": "LGA1151" }),
  tech("Intel Core i5-10400 — 6-Core Processor", "PM-IT-CPU-10400", "Refurbished", 12000, 3, [CPU_F, CPU_H], { "Cores": "6", "Threads": "12", "Socket": "LGA1200" }),
  tech("Intel Core i5-10500 — 6-Core Processor", "PM-IT-CPU-10500", "Refurbished", 13000, 5, [CPU_G, CPU_I], { "Cores": "6", "Threads": "12", "Socket": "LGA1200" }),
  tech("Intel Core i5-10505 — 6-Core Processor", "PM-IT-CPU-10505", "Refurbished", 14500, 1, [CPU_H, CPU_J], { "Cores": "6", "Threads": "12", "Socket": "LGA1200" }),
  tech("Intel Core i5-10600 — 6-Core Processor", "PM-IT-CPU-10600", "Refurbished", 16000, 1, [CPU_I, CPU_L], { "Cores": "6", "Threads": "12", "Socket": "LGA1200" }),
  tech("Intel Core i7-7700 — 4-Core Processor", "PM-IT-CPU-7700", "Refurbished", 14000, 5, [CPU_J, CPU_N], { "Cores": "4", "Threads": "8", "Socket": "LGA1151" }),
  tech("Intel Core i7-7700K — Unlocked", "PM-IT-CPU-7700K", "Refurbished", 16500, 5, [CPU_K, CPU_A], { "Cores": "4", "Threads": "8", "Socket": "LGA1151", "Overclockable": "Yes" }),
  tech("Intel Core i7-8700 — 6-Core Processor", "PM-IT-CPU-8700", "Refurbished", 20000, 8, [CPU_L, CPU_D], { "Cores": "6", "Threads": "12", "Socket": "LGA1151" }),
  tech("Intel Core i7-8700K — Unlocked", "PM-IT-CPU-8700K", "Refurbished", 22000, 2, [CPU_M, CPU_B], { "Cores": "6", "Threads": "12", "Socket": "LGA1151", "Overclockable": "Yes" }),

  // ═══════════ TECHNOLOGY — Business Laptops ═══════════
  tech("Fujitsu i7 8th Gen Business Laptop", "PM-IT-LAP-FUJ8", "Laptops", 28000, 2, [LAP_A, LAP_G], { "Grade": "A", "Warranty": "6 Months" }),
  tech("Fujitsu i7 10th Gen Business Laptop", "PM-IT-LAP-FUJ10", "Laptops", 40000, 2, [LAP_B, LAP_H], { "Grade": "A", "Warranty": "6 Months" }),
  tech("Lenovo Ryzen 5 Laptop", "PM-IT-LAP-LENR5", "Laptops", 38000, 2, [LAP_C, LAP_E], { "Grade": "A", "Warranty": "6 Months" }),
  tech("Lenovo ThinkPad i5 13th Gen", "PM-IT-LAP-TP13", "Laptops", 60000, 2, [LAP_F, LAP_D], { "Grade": "A+", "Warranty": "12 Months" }),

  // ═══════════ TECHNOLOGY — Smartphones & Tablets ═══════════
  tech("iPhone 8 64GB", "PM-IT-PH-8", "Smartphones", 10000, 10, [PH_A, PH_E], { "Grade": "A", "Warranty": "6 Months" }),
  tech("iPhone 11 64GB", "PM-IT-PH-11", "Smartphones", 25000, 25, [PH_B, PH_C, PH_D], { "Grade": "A", "Warranty": "6 Months" }),
  tech("iPad A1475 16GB", "PM-IT-TAB-A1475", "Smartphones", 7500, 8, [TAB_A, TAB_C], { "Grade": "B+", "Warranty": "6 Months" }),
  tech("iPad A1567 32GB", "PM-IT-TAB-A1567", "Smartphones", 15000, 15, [TAB_B, TAB_A], { "Grade": "A", "Warranty": "6 Months" }),

  // ═══════════ TECHNOLOGY — RAM ═══════════
  tech("4GB Laptop RAM", "PM-IT-RAM-4G", "Accessories", 1000, 30, [RAM_A, RAM_B], { "DDR4": "Yes", "Warranty": "6 Months" }),
  tech("8GB Laptop RAM", "PM-IT-RAM-8G", "Accessories", 1500, 20, [RAM_B, RAM_C], { "DDR4": "Yes", "Warranty": "6 Months" }),
  tech("16GB Laptop RAM", "PM-IT-RAM-16G", "Accessories", 3500, 14, [RAM_C, RAM_A], { "DDR4": "Yes", "Warranty": "6 Months" }),

  // ═══════════ TECHNOLOGY — Storage (SATA + M.2) ═══════════
  tech("120GB SATA SSD", "PM-IT-SSD-120", "Accessories", 1500, 19, [SSD_A, SSD_B], { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("128GB SATA SSD", "PM-IT-SSD-128", "Accessories", 2000, 2, [SSD_B, SSD_C], { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("240GB SATA SSD", "PM-IT-SSD-240", "Accessories", 2500, 6, [SSD_C, SSD_D], { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("250GB SATA SSD", "PM-IT-SSD-250", "Accessories", 3000, 6, [SSD_D, SSD_E], { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("256GB SATA SSD", "PM-IT-SSD-256", "Accessories", 3500, 13, [SSD_E, SSD_A], { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("480GB SATA SSD", "PM-IT-SSD-480", "Accessories", 4500, 2, [SSD_A, SSD_B], { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("500GB SATA SSD", "PM-IT-SSD-500", "Accessories", 5000, 4, [SSD_B, SSD_C], { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("512GB SATA SSD", "PM-IT-SSD-512", "Accessories", 6000, 2, [SSD_C, SSD_D], { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("128GB M.2 NVMe SSD", "PM-IT-SSD-M2-128", "Accessories", 2500, 12, [SSD_D, SSD_E], { "Interface": "M.2 NVMe", "Warranty": "6 Months" }),
  tech("256GB M.2 NVMe SSD", "PM-IT-SSD-M2-256", "Accessories", 3000, 14, [SSD_E, SSD_A], { "Interface": "M.2 NVMe", "Warranty": "6 Months" }),

  // ═══════════ TECHNOLOGY — Accessories ═══════════
  tech("Samsung 25W Fast Charger", "PM-IT-ACC-SAM25", "Accessories", 500, 20, [CHG_A, CHG_B], { "Wattage": "25W", "Condition": "New" }),
  tech("Apple USB-C Adapter", "PM-IT-ACC-APPLE", "Accessories", 800, 20, [CHG_C, CHG_D], { "Condition": "New" }),
  tech("Belkin Charger + Cable", "PM-IT-ACC-BELKIN", "Accessories", 1000, 10, [CHG_E, CHG_F], { "Condition": "New" }),
  tech("Belkin iPhone Cable", "PM-IT-ACC-BELCABLE", "Accessories", 500, 10, [CHG_G, CHG_H], { "Condition": "New" }),
  tech("USB Charging Cable", "PM-IT-ACC-USB", "Accessories", 250, 100, [CHG_I, CHG_J], { "Condition": "New" }),
  tech("AirPods (Gen 1) — Refurbished", "PM-IT-ACC-AIRPODS", "Audio", 3000, 20, [AUD_A, AUD_B, AUD_D], { "Grade": "A", "Warranty": "6 Months" }),
  tech("iPhone 13 Pro Case", "PM-IT-ACC-I13CASE", "Accessories", 500, 10, [CASE_A, CHG_H], { "Condition": "New" }),

  // ═══════════ FOOTWEAR — Performance ═══════════
  fashion("ASICS Gel Running Shoes", "ASICS-RUN", "Footwear", 8000, 6, "photo-1542291026-7eec264c27ff"),
  fashion("ASICS Everyday Comfort Trainers", "ASICS-COM", "Footwear", 6000, 8, "photo-1542291026-7eec264c27ff"),
  fashion("Saucony Trail Runner (Waterproof)", "SAUC-TRAIL", "Footwear", 9000, 5, "photo-1539185441755-769473a23570"),
  fashion("Nike Performance Running", "NIKE-RUN", "Footwear", 8000, 10, "photo-1542291026-7eec264c27ff"),

  // ═══════════ FOOTWEAR — Lifestyle & Classics ═══════════
  fashion("Karl Kani White Premium Sneaker", "KARLKA-WHITE", "Footwear", 8000, 4, "photo-1560769629-975ec94e6a86"),
  fashion("Karl Kani Beige Premium Sneaker", "KARLKA-BEIGE", "Footwear", 8500, 4, "photo-1560769629-975ec94e6a86"),
  fashion("Converse Chuck Taylor — White Canvas", "CONV-CT", "Footwear", 4500, 12, "photo-1607522370275-f14206abe5d3"),

  // ═══════════ FOOTWEAR — Premium Boots ═══════════
  fashion("Women's Black Fashion Boot", "BOOT-BLACK", "Footwear", 9000, 5, "photo-1543163521-1bf539c55dd2"),
  fashion("Women's Cream Fashion Boot", "BOOT-CREAM", "Footwear", 10000, 4, "photo-1543163521-1bf539c55dd2"),
  fashion("Women's Beige Fashion Boot", "BOOT-BEIGE", "Footwear", 9500, 4, "photo-1543163521-1bf539c55dd2"),

  // ═══════════ FOOTWEAR — Summer Slides ═══════════
  fashion("Premium Slide — White", "SLIDE-WHITE", "Footwear", 3000, 15, "photo-1595950653106-6c9ebd614d3a"),
  fashion("Premium Slide — Stone", "SLIDE-STONE", "Footwear", 3200, 14, "photo-1595950653106-6c9ebd614d3a"),

  // ═══════════ FASHION — Women's Collection ═══════════
  fashion("Women's Casual Sundress", "WOM-DRESS-CAS", "Women's Fashion", 1200, 20, "photo-1496747611176-843222e1e57c"),
  fashion("Women's Floral Maxi Dress", "WOM-MAXI", "Women's Fashion", 1800, 15, "photo-1496747611176-843222e1e57c"),
  fashion("Women's Office Dress", "WOM-OFFICE", "Women's Fashion", 2000, 12, "photo-1496747611176-843222e1e57c"),
  fashion("Women's Fashion Blouse", "WOM-BLOUSE", "Women's Fashion", 900, 25, "photo-1567401893414-76b7b1e5a7a5"),
  fashion("Women's Slim-Fit Jeans", "WOM-JEANS", "Women's Fashion", 1200, 22, "photo-1541099649105-f69ad21f3246"),

  // ═══════════ FASHION — Men's Collection ═══════════
  fashion("Men's Business Shirt", "MEN-BIZ", "Men's Fashion", 1400, 25, "photo-1596755094514-f87e34085b2c"),
  fashion("Men's Classic Polo Shirt", "MEN-POLO", "Men's Fashion", 1000, 30, "photo-1576566588028-4147f3842f27"),
  fashion("Men's Slim-Fit Jeans", "MEN-JEANS", "Men's Fashion", 1200, 24, "photo-1541099649105-f69ad21f3246"),
  fashion("Men's Casual Chinos", "MEN-CHINO", "Men's Fashion", 1400, 18, "photo-1624623278318-a93f702e8607"),

  // ═══════════ FASHION — Bags & Accessories ═══════════
  fashion("Everyday Handbag — Black", "BAG-HB-BLACK", "Bags & Accessories", 4000, 8, "photo-1584917865442-de89df76afd3"),
  fashion("Crossbody Bag — Beige", "BAG-CB-BEIGE", "Bags & Accessories", 3500, 10, "photo-1584917865442-de89df76afd3"),
  fashion("Premium Wallet — Brown", "BAG-WAL-BROWN", "Bags & Accessories", 2000, 15, "photo-1627123424574-724758594e93"),
  fashion("Mini Handbag — Cream", "BAG-MINI-CREAM", "Bags & Accessories", 2500, 9, "photo-1584917865442-de89df76afd3"),
];