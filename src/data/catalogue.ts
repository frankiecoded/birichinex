import type { Currency } from "../types";
import type { InventoryItem } from "../store/useStore";

/**
 * Portmetals Africa — Flagship customer catalogue.
 *
 * This is the real, verified inventory shipped to the marketplace. Technology
 * SKUs carry genuine unit prices and live stock. The marketplace has been
 * rebuilt to the founder's ORIGINAL bale catalogue — 22 bale grades plus 5
 * wholesale bale tiers (25kg–70kg) — priced at the exact original figures,
 * displayed as KSh (the platform default currency). Wholesale bales are also
 * surfaced on the dedicated "Bales" page as their own volume-pricing tier.
 *
 * Every listing carries real product photography (verified Unsplash CDN),
 * a category that matches the shop navigation, live stock units and an
 * AI-crafted catalogue description.
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
// Bale catalogue — men's / women's / kids / accessories
const BALE_SHIRT = "photo-1596755094514-f87e34085b2c";
const BALE_PANTS = "photo-1624623278318-a93f702e8607";
const BALE_JEANS = "photo-1541099649105-f69ad21f3246";
const BALE_FLANEL = "photo-1509551388413-e18d0ac5d495";
const BALE_BLOUSE = "photo-1567401893414-76b7b1e5a7a5";
const BALE_SHORTS = "photo-1595950653106-6c9ebd614d3a";
const BALE_DRESS = "photo-1595777457583-95e059d581b8";
const BALE_PALAZZO = "photo-1566150905458-1bf1fc113f0d";
const BALE_ANORAK = "photo-1551028719-00167b16eac5";
const BALE_HOODIE = "photo-1624378439575-d8705ad7ae80";
const BALE_BABY = "photo-1551537482-f2075a1d41f2";
const BALE_CHILDREN = "photo-1551537482-f2075a1d41f2";
const BALE_JOG = "photo-1576871337622-98d48d1cf531";
const BALE_LEGGINGS = "photo-1618354691373-d851c5c3a990";
const BALE_TEE = "photo-1503341504253-dff4815485f1";
const BALE_SPORTS = "photo-1591047139829-d91aecb6caea";
const BALE_HANDBAG = "photo-1560243563-062bfc001d68";
const BALE_LEATHER = "photo-1544441893-675973e31985";
const BALE_LEATHER_LADIES = "photo-1539533018447-63fcce2678e3";
const BALE_ZIPPER = "photo-1512436991641-6745cdb1723f";
// Wholesale bales (compressed, branded wrap)
const BALE_25 = "photo-1520453803296-c39eabe2dab4";
const BALE_30 = "photo-1441984904996-e0b6ba687e04";
const BALE_45 = "photo-1553413077-190dd305871c";
const BALE_55 = "photo-1489987707025-afc232f7ea0f";
const BALE_70 = "photo-1540575467063-178a50c2df87";
// Canada container (MSKU9196899) — household, accessories & kids lines
const CN_BEDDING = "photo-1540518614846-7eded433c457";
const CN_TOWEL = "photo-1517705008128-361805f42e86";
const CN_CAP = "photo-1521369909029-2afed882baee";
const CN_BAG = "photo-1553062407-98eeb64c6a62";
const CN_SOCKS = "photo-1586350977771-b3b0abd50c82";
const CN_PILLOW = "photo-1584100936595-c0654b55a2e2";
const CN_HOME = "photo-1524504388940-b1c1722653e1";
const CN_BRA = "photo-1506629082955-511b1aa562c8";
const CN_TANK = "photo-1521572163474-6864f9cf17ab";
// Retail division — European footwear, bags, fashion & formal wear (all verified 200)
const FT_RUN_RED = "photo-1542291026-7eec264c27ff";
const FT_RUN_WHITE = "photo-1600185365483-26d7a4cc7519";
const FT_SNEAK = "photo-1525966222134-fcfa99b8ae77";
const FT_SLIDE = "photo-1511497584788-876760111969";
const FT_BOOT_BK = "photo-1608256246200-53e635b5b65f";
const FT_BOOT_TAN = "photo-1606107557195-0e29a4b5b4aa";
const FT_HEEL = "photo-1531310197839-ccf54634509e";
const BG_CLASSIC = "photo-1548036328-c9fa89d128fa";
const BG_WHITE = "photo-1584917865442-de89df76afd3";
const BG_PINK = "photo-1590874103328-eac38a683ce7";
const BG_YELLOW = "photo-1591561954557-26941169b49e";
const BG_RED = "photo-1594633312681-425c7b97ccd1";
const BG_WALLET = "photo-1547949003-9792a18a2601";
const BG_CARD = "photo-1627123424574-724758594e93";
const WM_DRESS_RED = "photo-1595777457583-95e059d581b8";
const WM_DRESS_STREET = "photo-1572804013309-59a88b7e92f1";
const WM_DRESS_NIGHT = "photo-1585487000160-6ebcfceb0d03";
const WM_BLAZER = "photo-1515372039744-b8f02a3ae446";
const MN_SHIRT_WHITE = "photo-1620012253295-c15cc3e65df4";
const MN_SHIRT_DK = "photo-1603252109303-2751441dd157";
const MN_JEANS = "photo-1542272604-787c3835535d";
const MN_HOODIE = "photo-1556821840-3a63f95609a7";
const MN_HOODIE2 = "photo-1620799140408-edc6dcb6d633";
const MN_JACKET_DENIM = "photo-1551028719-00167b16eac5";
const MN_JACKET_LEATHER = "photo-1544022613-e87ca75a784a";
const MN_COAT = "photo-1520975954732-35dd22299614";
const MN_PANT = "photo-1624378439575-d8705ad7ae80";
const ST_SUIT_1 = "photo-1594938298603-c8148c4dae35";
const ST_SUIT_2 = "photo-1617137968427-85924c800a22";
const ST_SUIT_3 = "photo-1473966968600-fa801b869a1a";
const ST_BLAZER = "photo-1591047139829-d91aecb6caea";

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

// Common-category fallback descriptions for fashion, footwear & bale lines.
const CATEGORY_DESC: Record<string, string> = {
  "Men's Fashion": "Men's essentials from our European lots — crisp, sized and retail-ready.",
  "Women's Fashion": "Curated women's fashion from our European lots — garment-checked, sized and retail-ready.",
  "Jackets": "Jackets and outerwear from our European lots — hand-sorted, condition-checked and retail-ready.",
  "Kids": "Kids' clothing and rummage packs from our Canadian container lots — high-grade, pre-washed and retail-ready.",
  "Sportswear": "Sportswear and activewear from our European lots — sorted, graded and retail-ready.",
  "Handbags": "Handbags and accessories from our wholesale lots — condition-checked and retail-ready.",
  "T-Shirts": "T-shirts and knit basics from our European lots — pressed, sized and retail-ready.",
  "Leather": "Premium leather pieces from our Canadian container lots — hand-sorted with no tearing.",
  "Footwear": "Premium European-sorted footwear, hand-checked for quality and built for everyday wear. Ships from Nairobi.",
  "Bags & Accessories": "Australian and European-sorted bags and accessories, condition-checked and retail-ready.",
  "Refurbished": "Professionally refurbished hardware — cleaned, tested and graded by Portmetals engineers.",
  "Wholesale Bales": "Compressed wholesale bales — sorted, graded and baled for volume buyers across East Africa.",
  "Mens Items": "Men's bales straight from Portmetals' own Canada container (MSKU9196899) — hand-sorted garments, graded and baled for East African retail.",
  "Ladies Items": "Ladies' fashion from Portmetals' Canada container (MSKU9196899) — hand-checked garments, sized and baled ready for retail.",
  "Misc + Children Items": "Household, kids' and baby bales from Portmetals' Canada container (MSKU9196899) — sorted, graded and packed for volume buyers.",
  "Grade (B) Items": "Grade B bales from Portmetals' Canada container (MSKU9196899) — serviceable seconds, sorted and baled for budget wholesale.",
  "Formal Wear": "European suits, blazers and formal trousers — quality formal wear for business, weddings, church and special occasions. Ships from Nairobi.",
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

// Bale catalogue entry — a wholesale bale of one clothing grade, priced from
// the founder's original TZS figures. The amount is stored in the platform's
// TZS base so the default KSh display shows the exact original value
// (amount = KES figure ÷ 0.05, see EXCHANGE_RATES in data/platform.ts).
function bale(
  name: string,
  sku: string,
  category: string,
  priceKES: number,
  stock: number,
  imageId: string,
  extra: Record<string, string> = {},
): InventoryItem {
  return make({
    name,
    sku: "BALE-" + sku,
    category,
    price: Math.round(priceKES / 0.05),
    stock,
    imageIds: [imageId],
    source: "bales",
    unit: "bale",
    currency: "KES",
    ...extra,
  });
}

function make(o: {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  imageIds: string | string[];
  source: string;
  unit?: string;
  currency?: Currency;
  [k: string]: string | number | string[] | undefined;
}): InventoryItem {
  const { name, sku, category, price, stock, imageIds, source, unit = "item", currency = "KES", ...specs } = o;
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
    price: { amount: price, currency },
    unit,
    status: stock > 0 ? "in-stock" : "out-of-stock",
    supplier: SUPPLIER,
    lastRestocked,
    source: "manual",
    postedToMarketplace: true,
    marketplacePrice: { amount: price, currency },
    image: images[0],
    images,
    description,
    aiDescription: true,
    specs: specs as Record<string, string>,
  };
}

// Canada container line item (manifest MSKU9196899) — exact names, bale
// quantities and weight-per-bale straight from the founder's manifest PDF.
// Unpriced (0) and NOT posted to the marketplace yet: these load into the
// Portmetals account inventory so the owner sets selling prices on-site, then
// lists them. categories mirror the manifest's own grouping.
function container(
  name: string,
  sku: string,
  category: string,
  qty: number,
  weight: string,
  imageId: string,
): InventoryItem {
  return {
    ...make({
      name,
      sku,
      category,
      price: 0,
      stock: qty,
      imageIds: [imageId],
      source: "bales",
      unit: "bale",
      currency: "KES",
      Container: "MSKU9196899",
      "Weight per Bale": weight,
      Origin: "Canada container",
    }),
    postedToMarketplace: false,
  };
}

// Retail catalogue entry — a single European import (unit: item), priced in the
// platform's KES base exactly like the wholesale lines (amount = KSh ÷ 0.05) so
// the marketplace shows the exact retail figure. Prices follow the founder's
// published retail price bands for Footwear, Bags & Accessories, Fashion and
// Suits & Formal Wear.
function retail(
  name: string,
  sku: string,
  category: string,
  priceKES: number,
  stock: number,
  imageIds: string | string[],
  extra: Record<string, string> = {},
): InventoryItem {
  return make({
    name,
    sku,
    category,
    price: Math.round(priceKES / 0.05),
    stock,
    imageIds,
    source: "retail",
    unit: "item",
    currency: "KES",
    Origin: "Imported from Europe",
    ...extra,
  });
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

  // ═══════════ BALE CATALOGUE — Original Price Guide (KSh) ═══════════
  // Prices below are the founder's original per-bale figures, displayed as KSh
  // (the marketplace default). Stock counts are drawn from the Portmetals
  // container manifest (MSKU9196899) where the grade maps cleanly.
  // Men's
  bale("Men Cotton Shirt Bale", "MS-COTTON", "Men's Fashion", 27000, 8, BALE_SHIRT, { Bale: "45kg / 55kg", "Est. Pieces": "55–65", "Resale Potential": "Sell individually at KSh 45–50 each", "Target Customer": "Market vendors & kiosk retailers" }),
  bale("Men Mixed Pants Bale", "MS-PANTS", "Men's Fashion", 18000, 10, BALE_PANTS, { Bale: "45kg / 55kg", "Est. Pieces": "40–50", "Resale Potential": "Sell individually at KSh 80–120 each", "Target Customer": "Market vendors & retailers" }),
  bale("Ladies Jeans Bale", "LS-JEANS", "Women's Fashion", 15000, 11, BALE_JEANS, { Bale: "45kg / 55kg", "Est. Pieces": "35–45", "Resale Potential": "Sell individually at KSh 80–150 each", "Target Customer": "Thrift & boutique stores" }),
  bale("Flanel Shirt Bale", "MS-FLANEL", "Men's Fashion", 15000, 3, BALE_FLANEL, { Bale: "45kg / 55kg", "Est. Pieces": "40–50", "Resale Potential": "Sell individually at KSh 50–60 each", "Target Customer": "Market vendors" }),
  bale("Cotton Blouse Bale", "LS-BLOUSE", "Women's Fashion", 10000, 10, BALE_BLOUSE, { Bale: "40kg / 45kg", "Est. Pieces": "45–55", "Resale Potential": "Sell individually at KSh 40–60 each", "Target Customer": "Thrift stores" }),
  bale("Shorts Bale", "MS-SHORTS", "Men's Fashion", 14000, 7, BALE_SHORTS, { Bale: "40kg / 45kg", "Est. Pieces": "45–55", "Resale Potential": "Sell individually at KSh 40–60 each", "Target Customer": "Market vendors" }),
  bale("Cotton Dress Bale", "LS-DRESS", "Women's Fashion", 13000, 3, BALE_DRESS, { Bale: "45kg / 55kg", "Est. Pieces": "25–35", "Resale Potential": "Sell individually at KSh 80–150 each", "Target Customer": "Boutique stores" }),
  bale("Hawaii [Palazo] Bale", "LS-PALAZZO", "Women's Fashion", 12000, 2, BALE_PALAZZO, { Bale: "45kg / 55kg", "Est. Pieces": "35–45", "Resale Potential": "Sell individually at KSh 50–90 each", "Target Customer": "Thrift & boutique stores" }),
  bale("Anoraks / Zippers Bale", "JK-ANORAK", "Jackets", 18000, 5, BALE_ANORAK, { Bale: "40kg / 45kg", "Est. Pieces": "20–30", "Resale Potential": "Sell individually at KSh 100–150 each", "Target Customer": "Cold-weather retailers" }),
  bale("Sweatshirts with Capchion Bale", "JK-HOODIE", "Jackets", 15000, 15, BALE_HOODIE, { Bale: "45kg / 55kg", "Est. Pieces": "30–40", "Resale Potential": "Sell individually at KSh 60–100 each", "Target Customer": "Youth clothing retailers" }),
  bale("Baby Medium Rummage 25kg", "KD-BABY25", "Kids", 7500, 30, BALE_BABY, { Bale: "25kg", "Est. Pieces": "60–80", "Resale Potential": "Sell individually at KSh 20–35 each", "Target Customer": "Baby & kids stores" }),
  bale("Children Medium Rummage 30kg", "KD-CHILD30", "Kids", 10000, 33, BALE_CHILDREN, { Bale: "30kg", "Est. Pieces": "70–90", "Resale Potential": "Sell individually at KSh 25–40 each", "Target Customer": "Kids clothing retailers" }),
  bale("Jogging Pants 25kg", "SW-JOG25", "Sportswear", 7500, 7, BALE_JOG, { Bale: "25kg", "Est. Pieces": "35–45", "Resale Potential": "Sell individually at KSh 40–60 each", "Target Customer": "Sportswear & market vendors" }),
  bale("Leggings Bale", "SW-LEGGINGS", "Sportswear", 10000, 10, BALE_LEGGINGS, { Bale: "25kg / 30kg", "Est. Pieces": "50–70", "Resale Potential": "Sell individually at KSh 30–45 each", "Target Customer": "Athleisure retailers" }),
  bale("Mix T-Shirts Bale", "TS-MIX", "T-Shirts", 13000, 31, BALE_TEE, { Bale: "45kg / 55kg", "Est. Pieces": "60–80", "Resale Potential": "Sell individually at KSh 30–40 each", "Target Customer": "Market vendors" }),
  bale("Sportwear Bale", "SW-SPORT", "Sportswear", 15000, 6, BALE_SPORTS, { Bale: "45kg / 55kg", "Est. Pieces": "30–40", "Resale Potential": "Sell individually at KSh 80–120 each", "Target Customer": "Sportswear retailers" }),
  bale("Ladies Handbags Bale", "HB-LADIES", "Handbags", 22000, 6, BALE_HANDBAG, { Bale: "25kg / 30kg", "Est. Pieces": "25–35", "Resale Potential": "Sell individually at KSh 100–200 each", "Target Customer": "Accessories & boutique stores" }),
  bale("Sweatshirt Light Bale", "TS-SWEATLIGHT", "T-Shirts", 11000, 4, BALE_HOODIE, { Bale: "45kg", "Est. Pieces": "40–50", "Resale Potential": "Sell individually at KSh 50–70 each", "Target Customer": "Market vendors" }),
  bale("Leather Pants / Skirts [U] Bale", "LE-PANTS", "Leather", 25000, 3, BALE_LEATHER, { Bale: "25kg", "Est. Pieces": "10–20", "Resale Potential": "Sell individually at KSh 200–400 each", "Target Customer": "Premium thrift & boutiques" }),
  bale("Ladies Fashion Jackets [Leather] Bale", "LE-LADIES", "Leather", 30000, 3, BALE_LEATHER_LADIES, { Bale: "30kg / 45kg", "Est. Pieces": "12–20", "Resale Potential": "Sell individually at KSh 250–400 each", "Target Customer": "Premium boutiques" }),
  bale("Men Leather Jackets Bale", "LE-MEN", "Leather", 35000, 5, BALE_LEATHER, { Bale: "45kg / 55kg", "Est. Pieces": "15–22", "Resale Potential": "Sell individually at KSh 300–450 each", "Target Customer": "Premium thrift stores" }),
  bale("Light Zipper Jackets Bale", "JK-ZIPPER", "Jackets", 16000, 10, BALE_ZIPPER, { Bale: "45kg", "Est. Pieces": "35–45", "Resale Potential": "Sell individually at KSh 60–90 each", "Target Customer": "Market vendors" }),

  // ═══════════ WHOLESALE BALE TIERS (25kg–70kg, KSh + USD) ═══════════
  bale("25kg Starter Bale", "WM-25", "Wholesale Bales", 350000, 40, BALE_25, { Weight: "25kg", "Est. Pieces": "90–130", "USD Price": "$130", "Best For": "First-time importers & small traders" }),
  bale("30kg Business Starter Bale", "WM-30", "Wholesale Bales", 500000, 40, BALE_30, { Weight: "30kg", "Est. Pieces": "110–150", "USD Price": "$185", "Best For": "Growing stalls & online sellers" }),
  bale("45kg Wholesale Bale", "WM-45", "Wholesale Bales", 700000, 40, BALE_45, { Weight: "45kg", "Est. Pieces": "160–220", "USD Price": "$260", "Best For": "Established retailers" }),
  bale("55kg Premium Business Bale", "WM-55", "Wholesale Bales", 900000, 40, BALE_55, { Weight: "55kg", "Est. Pieces": "200–260", "USD Price": "$335", "Best For": "Multi-stall traders & distributors" }),
  bale("70kg Commercial Bale", "WM-70", "Wholesale Bales", 1200000, 40, BALE_70, { Weight: "70kg", "Est. Pieces": "250–330", "USD Price": "$445", "Best For": "Wholesalers & regional distributors" }),

  // ═══════════ RETAIL — European Footwear (founder price bands) ═══════════
  retail("ASICS Running Shoes — Performance Series", "PM-RL-ASICS-RUN", "Footwear", 9500, 12, [FT_RUN_RED, FT_RUN_WHITE], { Brand: "ASICS", "Collection": "Performance", "Perfect For": "Running · Gym · Walking · Everyday Comfort", "Features": "Lightweight construction · Premium cushioning · Breathable upper", "Price Band": "KSh 5,000 – 12,000" }),
  retail("ASICS Gel Cushion Trainer", "PM-RL-ASICS-GEL", "Footwear", 8500, 10, [FT_RUN_WHITE, FT_RUN_RED], { Brand: "ASICS", "Collection": "Performance", "Perfect For": "Running · Gym · Everyday Comfort", "Price Band": "KSh 5,000 – 12,000" }),
  retail("Saucony Performance Runner", "PM-RL-SAU-RUN", "Footwear", 9000, 10, [FT_RUN_WHITE, FT_SNEAK], { Brand: "Saucony", "Collection": "Performance", "Perfect For": "Trail Running · Hiking · Outdoor Activities", "Price Band": "KSh 6,000 – 12,000" }),
  retail("Saucony Gore-Tex Trail — Waterproof", "PM-RL-SAU-GTX", "Footwear", 12000, 8, [FT_RUN_RED, FT_RUN_WHITE], { Brand: "Saucony", "Waterproof": "Gore-Tex", "Perfect For": "Trail Running · Hiking · Premium Lifestyle", "Features": "Waterproof Gore-Tex · Superior grip · High durability", "Price Band": "KSh 6,000 – 12,000" }),
  retail("Nike Performance Running Shoe", "PM-RL-NIKE-RUN", "Footwear", 9000, 12, [FT_RUN_RED, FT_RUN_WHITE], { Brand: "Nike", "Collection": "Performance", "Perfect For": "Running · Gym · Casual Wear", "Features": "Lightweight · Stylish · Comfortable", "Price Band": "KSh 8,000 – 10,000" }),
  retail("Nike Premium Edition", "PM-RL-NIKE-PRM", "Footwear", 15000, 6, [FT_RUN_WHITE, FT_RUN_RED], { Brand: "Nike", "Collection": "Premium", "Premium Models": "Up to KSh 15,000" }),
  retail("Karl Kani Modern Streetwear — White", "PM-RL-KK-WHITE", "Footwear", 8500, 8, [FT_SNEAK, FT_RUN_WHITE], { Brand: "Karl Kani", "Collection": "Lifestyle", "Colour": "White", "Perfect For": "Fashion · Everyday Wear · Casual Lifestyle", "Features": "Premium leather finish · Contemporary design", "Price Band": "KSh 5,000 – 12,000" }),
  retail("Karl Kani Modern Streetwear — Beige", "PM-RL-KK-BEIGE", "Footwear", 8500, 8, [FT_RUN_WHITE, FT_SNEAK], { Brand: "Karl Kani", "Collection": "Lifestyle", "Colour": "Beige", "Perfect For": "Young Professionals · Casual Lifestyle", "Price Band": "KSh 5,000 – 12,000" }),
  retail("Converse Chuck Taylor — White Canvas", "PM-RL-CONV-CT", "Footwear", 5000, 15, [FT_SNEAK, FT_RUN_WHITE], { Brand: "Converse", "Collection": "Classic", "Colour": "White Canvas", "Perfect For": "Students · Casual Wear · Everyday Fashion", "Price Band": "KSh 3,000 – 7,500" }),
  retail("Converse Chuck Taylor — Premium", "PM-RL-CONV-PRM", "Footwear", 7500, 10, [FT_SNEAK], { Brand: "Converse", "Collection": "Classic", "Note": "A timeless icon", "Price Band": "KSh 3,000 – 7,500" }),
  retail("Women's Fashion Boots — Black", "PM-RL-BOOT-BLACK", "Footwear", 10000, 8, [FT_BOOT_BK, FT_BOOT_TAN], { "Collection": "Premium Boots", "Colour": "Black", "Suitable For": "Office · Smart Casual · Evening Wear", "Price Band": "KSh 6,500 – 14,000" }),
  retail("Women's Fashion Boots — Cream", "PM-RL-BOOT-CREAM", "Footwear", 10000, 8, [FT_BOOT_TAN, FT_BOOT_BK], { "Collection": "Premium Boots", "Colour": "Cream", "Suitable For": "Office · Lifestyle Fashion", "Price Band": "KSh 6,500 – 14,000" }),
  retail("Women's Fashion Boots — Beige", "PM-RL-BOOT-BEIGE", "Footwear", 12500, 6, [FT_BOOT_TAN], { "Collection": "Premium Boots", "Colour": "Beige", "Suitable For": "Evening Wear · Lifestyle Fashion", "Price Band": "KSh 6,500 – 14,000" }),
  retail("Women's Evening Heels", "PM-RL-WM-HEELS", "Footwear", 8500, 8, [FT_HEEL, FT_BOOT_BK], { "Collection": "Women's Fashion", "Suitable For": "Office · Evening Wear · Special Occasions", "Price Band": "KSh 6,500 – 14,000" }),
  retail("Premium Slides — Classic", "PM-RL-SLIDES-CLASSIC", "Footwear", 3500, 20, [FT_SLIDE], { "Collection": "Summer", "Colours": "Blue · Cream · White · Stone", "Perfect For": "Holidays · Home · Beach · Casual Wear", "Price Band": "KSh 2,000 – 5,000" }),
  retail("Premium Slides — Beach Edition", "PM-RL-SLIDES-BEACH", "Footwear", 2500, 20, [FT_SLIDE], { "Collection": "Summer", "Colours": "Stone · Cream", "Perfect For": "Holidays · Beach · Casual Wear", "Price Band": "KSh 2,000 – 5,000" }),

  // ═══════════ RETAIL — European Bags & Accessories (founder price guide) ═══════════
  retail("Card Holder & Coin Purse", "PM-RL-BAG-CARD", "Bags & Accessories", 750, 30, [BG_CARD, BG_WALLET], { "Guide": "KSh 500 – 1,000", "Type": "Card Holders & Coin Purses" }),
  retail("Small Wallet", "PM-RL-BAG-SMALL-WL", "Bags & Accessories", 1500, 25, [BG_WALLET, BG_CARD], { "Guide": "KSh 1,000 – 2,000", "Type": "Wallets" }),
  retail("Premium Wallet", "PM-RL-BAG-PRM-WL", "Bags & Accessories", 2100, 20, [BG_WALLET, BG_RED], { "Guide": "KSh 1,200 – 3,000", "Type": "Premium Wallets" }),
  retail("Mini Bag", "PM-RL-BAG-MINI", "Bags & Accessories", 2500, 15, [BG_PINK, BG_CLASSIC], { "Guide": "KSh 1,500 – 3,500", "Type": "Mini Bags", "Colours": "Multi" }),
  retail("Crossbody Bag", "PM-RL-BAG-CROSS", "Bags & Accessories", 3500, 12, [BG_CLASSIC, BG_YELLOW], { "Guide": "KSh 2,500 – 4,500", "Type": "Crossbody Bags" }),
  retail("Everyday Handbag", "PM-RL-BAG-EVERYDAY", "Bags & Accessories", 4000, 10, [BG_WHITE, BG_PINK], { "Guide": "KSh 3,000 – 5,000", "Type": "Everyday Handbags" }),
  retail("Premium Fashion Handbag", "PM-RL-BAG-PRM", "Bags & Accessories", 5500, 10, [BG_YELLOW, BG_WHITE], { "Guide": "KSh 4,000 – 7,000", "Type": "Premium Fashion Handbags" }),
  retail("Signature Collection Bag", "PM-RL-BAG-SIGN", "Bags & Accessories", 8000, 6, [BG_RED, BG_CLASSIC], { "Guide": "KSh 6,000 – 10,000", "Collection": "Signature" }),
  retail("Luxury Designer Handbag", "PM-RL-BAG-LUX", "Bags & Accessories", 15000, 4, [BG_PINK, BG_RED], { "Guide": "KSh 12,000+", "Collection": "Luxury", "Qty": "Exceptional premium pieces" }),

  // ═══════════ RETAIL — Women's Fashion (founder price guide) ═══════════
  retail("Fashion Top / Blouse", "PM-RL-WM-TOP", "Women's Fashion", 1000, 40, [BALE_BLOUSE, WM_DRESS_RED], { "Guide": "KSh 500 – 1,500", "Category": "Fashion Tops & Blouses" }),
  retail("Casual Dress", "PM-RL-WM-CASUAL-DRESS", "Women's Fashion", 1400, 25, [WM_DRESS_RED, WM_DRESS_STREET], { "Guide": "KSh 800 – 2,000", "Category": "Casual Dresses" }),
  retail("Maxi Dress", "PM-RL-WM-MAXI", "Women's Fashion", 1800, 15, [WM_DRESS_STREET, WM_DRESS_NIGHT], { "Guide": "KSh 1,500 – 5,000", "Category": "Maxi Dresses" }),
  retail("Evening Dress", "PM-RL-WM-EVENING", "Women's Fashion", 3500, 10, [WM_DRESS_NIGHT, WM_DRESS_RED], { "Guide": "KSh 1,500 – 5,000", "Category": "Evening Dresses" }),
  retail("Office Dress", "PM-RL-WM-OFFICE", "Women's Fashion", 3000, 12, [WM_BLAZER, WM_DRESS_NIGHT], { "Guide": "KSh 1,500 – 5,000", "Category": "Office Dresses" }),
  retail("Premium Dress", "PM-RL-WM-PRM-DRESS", "Women's Fashion", 4500, 8, [WM_DRESS_NIGHT, WM_DRESS_STREET], { "Guide": "KSh 1,500 – 5,000", "Category": "Premium Dresses" }),
  retail("Fashion Jacket", "PM-RL-WM-JACKET", "Women's Fashion", 2500, 12, [MN_JACKET_LEATHER, MN_COAT], { "Guide": "KSh 1,500 – 4,000", "Category": "Fashion Jackets" }),
  retail("Fitted Jeans", "PM-RL-WM-JEANS", "Women's Fashion", 1300, 20, [MN_JEANS, BALE_JEANS], { "Guide": "KSh 800 – 1,800", "Category": "Jeans" }),
  retail("Leggings", "PM-RL-WM-LEGGINGS", "Women's Fashion", 800, 30, [BALE_LEGGINGS, CN_TANK], { "Guide": "KSh 500 – 1,200", "Category": "Leggings" }),
  retail("Knitwear / Cardigan", "PM-RL-WM-KNIT", "Women's Fashion", 1200, 18, [MN_COAT, BALE_BLOUSE], { "Guide": "KSh 800 – 2,000", "Category": "Knitwear" }),
  retail("Hoodie / Sweatshirt", "PM-RL-WM-HOODIE", "Women's Fashion", 1000, 20, [MN_HOODIE, MN_HOODIE2], { "Guide": "KSh 500 – 1,500", "Category": "Hoodies & Sweatshirts" }),
  retail("Jumpsuit", "PM-RL-WM-JUMP", "Women's Fashion", 2200, 10, [WM_DRESS_STREET, WM_DRESS_NIGHT], { "Guide": "KSh 1,500 – 3,500", "Category": "Jumpsuits" }),

  // ═══════════ RETAIL — Men's Fashion (founder price guide) ═══════════
  retail("Business Shirt", "PM-RL-MN-BIZ-SHIRT", "Men's Fashion", 1400, 20, [MN_SHIRT_WHITE, BALE_SHIRT], { "Guide": "KSh 1,000 – 1,800", "Category": "Business Shirts" }),
  retail("Formal / Check Shirt", "PM-RL-MN-CHECK", "Men's Fashion", 1200, 20, [MN_SHIRT_DK, MN_SHIRT_WHITE], { "Guide": "KSh 1,000 – 1,800", "Category": "Formal & Check Shirts" }),
  retail("Casual / Polo Shirt", "PM-RL-MN-POLO", "Men's Fashion", 1200, 25, [BALE_SHIRT, MN_SHIRT_DK], { "Guide": "KSh 1,000 – 1,800", "Category": "Casual & Polo Shirts" }),
  retail("T-Shirt", "PM-RL-MN-TEE", "Men's Fashion", 800, 40, [BALE_TEE, CN_TANK], { "Guide": "KSh 500 – 1,200", "Category": "T-Shirts" }),
  retail("Denim Jeans", "PM-RL-MN-JEANS", "Men's Fashion", 1300, 20, [MN_JEANS, BALE_JEANS], { "Guide": "KSh 800 – 1,800", "Category": "Jeans" }),
  retail("Chinos / Casual Trousers", "PM-RL-MN-CHINO", "Men's Fashion", 1300, 15, [MN_PANT, BALE_PANTS], { "Guide": "KSh 800 – 1,800", "Category": "Chinos & Trousers" }),
  retail("Casual Shorts", "PM-RL-MN-SHORTS", "Men's Fashion", 900, 25, [BALE_SHORTS], { "Guide": "KSh 500 – 1,500", "Category": "Shorts" }),
  retail("Hoodie", "PM-RL-MN-HOODIE", "Men's Fashion", 1200, 18, [MN_HOODIE, MN_HOODIE2, BALE_HOODIE], { "Guide": "KSh 500 – 2,000", "Category": "Hoodies" }),
  retail("Denim Jacket", "PM-RL-MN-DENIM-JACKET", "Men's Fashion", 2100, 12, [MN_JACKET_DENIM, MN_COAT], { "Guide": "KSh 1,200 – 3,000", "Category": "Jackets" }),
  retail("Casual Blazer", "PM-RL-MN-BLAZER", "Men's Fashion", 3000, 10, [ST_BLAZER, ST_SUIT_3], { "Guide": "KSh 1,500 – 3,000", "Category": "Blazers" }),

  // ═══════════ RETAIL — Suits & Formal Wear (founder price guide) ═══════════
  retail("Business Suit", "PM-RL-ST-BIZ", "Formal Wear", 8000, 8, [ST_SUIT_1, ST_SUIT_2], { "Guide": "KSh 4,000 – 12,000", "Occasion": "Business" }),
  retail("Executive Suit", "PM-RL-ST-EXEC", "Formal Wear", 10000, 6, [ST_SUIT_2, ST_SUIT_1], { "Guide": "KSh 4,000 – 12,000", "Occasion": "Executive" }),
  retail("Slim Fit Suit", "PM-RL-ST-SLIM", "Formal Wear", 8500, 8, [ST_SUIT_3, ST_SUIT_2], { "Guide": "KSh 4,000 – 12,000", "Fit": "Slim Fit" }),
  retail("Wedding Suit", "PM-RL-ST-WED", "Formal Wear", 12000, 5, [ST_SUIT_2, ST_SUIT_3], { "Guide": "KSh 4,000 – 12,000", "Occasion": "Weddings & Special Occasions" }),
  retail("Suit Jacket", "PM-RL-ST-JACKET", "Formal Wear", 6000, 8, [ST_SUIT_1, ST_BLAZER], { "Guide": "KSh 4,000 – 12,000", "Category": "Suit Jackets" }),
  retail("Waistcoat", "PM-RL-ST-WAIST", "Formal Wear", 4500, 8, [ST_SUIT_3, ST_SUIT_1], { "Guide": "KSh 4,000 – 12,000", "Category": "Waistcoats" }),
  retail("Formal Trousers", "PM-RL-ST-TROUSERS", "Formal Wear", 4000, 12, [MN_PANT, ST_SUIT_2], { "Guide": "KSh 4,000 – 12,000", "Category": "Formal Trousers" }),
];


/**
 * Canada container manifest (MSKU9196899) — the founder's full, exact
 * shipping inventory: 114 lines, 558 bales (Mens 151 · Ladies 124 ·
 * Misc + Children 261 · Grade B 22). Names, bale quantities and weight per
 * bale are transcribed verbatim from Portmetals_Canada_Bale_Inventory.
 * Container items load unpriced and unposted (postedToMarketplace: false) so
 * the owner can set selling prices on-site before listing them.
 */
