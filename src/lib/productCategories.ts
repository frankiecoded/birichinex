/**
 * Canonical marketplace categories.
 *
 * Every listed product is normalised into one of these buckets so the shop,
 * the bales page and the business marketplace always agree on what "Bale",
 * "Women's", "Men's", "Tech" or "General" means. Classification is
 * deterministic and catalogue-first: an item's `source` or the raw catalogue
 * labels it was seeded with win, so a tech listing can never land in Bale and
 * a bale can never land in Tech.
 */

export type ProductCategory = "Bale" | "Women's" | "Men's" | "Tech" | "General";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Bale",
  "Women's",
  "Men's",
  "Tech",
  "General",
];

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  Bale: "#FF9500",
  "Women's": "#FF6482",
  "Men's": "#007AFF",
  Tech: "#5856D6",
  General: "#8E8E93",
};

/** Raw catalogue labels that are unambiguously bale lines. */
const BALE_LABELS = new Set([
  "Wholesale Bales",
  "Mens Items",
  "Ladies Items",
  "Misc + Children Items",
  "Grade (B) Items",
]);

/** Raw catalogue labels that are unambiguously technology lines. */
const TECH_LABELS = new Set([
  "Technology",
  "Smartphones",
  "Laptops",
  "Desktops",
  "Tablets",
  "Refurbished",
  "Accessories",
  "Audio",
  "Storage",
  "Processors",
]);

const MEN_LABELS = new Set(["Men's Fashion", "Formal Wear", "Suits", "Menswear"]);
const WOMEN_LABELS = new Set(["Women's Fashion", "Ladieswear"]);

/** Goods that are unisex on their own — gender only comes from the name. */
const UNISEX_LABELS = new Set([
  "Footwear",
  "Bags & Accessories",
  "Sportswear",
  "Knitwear",
  "Kids",
  "Handbags",
  "Leather",
  "Jackets",
  "T-Shirts",
]);

const TECH_NAME =
  /smartphone|phones\b|laptops?\b|macbook|iphone|ipad|processors?\b|cpu\b|ssd\b|nvme|\bram\b|chargers?\b|cables?\b|airpods?|headphones?|desktops?\b|computers?\b|fujitsu|thinkpad|keyboards?|monitors?|webcams?|earphones?|speakers?|power banks?|tablet/i;

const WOMEN_NAME =
  /\bwom[ae]n\b|ladies\b|ladys\b|\bheels?\b|\bboots?\b|\bblouses?\b|\bdresses?\b|\bskirts?\b|\bleggings?\b|\bhandbags?\b|\bjumpsuits?\b|\bmaxi\b/i;

const MEN_NAME =
  /^men\b|(^|[\s(\-])(men|gents?)\b|(^|[\s(\-])boys?\b|\bsuits?\b|waistcoat|\bblazers?\b|\btrousers\b|tuxedo/i;

export interface ClassifiableItem {
  source?: string;
  category?: string;
  name?: string;
  unit?: string;
}

export function classifyItem(item: ClassifiableItem): ProductCategory {
  const source = String(item.source ?? "").trim().toLowerCase();
  const raw = String(item.category ?? "").trim() || "General";
  const name = String(item.name ?? "").trim();
  const unit = String(item.unit ?? "").toLowerCase();
  const haystack = `${name} ${raw}`;

  if (source === "technology" || TECH_LABELS.has(raw) || TECH_NAME.test(haystack)) return "Tech";
  if (source === "bales" || unit === "bale" || /\bbales?\b/.test(name) || BALE_LABELS.has(raw)) return "Bale";
  if (WOMEN_LABELS.has(raw) || WOMEN_NAME.test(haystack)) return "Women's";
  if (MEN_LABELS.has(raw) || MEN_NAME.test(name)) return "Men's";
  return "General";
}

/**
 * Orders a set of category labels for pills: "All" first, then the canonical
 * categories in PRODUCT_CATEGORIES order, then any stragglers alphabetically.
 */
export function orderCategories(categories: Iterable<string>): string[] {
  const present = new Set(categories);
  const ordered = ["All", ...PRODUCT_CATEGORIES].filter((c) => present.has(c));
  const leftovers = Array.from(present)
    .filter((c) => c !== "All" && !(PRODUCT_CATEGORIES as string[]).includes(c))
    .sort((a, b) => a.localeCompare(b));
  return [...ordered, ...leftovers];
}