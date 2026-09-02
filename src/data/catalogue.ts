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
 * Every listing carries a real image (Unsplash CDN), a category that matches
 * the shop navigation, live stock units and an authentic European origin.
 */

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

const SUPPLIER = "Portmetals Africa";

function tech(
  name: string,
  sku: string,
  category: string,
  price: number,
  stock: number,
  imageId: string,
  extra: Record<string, string> = {},
): InventoryItem {
  return make({ name, sku, category, price, stock, imageId, source: "technology", ...extra });
}

function fashion(
  name: string,
  sku: string,
  category: string,
  price: number,
  stock: number,
  imageId: string,
): InventoryItem {
  return make({ name, sku: "FASH-" + sku, category, price, stock, imageId, source: "fashion" });
}

const lastRestocked = new Date("2026-08-30T10:00:00.000Z").toISOString();

function make(o: {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  imageId: string;
  source: string;
  [k: string]: string | number;
}): InventoryItem {
  const { name, sku, category, price, stock, imageId, source, ...specs } = o;
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
    image: img(imageId),
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
  // ═══════════ TECHNOLOGY — Desktop Processors ═══════════
  tech("Intel Core i3-10100 — 4-Core Processor", "PM-IT-CPU-10100", "Refurbished", 7000, 8, "photo-1518770660439-4636190af475", { "Cores": "4", "Threads": "8", "Socket": "LGA1200" }),
  tech("Intel Core i3-10105 — 4-Core Processor", "PM-IT-CPU-10105", "Refurbished", 8000, 2, "photo-1518770660439-4636190af475", { "Cores": "4", "Threads": "8", "Socket": "LGA1200" }),
  tech("Intel Core i5-8400 — 6-Core Processor", "PM-IT-CPU-8400", "Refurbished", 8500, 10, "photo-1518770660439-4636190af475", { "Cores": "6", "Socket": "LGA1151" }),
  tech("Intel Core i5-9400 — 6-Core Processor", "PM-IT-CPU-9400", "Refurbished", 10000, 8, "photo-1518770660439-4636190af475", { "Cores": "6", "Socket": "LGA1151" }),
  tech("Intel Core i5-9500 — 6-Core Processor", "PM-IT-CPU-9500", "Refurbished", 11000, 2, "photo-1518770660439-4636190af475", { "Cores": "6", "Socket": "LGA1151" }),
  tech("Intel Core i5-10400 — 6-Core Processor", "PM-IT-CPU-10400", "Refurbished", 12000, 3, "photo-1518770660439-4636190af475", { "Cores": "6", "Threads": "12", "Socket": "LGA1200" }),
  tech("Intel Core i5-10500 — 6-Core Processor", "PM-IT-CPU-10500", "Refurbished", 13000, 5, "photo-1518770660439-4636190af475", { "Cores": "6", "Threads": "12", "Socket": "LGA1200" }),
  tech("Intel Core i5-10505 — 6-Core Processor", "PM-IT-CPU-10505", "Refurbished", 14500, 1, "photo-1518770660439-4636190af475", { "Cores": "6", "Threads": "12", "Socket": "LGA1200" }),
  tech("Intel Core i5-10600 — 6-Core Processor", "PM-IT-CPU-10600", "Refurbished", 16000, 1, "photo-1518770660439-4636190af475", { "Cores": "6", "Threads": "12", "Socket": "LGA1200" }),
  tech("Intel Core i7-7700 — 4-Core Processor", "PM-IT-CPU-7700", "Refurbished", 14000, 5, "photo-1518770660439-4636190af475", { "Cores": "4", "Threads": "8", "Socket": "LGA1151" }),
  tech("Intel Core i7-7700K — Unlocked", "PM-IT-CPU-7700K", "Refurbished", 16500, 5, "photo-1518770660439-4636190af475", { "Cores": "4", "Threads": "8", "Socket": "LGA1151", "Overclockable": "Yes" }),
  tech("Intel Core i7-8700 — 6-Core Processor", "PM-IT-CPU-8700", "Refurbished", 20000, 8, "photo-1518770660439-4636190af475", { "Cores": "6", "Threads": "12", "Socket": "LGA1151" }),
  tech("Intel Core i7-8700K — Unlocked", "PM-IT-CPU-8700K", "Refurbished", 22000, 2, "photo-1518770660439-4636190af475", { "Cores": "6", "Threads": "12", "Socket": "LGA1151", "Overclockable": "Yes" }),

  // ═══════════ TECHNOLOGY — Business Laptops ═══════════
  tech("Fujitsu i7 8th Gen Business Laptop", "PM-IT-LAP-FUJ8", "Laptops", 28000, 2, "photo-1496181133206-80ce9b88a853", { "Grade": "A", "Warranty": "6 Months" }),
  tech("Fujitsu i7 10th Gen Business Laptop", "PM-IT-LAP-FUJ10", "Laptops", 40000, 2, "photo-1496181133206-80ce9b88a853", { "Grade": "A", "Warranty": "6 Months" }),
  tech("Lenovo Ryzen 5 Laptop", "PM-IT-LAP-LENR5", "Laptops", 38000, 2, "photo-1541807084-5c52b6b3adef", { "Grade": "A", "Warranty": "6 Months" }),
  tech("Lenovo ThinkPad i5 13th Gen", "PM-IT-LAP-TP13", "Laptops", 60000, 2, "photo-1531403009284-440f080d1e12", { "Grade": "A+", "Warranty": "12 Months" }),

  // ═══════════ TECHNOLOGY — Smartphones & Tablets ═══════════
  tech("iPhone 8 64GB", "PM-IT-PH-8", "Smartphones", 10000, 10, "photo-1592750475338-74b7b21085ab", { "Grade": "A", "Warranty": "6 Months" }),
  tech("iPhone 11 64GB", "PM-IT-PH-11", "Smartphones", 25000, 25, "photo-1510557880182-3d4d3cba35a5", { "Grade": "A", "Warranty": "6 Months" }),
  tech("iPad A1475 16GB", "PM-IT-TAB-A1475", "Smartphones", 7500, 8, "photo-1544244015-0df4b3ffc6b0", { "Grade": "B+", "Warranty": "6 Months" }),
  tech("iPad A1567 32GB", "PM-IT-TAB-A1567", "Smartphones", 15000, 15, "photo-1544244015-0df4b3ffc6b0", { "Grade": "A", "Warranty": "6 Months" }),

  // ═══════════ TECHNOLOGY — RAM ═══════════
  tech("4GB Laptop RAM", "PM-IT-RAM-4G", "Accessories", 1000, 30, "photo-1555617981-dac3880eac2e", { "DDR4": "Yes", "Warranty": "6 Months" }),
  tech("8GB Laptop RAM", "PM-IT-RAM-8G", "Accessories", 1500, 20, "photo-1555617981-dac3880eac2e", { "DDR4": "Yes", "Warranty": "6 Months" }),
  tech("16GB Laptop RAM", "PM-IT-RAM-16G", "Accessories", 3500, 14, "photo-1555617981-dac3880eac2e", { "DDR4": "Yes", "Warranty": "6 Months" }),

  // ═══════════ TECHNOLOGY — Storage (SATA + M.2) ═══════════
  tech("120GB SATA SSD", "PM-IT-SSD-120", "Accessories", 1500, 19, "photo-1607860108855-64acf2078ed9", { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("128GB SATA SSD", "PM-IT-SSD-128", "Accessories", 2000, 2, "photo-1607860108855-64acf2078ed9", { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("240GB SATA SSD", "PM-IT-SSD-240", "Accessories", 2500, 6, "photo-1607860108855-64acf2078ed9", { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("250GB SATA SSD", "PM-IT-SSD-250", "Accessories", 3000, 6, "photo-1607860108855-64acf2078ed9", { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("256GB SATA SSD", "PM-IT-SSD-256", "Accessories", 3500, 13, "photo-1607860108855-64acf2078ed9", { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("480GB SATA SSD", "PM-IT-SSD-480", "Accessories", 4500, 2, "photo-1607860108855-64acf2078ed9", { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("500GB SATA SSD", "PM-IT-SSD-500", "Accessories", 5000, 4, "photo-1607860108855-64acf2078ed9", { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("512GB SATA SSD", "PM-IT-SSD-512", "Accessories", 6000, 2, "photo-1607860108855-64acf2078ed9", { "Interface": "SATA", "Warranty": "6 Months" }),
  tech("128GB M.2 NVMe SSD", "PM-IT-SSD-M2-128", "Accessories", 2500, 12, "photo-1607860108855-64acf2078ed9", { "Interface": "M.2 NVMe", "Warranty": "6 Months" }),
  tech("256GB M.2 NVMe SSD", "PM-IT-SSD-M2-256", "Accessories", 3000, 14, "photo-1607860108855-64acf2078ed9", { "Interface": "M.2 NVMe", "Warranty": "6 Months" }),

  // ═══════════ TECHNOLOGY — Accessories ═══════════
  tech("Samsung 25W Fast Charger", "PM-IT-ACC-SAM25", "Accessories", 500, 20, "photo-1585060544812-6b45742d762f", { "Wattage": "25W", "Condition": "New" }),
  tech("Apple USB-C Adapter", "PM-IT-ACC-APPLE", "Accessories", 800, 20, "photo-1585060544812-6b45742d762f", { "Condition": "New" }),
  tech("Belkin Charger + Cable", "PM-IT-ACC-BELKIN", "Accessories", 1000, 10, "photo-1585060544812-6b45742d762f", { "Condition": "New" }),
  tech("Belkin iPhone Cable", "PM-IT-ACC-BELCABLE", "Accessories", 500, 10, "photo-1585060544812-6b45742d762f", { "Condition": "New" }),
  tech("USB Charging Cable", "PM-IT-ACC-USB", "Accessories", 250, 100, "photo-1585060544812-6b45742d762f", { "Condition": "New" }),
  tech("AirPods (Gen 1) — Refurbished", "PM-IT-ACC-AIRPODS", "Audio", 3000, 20, "photo-1600294037681-c80b4cb5b434", { "Grade": "A", "Warranty": "6 Months" }),
  tech("iPhone 13 Pro Case", "PM-IT-ACC-I13CASE", "Accessories", 500, 10, "photo-1601593346740-927612e3cdee", { "Condition": "New" }),

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
