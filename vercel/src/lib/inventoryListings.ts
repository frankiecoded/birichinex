import type { Product } from "../types";
import type { InventoryItem } from "../store/useStore";

export function inventoryItemToProduct(item: InventoryItem): Product {
  return {
    id: `inv-${item.id}`,
    name: item.name,
    description: `${item.category} listing · SKU ${item.sku}`,
    category: item.category,
    price: item.marketplacePrice ?? item.price,
    images: [],
    supplier: { id: "self", name: item.supplier, verified: true, rating: 5, location: "Dar es Salaam" },
    grade: "A+",
    origin: "Tanzania",
    specifications: { SKU: item.sku, Unit: item.unit, "Min Stock": String(item.minStock) },
    stock: item.stock,
    minOrder: 1,
    createdAt: item.lastRestocked,
  };
}

export function postedInventoryToProducts(items: InventoryItem[]): Product[] {
  return items.filter((item) => item.postedToMarketplace).map(inventoryItemToProduct);
}
