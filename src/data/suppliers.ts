export interface DropshipSupplier {
  id: string;
  name: string;
  location: string;
  region: string;
  verified: boolean;
  rating: number;
  fulfillmentDays: string;
  description: string;
}

export const DROPSHIP_SUPPLIERS: DropshipSupplier[] = [
  {
    id: "portmetals",
    name: "Portmetals Africa",
    location: "Nairobi, Kenya",
    region: "East Africa",
    verified: true,
    rating: 5,
    fulfillmentDays: "1–3 days",
    description:
      "Flagship verified supplier behind the entire dropship catalogue — holds stock in Nairobi, posts products to the marketplace, and fulfills dropship orders directly.",
  },
  {
    id: "canada",
    name: "Canada Container Program",
    location: "Montreal, Canada",
    region: "North America",
    verified: true,
    rating: 4.9,
    fulfillmentDays: "14–21 days",
    description:
      "Source of the wholesale bales (container MSKU9196899) — hand-sorted, graded garments shipped as volume bales for East African retail.",
  },
  {
    id: "europe",
    name: "European Fashion Hub",
    location: "Amsterdam, Netherlands",
    region: "Europe",
    verified: true,
    rating: 4.8,
    fulfillmentDays: "5–10 days",
    description:
      "Premium European-sorted fashion — footwear, bags, accessories, formal wear and the retail division's curated clothing lines.",
  },
  {
    id: "tech",
    name: "Certified Refurb Lab",
    location: "Nairobi, Kenya",
    region: "East Africa",
    verified: true,
    rating: 4.9,
    fulfillmentDays: "1–3 days",
    description:
      "In-house certified refurbished technology — laptops, processors and accessories graded A+/A with a 12-month warranty.",
  },
];

const TECH_CATEGORIES = new Set(["Laptops", "Refurbished", "Smartphones", "Accessories", "Audio"]);
const CANADA_CATEGORIES = new Set([
  "Wholesale Bales",
  "Mens Items",
  "Ladies Items",
  "Misc + Children Items",
  "Grade (B) Items",
]);
const RETAIL_CATEGORIES = new Set([
  "Footwear",
  "Bags & Accessories",
  "Formal Wear",
  "Men's Fashion",
  "Women's Fashion",
  "Jackets",
  "Kids",
  "Sportswear",
  "T-Shirts",
  "Handbags",
  "Leather",
]);

const byId = (id: string) => DROPSHIP_SUPPLIERS.find((s) => s.id === id)!;

export function supplierForItem(item: { source?: string; category?: string }): DropshipSupplier {
  const source = item.source ?? "";
  const category = item.category ?? "";
  if (source === "technology" || TECH_CATEGORIES.has(category)) return byId("tech");
  if (source === "bales" || CANADA_CATEGORIES.has(category)) return byId("canada");
  if (source === "retail" || RETAIL_CATEGORIES.has(category)) return byId("europe");
  return byId("portmetals");
}