import type { Product } from "../types";
import type { InventoryItem } from "../store/useStore";

export function inventoryItemToProduct(item: InventoryItem): Product {
  const brand = (item.supplier || "Portmetals Africa").replace(/\s+/g, " ").trim();
  const specs = item.specs ?? { Unit: item.unit, "Min Stock": String(item.minStock) };
  return {
    id: `inv-${item.id}`,
    name: item.name,
    description: item.specs && Object.keys(item.specs).length > 0
      ? `${item.category} listing by ${brand} · SKU ${item.sku}`
      : `${item.category} listing · SKU ${item.sku}`,
    category: item.category,
    price: item.marketplacePrice ?? item.price,
    images: item.image ? [item.image] : [],
    supplier: { id: "self", name: brand, verified: true, rating: 5, location: "Nairobi, Kenya" },
    grade: "A",
    origin: "Imported from Europe",
    specifications: specs,
    stock: item.stock,
    minOrder: 1,
    createdAt: item.lastRestocked,
  };
}

export function postedInventoryToProducts(items: InventoryItem[]): Product[] {
  return items.filter((item) => item.postedToMarketplace).map(inventoryItemToProduct);
}