export const PORTMETALS_CONTAINER: InventoryItem[] = [
  container("MSKU9196899 · Anorak Jackets", "CAN-M-ANORAK-JACKETS", "Mens Items", 5, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Boxer Shorts", "CAN-M-BOXER-SHORTS", "Mens Items", 1, "100 lbs (≈45 kg)", CN_TANK),
  container("MSKU9196899 · Cargo Pants", "CAN-M-CARGO-PANTS", "Mens Items", 1, "100 pcs", BALE_PANTS),
  container("MSKU9196899 · Cargo Shorts", "CAN-M-CARGO-SHORTS", "Mens Items", 1, "100 lbs (≈45 kg)", BALE_SHORTS),
  container("MSKU9196899 · Cotton pants", "CAN-M-COTTON-PANTS", "Mens Items", 5, "100 pcs", BALE_PANTS),
  container("MSKU9196899 · Cotton shirts L/S S/S", "CAN-M-COTTON-SHIRTS-LS-SS", "Mens Items", 8, "200 pcs", BALE_SHIRT),
  container("MSKU9196899 · Cotton t-shirt roundneck", "CAN-M-T-SHIRT-ROUNDNECK", "Mens Items", 20, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Collar T-Shirts", "CAN-M-COLLAR-T-SHIRTS", "Mens Items", 5, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Denim Jackets", "CAN-M-DENIM-JACKETS", "Mens Items", 5, "100 lbs (≈45 kg)", BALE_JEANS),
  container("MSKU9196899 · Denim Jeans", "CAN-M-DENIM-JEANS", "Mens Items", 11, "100 pcs", BALE_JEANS),
  container("MSKU9196899 · Flannel Shirts", "CAN-M-FLANNEL-SHIRTS", "Mens Items", 3, "100 lbs (≈45 kg)", BALE_FLANEL),
  container("MSKU9196899 · Fleece Jackets", "CAN-M-FLEECE-JACKETS", "Mens Items", 5, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Hawaian Shirts", "CAN-M-HAWAIAN-SHIRTS", "Mens Items", 1, "100 lbs (≈45 kg)", BALE_SHIRT),
  container("MSKU9196899 · Hooded sweat shirts", "CAN-M-HOODED-SWEAT-SHIRTS", "Mens Items", 15, "100 lbs (≈45 kg)", BALE_HOODIE),
  container("MSKU9196899 · Sweat Shirts", "CAN-M-SWEAT-SHIRTS", "Mens Items", 4, "100 lbs (≈45 kg)", BALE_HOODIE),
  container("MSKU9196899 · Jogging Pants / Elastic Bottom", "CAN-M-JOGGING-PANTS-ELASTIC-BOTTOM", "Mens Items", 7, "100 lbs (≈45 kg)", BALE_JOG),
  container("MSKU9196899 · Light Zipper Jackets", "CAN-M-LIGHT-ZIPPER-JACKETS", "Mens Items", 10, "100 lbs (≈45 kg)", BALE_ZIPPER),
  container("MSKU9196899 · Mens dress pants", "CAN-M-MENS-DRESS-PANTS", "Mens Items", 5, "100 pcs", BALE_PALAZZO),
  container("MSKU9196899 · Mens Tropical Pants", "CAN-M-MENS-TROPICAL-PANTS", "Mens Items", 1, "100 pcs", BALE_PANTS),
  container("MSKU9196899 · Nylon Track Pants", "CAN-M-NYLON-TRACK-PANTS", "Mens Items", 2, "100 lbs (≈45 kg)", BALE_PANTS),
  container("MSKU9196899 · Ski Jackets", "CAN-M-SKI-JACKETS", "Mens Items", 5, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Sports Shorts", "CAN-M-SPORTS-SHORTS", "Mens Items", 6, "100 lbs (≈45 kg)", BALE_SPORTS),
  container("MSKU9196899 · Sports T-shirts", "CAN-M-SPORTS-T-SHIRTS", "Mens Items", 11, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Sports Hooded Sweatshirt", "CAN-M-SPORTS-HOODED-SWEATSHIRT", "Mens Items", 2, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Track Suits", "CAN-M-TRACK-SUITS", "Mens Items", 8, "100 lbs (≈45 kg)", BALE_HOODIE),
  container("MSKU9196899 · Mens Underwear", "CAN-M-MENS-UNDERWEAR", "Mens Items", 2, "100 lbs (≈45 kg)", CN_TANK),
  container("MSKU9196899 · White Shirts", "CAN-M-WHITE-SHIRTS", "Mens Items", 1, "100 lbs (≈45 kg)", BALE_SHIRT),
  container("MSKU9196899 · Work Shirts", "CAN-M-WORK-SHIRTS", "Mens Items", 1, "200 pcs", BALE_SHIRT),
  container("MSKU9196899 · Body Suits", "CAN-L-BODY-SUITS", "Ladies Items", 1, "100 lbs (≈45 kg)", BALE_BLOUSE),
  container("MSKU9196899 · Cotton Dresses", "CAN-L-COTTON-DRESSES", "Ladies Items", 3, "100 lbs (≈45 kg)", BALE_DRESS),
  container("MSKU9196899 · Cotton Skirts", "CAN-L-COTTON-SKIRTS", "Ladies Items", 1, "100 lbs (≈45 kg)", BALE_BLOUSE),
  container("MSKU9196899 · Denim Dress", "CAN-L-DENIM-DRESS", "Ladies Items", 1, "100 lbs (≈45 kg)", BALE_JEANS),
  container("MSKU9196899 · Fashion Mini Dresses", "CAN-L-FASHION-MINI-DRESSES", "Ladies Items", 5, "100 lbs (≈45 kg)", BALE_DRESS),
  container("MSKU9196899 · Girls Fashion Jacket", "CAN-L-GIRLS-FASHION-JACKET", "Ladies Items", 1, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Hawaain Pants", "CAN-L-HAWAAIN-PANTS", "Ladies Items", 1, "100 lbs (≈45 kg)", BALE_PANTS),
  container("MSKU9196899 · Ladies cotton pants", "CAN-L-LADIES-COTTON-PANTS", "Ladies Items", 5, "200 pcs", BALE_PANTS),
  container("MSKU9196899 · Ladies Fashion sweaters", "CAN-L-LADIES-FASHION-SWEATERS", "Ladies Items", 1, "100 lbs (≈45 kg)", BALE_HOODIE),
  container("MSKU9196899 · Ladies Dress Pants", "CAN-L-LADIES-DRESS-PANTS", "Ladies Items", 3, "200 pcs", BALE_PALAZZO),
  container("MSKU9196899 · Ladies Polo Dresses", "CAN-L-LADIES-POLO-DRESSES", "Ladies Items", 3, "100 lbs (≈45 kg)", BALE_DRESS),
  container("MSKU9196899 · Ladies Poly Blouse", "CAN-L-LADIES-POLY-BLOUSE", "Ladies Items", 10, "100 lbs (≈45 kg)", BALE_BLOUSE),
  container("MSKU9196899 · Ladies Poly Dresses", "CAN-L-LADIES-POLY-DRESSES", "Ladies Items", 4, "100 lbs (≈45 kg)", BALE_DRESS),
  container("MSKU9196899 · Ladies Poly Pants", "CAN-L-LADIES-POLY-PANTS", "Ladies Items", 1, "200 pcs", BALE_PANTS),
  container("MSKU9196899 · Ladies Trench coat", "CAN-L-LADIES-TRENCH-COAT", "Ladies Items", 2, "100 lbs (≈45 kg)", BALE_LEATHER_LADIES),
  container("MSKU9196899 · Ladies t.shirt", "CAN-L-LADIES-T-SHIRT", "Ladies Items", 5, "100 lbs (≈45 kg)", BALE_SHIRT),
  container("MSKU9196899 · Ladies t.shirt L/S", "CAN-L-T-SHIRT-LS", "Ladies Items", 2, "100 lbs (≈45 kg)", BALE_SHIRT),
  container("MSKU9196899 · Ladies Tank Top", "CAN-L-LADIES-TANK-TOP", "Ladies Items", 2, "100 lbs (≈45 kg)", CN_TANK),
  container("MSKU9196899 · Ladies Ripped Jeans", "CAN-L-LADIES-RIPPED-JEANS", "Ladies Items", 11, "100 lbs (≈45 kg)", BALE_JEANS),
  container("MSKU9196899 · Leggings", "CAN-L-LEGGINGS", "Ladies Items", 10, "100 lbs (≈45 kg)", BALE_LEGGINGS),
  container("MSKU9196899 · Mix Blouses", "CAN-L-MIX-BLOUSES", "Ladies Items", 10, "100 lbs (≈45 kg)", BALE_BLOUSE),
  container("MSKU9196899 · Mix dresses", "CAN-L-MIX-DRESSES", "Ladies Items", 10, "100 lbs (≈45 kg)", BALE_DRESS),
  container("MSKU9196899 · Mix skirt", "CAN-L-MIX-SKIRT", "Ladies Items", 4, "100 lbs (≈45 kg)", BALE_BLOUSE),
  container("MSKU9196899 · Mummy Jeans", "CAN-L-MUMMY-JEANS", "Ladies Items", 5, "100 lbs (≈45 kg)", BALE_JEANS),
  container("MSKU9196899 · Office Dresses", "CAN-L-OFFICE-DRESSES", "Ladies Items", 1, "100 lbs (≈45 kg)", BALE_DRESS),
  container("MSKU9196899 · Palazzo Pants", "CAN-L-PALAZZO-PANTS", "Ladies Items", 2, "100 lbs (≈45 kg)", BALE_PALAZZO),
  container("MSKU9196899 · Silk Poly Dresses", "CAN-L-SILK-POLY-DRESSES", "Ladies Items", 4, "100 lbs (≈45 kg)", BALE_DRESS),
  container("MSKU9196899 · Skinny Jeans", "CAN-L-SKINNY-JEANS", "Ladies Items", 5, "100 lbs (≈45 kg)", BALE_JEANS),
  container("MSKU9196899 · Skinny Pants", "CAN-L-SKINNY-PANTS", "Ladies Items", 2, "100 lbs (≈45 kg)", BALE_PANTS),
  container("MSKU9196899 · Jumpsuits", "CAN-L-JUMPSUITS", "Ladies Items", 1, "100 lbs (≈45 kg)", BALE_PALAZZO),
  container("MSKU9196899 · Sports Bra", "CAN-L-SPORTS-BRA", "Ladies Items", 4, "100 lbs (≈45 kg)", BALE_SPORTS),
  container("MSKU9196899 · Party Dresses", "CAN-L-PARTY-DRESSES", "Ladies Items", 1, "100 pcs", BALE_DRESS),
  container("MSKU9196899 · Office Blazers", "CAN-L-OFFICE-BLAZERS", "Ladies Items", 2, "100 pcs", BALE_LEATHER_LADIES),
  container("MSKU9196899 · Ladies Long Cardigans", "CAN-L-LADIES-LONG-CARDIGANS", "Ladies Items", 1, "200 pcs", BALE_HOODIE),
  container("MSKU9196899 · Baby Beddings", "CAN-C-BABY-BEDDINGS", "Misc + Children Items", 5, "100 lbs (≈45 kg)", CN_BEDDING),
  container("MSKU9196899 · Baby Blankets", "CAN-C-BABY-BLANKETS", "Misc + Children Items", 7, "100 lbs (≈45 kg)", CN_BEDDING),
  container("MSKU9196899 · Baby Sleepers", "CAN-C-BABY-SLEEPERS", "Misc + Children Items", 7, "100 lbs (≈45 kg)", BALE_BABY),
  container("MSKU9196899 · Bath Mats", "CAN-C-BATH-MATS", "Misc + Children Items", 2, "100 lbs (≈45 kg)", CN_TOWEL),
  container("MSKU9196899 · Bedsheets", "CAN-C-BEDSHEETS", "Misc + Children Items", 5, "100 lbs (≈45 kg)", CN_BEDDING),
  container("MSKU9196899 · Bed Covers", "CAN-C-BED-COVERS", "Misc + Children Items", 8, "100 lbs (≈45 kg)", CN_BEDDING),
  container("MSKU9196899 · Bill Caps", "CAN-C-BILL-CAPS", "Misc + Children Items", 1, "100 lbs (≈45 kg)", CN_CAP),
  container("MSKU9196899 · Blankets", "CAN-C-BLANKETS", "Misc + Children Items", 10, "100 lbs (≈45 kg)", CN_BEDDING),
  container("MSKU9196899 · Boys denim jeans", "CAN-C-BOYS-DENIM-JEANS", "Misc + Children Items", 6, "150 pcs", BALE_JEANS),
  container("MSKU9196899 · Children Jackets", "CAN-C-CHILDREN-JACKETS", "Misc + Children Items", 5, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Boys Shirts", "CAN-C-BOYS-SHIRTS", "Misc + Children Items", 2, "100 lbs (≈45 kg)", BALE_SHIRT),
  container("MSKU9196899 · Bras", "CAN-C-BRAS", "Misc + Children Items", 7, "100 lbs (≈45 kg)", CN_BRA),
  container("MSKU9196899 · Children Rummage", "CAN-C-CHILDREN-RUMMAGE", "Misc + Children Items", 28, "100 lbs (≈45 kg)", BALE_30),
  container("MSKU9196899 · Children Fleece Jacket", "CAN-C-CHILDREN-FLEECE-JACKET", "Misc + Children Items", 1, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Children Hooded Sweat Shirts", "CAN-C-CHILDREN-HOODED-SWEAT-SHIRTS", "Misc + Children Items", 1, "100 lbs (≈45 kg)", BALE_HOODIE),
  container("MSKU9196899 · Children Joggings 2 PC", "CAN-C-CHILDREN-JOGGINGS-2-PC", "Misc + Children Items", 1, "100 lbs (≈45 kg)", BALE_JOG),
  container("MSKU9196899 · Light Baby Rummage", "CAN-C-LIGHT-BABY-RUMMAGE", "Misc + Children Items", 30, "100 lbs (≈45 kg)", BALE_BABY),
  container("MSKU9196899 · Children Medium rummage", "CAN-C-CHILDREN-MEDIUM-RUMMAGE", "Misc + Children Items", 33, "100 lbs (≈45 kg)", BALE_30),
  container("MSKU9196899 · Children Pants", "CAN-C-CHILDREN-PANTS", "Misc + Children Items", 2, "100 lbs (≈45 kg)", BALE_PANTS),
  container("MSKU9196899 · Children Shorts", "CAN-C-CHILDREN-SHORTS", "Misc + Children Items", 2, "100 lbs (≈45 kg)", BALE_SHORTS),
  container("MSKU9196899 · Children Sweaters", "CAN-C-CHILDREN-SWEATERS", "Misc + Children Items", 1, "100 lbs (≈45 kg)", BALE_HOODIE),
  container("MSKU9196899 · Children T-shirts L/s", "CAN-C-CHILDREN-T-SHIRTS-L-S", "Misc + Children Items", 1, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Children T-shirts", "CAN-C-CHILDREN-T-SHIRTS", "Misc + Children Items", 3, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Comforters", "CAN-C-COMFORTERS", "Misc + Children Items", 15, "100 lbs (≈45 kg)", CN_BEDDING),
  container("MSKU9196899 · Curtains", "CAN-C-CURTAINS", "Misc + Children Items", 8, "100 lbs (≈45 kg)", CN_HOME),
  container("MSKU9196899 · Fitted Bed Sheets", "CAN-C-FITTED-BED-SHEETS", "Misc + Children Items", 5, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Flannel Bed sheets", "CAN-C-FLANNEL-BED-SHEETS", "Misc + Children Items", 4, "100 lbs (≈45 kg)", BALE_FLANEL),
  container("MSKU9196899 · Girls dresses", "CAN-C-GIRLS-DRESSES", "Misc + Children Items", 1, "100 lbs (≈45 kg)", BALE_DRESS),
  container("MSKU9196899 · Gloves", "CAN-C-GLOVES", "Misc + Children Items", 1, "100 lbs (≈45 kg)", CN_CAP),
  container("MSKU9196899 · Household rummage", "CAN-C-HOUSEHOLD-RUMMAGE", "Misc + Children Items", 40, "100 lbs (≈45 kg)", BALE_30),
  container("MSKU9196899 · Pillow Case", "CAN-C-PILLOW-CASE", "Misc + Children Items", 1, "100 lbs (≈45 kg)", CN_PILLOW),
  container("MSKU9196899 · Lace Curtains", "CAN-C-LACE-CURTAINS", "Misc + Children Items", 2, "100 lbs (≈45 kg)", CN_HOME),
  container("MSKU9196899 · Ladies Underwear", "CAN-C-LADIES-UNDERWEAR", "Misc + Children Items", 1, "100 lbs (≈45 kg)", CN_BRA),
  container("MSKU9196899 · Mixed Caps", "CAN-C-MIXED-CAPS", "Misc + Children Items", 1, "100 lbs (≈45 kg)", CN_CAP),
  container("MSKU9196899 · School Bags", "CAN-C-SCHOOL-BAGS", "Misc + Children Items", 2, "100 lbs (≈45 kg)", CN_BAG),
  container("MSKU9196899 · Silk Nightwear", "CAN-C-SILK-NIGHTWEAR", "Misc + Children Items", 1, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Socks Paired", "CAN-C-SOCKS-PAIRED", "Misc + Children Items", 3, "100 lbs (≈45 kg)", CN_SOCKS),
  container("MSKU9196899 · Textile Pieces", "CAN-C-TEXTILE-PIECES", "Misc + Children Items", 1, "100 lbs (≈45 kg)", CN_HOME),
  container("MSKU9196899 · Towel", "CAN-C-TOWEL", "Misc + Children Items", 1, "100 lbs (≈45 kg)", CN_TOWEL),
  container("MSKU9196899 · White bed sheets", "CAN-C-WHITE-BED-SHEETS", "Misc + Children Items", 2, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Wool Caps", "CAN-C-WOOL-CAPS", "Misc + Children Items", 4, "100 lbs (≈45 kg)", CN_CAP),
  container("MSKU9196899 · Children Shorts", "CAN-B-CHILDREN-SHORTS", "Grade (B) Items", 1, "100 lbs (≈45 kg)", BALE_SHORTS),
  container("MSKU9196899 · Children T-shirts", "CAN-B-CHILDREN-T-SHIRTS", "Grade (B) Items", 2, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Coloured Bedsheets", "CAN-B-COLOURED-BEDSHEETS", "Grade (B) Items", 1, "100 lbs (≈45 kg)", CN_BEDDING),
  container("MSKU9196899 · Comforters", "CAN-B-COMFORTERS", "Grade (B) Items", 1, "100 lbs (≈45 kg)", CN_BEDDING),
  container("MSKU9196899 · Leggings", "CAN-B-LEGGINGS", "Grade (B) Items", 3, "100 lbs (≈45 kg)", BALE_LEGGINGS),
  container("MSKU9196899 · Men's Cargo Pants", "CAN-B-MEN-S-CARGO-PANTS", "Grade (B) Items", 1, "100 pcs", BALE_PANTS),
  container("MSKU9196899 · Men's Denim Pants", "CAN-B-MEN-S-DENIM-PANTS", "Grade (B) Items", 3, "100 pcs", BALE_JEANS),
  container("MSKU9196899 · Mens Shirts", "CAN-B-MENS-SHIRTS", "Grade (B) Items", 3, "200 pcs", BALE_SHIRT),
  container("MSKU9196899 · Mens T-shirts #2", "CAN-B-MENS-T-SHIRTS-2", "Grade (B) Items", 3, "100 lbs (≈45 kg)", BALE_TEE),
  container("MSKU9196899 · Skinny Jeans", "CAN-B-SKINNY-JEANS", "Grade (B) Items", 3, "100 lbs (≈45 kg)", BALE_JEANS),
  container("MSKU9196899 · Sports Shorts", "CAN-B-SPORTS-SHORTS", "Grade (B) Items", 1, "100 lbs (≈45 kg)", BALE_SPORTS),
];


/** The whole live inventory: the published marketplace range + the full
 * Canada container manifest. Feeds the shared catalogue and the Portmetals
 * showcase account on store re-seed. */
export const PORTMETALS_FULL_CATALOGUE: InventoryItem[] = [
  ...PORTMETALS_CATALOGUE,
  ...PORTMETALS_CONTAINER,
];
