import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, Trash2, X, Store, ShoppingBag, Globe, Settings2, Minus } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CursorSpotlight from "../components/three/CursorSpotlight";
import TiltCard from "../components/three/TiltCard";
import { useStore } from "../store/useStore";
import type { InventoryItem } from "../store/useStore";
import { formatPrice } from "../data/platform";
import type { Currency } from "../types";

interface ItemForm {
  name: string;
  sku: string;
  category: string;
  stock: string;
  minStock: string;
  price: string;
  unit: string;
  supplier: string;
}

const EMPTY_FORM: ItemForm = { name: "", sku: "", category: "", stock: "", minStock: "", price: "", unit: "pcs", supplier: "" };

export default function InventoryPage() {
  const items = useStore((s) => s.inventoryItems);
  const addItem = useStore((s) => s.addInventoryItem);
  const updateItem = useStore((s) => s.updateInventoryItem);
  const deleteItem = useStore((s) => s.deleteInventoryItem);
  const postItemToMarketplace = useStore((s) => s.postItemToMarketplace);
  const removeItemFromMarketplace = useStore((s) => s.removeItemFromMarketplace);
  const searchQuery = useStore((s) => s.inventorySearchQuery);
  const setSearchQuery = useStore((s) => s.setInventorySearchQuery);
  const selectedCurrency = useStore((s) => s.selectedCurrency);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [postModalItem, setPostModalItem] = useState<string | null>(null);
  const [postPrice, setPostPrice] = useState("");
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustForm, setAdjustForm] = useState({ stock: "", minStock: "", price: "" });

  const openAdjust = (item: InventoryItem) => {
    setAdjustItem(item);
    setAdjustForm({ stock: String(item.stock), minStock: String(item.minStock), price: String(item.price.amount) });
  };

  const saveAdjust = () => {
    if (!adjustItem) return;
    const stockNum = parseInt(adjustForm.stock, 10);
    const minStockNum = parseInt(adjustForm.minStock, 10);
    const priceNum = parseFloat(adjustForm.price);
    const stock = isNaN(stockNum) || stockNum < 0 ? adjustItem.stock : stockNum;
    const minStock = isNaN(minStockNum) || minStockNum < 0 ? adjustItem.minStock : minStockNum;
    const price = isNaN(priceNum) || priceNum < 0 ? adjustItem.price.amount : priceNum;
    const status = stock === 0 ? "out-of-stock" : stock <= minStock ? "low-stock" : "in-stock";
    updateItem(adjustItem.id, {
      stock,
      minStock,
      price: { amount: price, currency: adjustItem.price.currency },
      status,
      lastRestocked: new Date().toISOString(),
    });
    setAdjustItem(null);
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    const lowStock = items.filter((item) => item.stock <= item.minStock).length;
    const outOfStock = items.filter((item) => item.stock === 0).length;
    const dropshipItems = items.filter((item) => item.source === "dropship").length;
    const marketplaceItems = items.filter((item) => item.postedToMarketplace).length;
    return [
      { label: "Total Items", value: totalItems.toLocaleString(), icon: Package },
      { label: "Total Stock", value: totalStock.toLocaleString(), icon: Package },
      { label: "Low Stock", value: String(lowStock), icon: ArrowDownRight },
      { label: "Out of Stock", value: String(outOfStock), icon: ArrowUpRight },
      { label: "Dropship", value: String(dropshipItems), icon: Store },
      { label: "On Marketplace", value: String(marketplaceItems), icon: Globe },
    ];
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.stock) return;
    const stockNum = parseInt(form.stock, 10) || 0;
    const minStockNum = parseInt(form.minStock, 10) || 0;
    const priceNum = parseFloat(form.price) || 0;
    addItem({
      name: form.name.trim(),
      sku: form.sku.trim() || `PM-${Date.now()}`,
      category: form.category.trim() || "Uncategorized",
      stock: stockNum,
      minStock: minStockNum,
      price: { amount: priceNum, currency: "TZS" },
      unit: form.unit.trim() || "pcs",
      status: stockNum === 0 ? "out-of-stock" : stockNum <= minStockNum ? "low-stock" : "in-stock",
      supplier: form.supplier.trim() || "Unknown",
      lastRestocked: new Date().toISOString(),
      source: 'manual',
      postedToMarketplace: false,
    });
    setForm(EMPTY_FORM);
    setModalOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(48,209,88,0.08)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.06)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-headline text-ink tracking-tight"><span className="text-gradient-brand">Inventory</span></h1>
          <p className="text-callout text-ink-tertiary mt-1">Stock management, warehouses, and product movement.</p>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>Add Item</Button>
      </motion.div>

      {/* Stats */}
      <CursorSpotlight spotlightSize={500} spotlightColor="rgba(48,209,88,0.04)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard intensity={5}>
                <GlassCard padding="md" hover>
                  <p className="text-caption text-ink-tertiary uppercase tracking-wider font-semibold">{stat.label}</p>
                  <p className="text-title font-bold text-ink mt-1 tracking-tight">{stat.value}</p>
                </GlassCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </CursorSpotlight>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassCard padding="none">
          <div className="p-5 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-subhead font-bold text-ink">Stock Items</h3>
              <Badge variant="default" size="sm">{filtered.length}</Badge>
            </div>
            <div className="flex items-center gap-2 h-9 px-3 bg-surface-secondary/60 backdrop-blur-sm rounded-[10px] border border-glass-border">
              <Search className="h-3.5 w-3.5 text-ink-quaternary" strokeWidth={1.5} />
              <input
                placeholder="Search inventory..."
                className="bg-transparent text-caption text-ink placeholder:text-ink-quaternary focus:outline-none w-full max-w-[160px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left text-overline text-ink-quaternary px-5 py-3">Product</th>
                  <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden md:table-cell">SKU</th>
                  <th className="text-left text-overline text-ink-quaternary px-5 py-3 hidden md:table-cell">Category</th>
                  <th className="text-right text-overline text-ink-quaternary px-5 py-3">Stock</th>
                  <th className="text-right text-overline text-ink-quaternary px-5 py-3 hidden sm:table-cell">Min</th>
                  <th className="text-right text-overline text-ink-quaternary px-5 py-3 hidden sm:table-cell">Price</th>
                  <th className="text-right text-overline text-ink-quaternary px-5 py-3">Status</th>
                  <th className="w-10 px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-callout text-ink-quaternary">
                      No items found
                    </td>
                  </tr>
                )}
                {filtered.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.25 + i * 0.02 }}
                    className="border-b border-glass-border last:border-0 hover:bg-surface-secondary/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-ink-tertiary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <span className="text-subhead font-semibold text-ink">{item.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {item.source === "dropship" && (
                              <Badge variant="info" size="sm">Dropship</Badge>
                            )}
                            {item.postedToMarketplace && (
                              <Badge variant="success" size="sm">Listed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-caption text-ink-tertiary font-mono hidden md:table-cell">{item.sku}</td>
                    <td className="px-5 py-3.5 text-caption text-ink-secondary hidden md:table-cell">{item.category}</td>
                    <td className="px-5 py-3.5 text-right text-subhead font-bold text-ink">{item.stock.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-caption text-ink-quaternary hidden sm:table-cell">{item.minStock}</td>
                    <td className="px-5 py-3.5 text-right text-caption text-ink-secondary hidden sm:table-cell">
                      {formatPrice(item.price.amount, selectedCurrency)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge variant={item.status === "out-of-stock" ? "error" : item.status === "low-stock" ? "warning" : "success"} size="sm">
                        {item.status === "out-of-stock" ? "Out" : item.status === "low-stock" ? "Low" : "In Stock"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openAdjust(item)}
                          className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-info hover:bg-info/10 transition-colors"
                          title="Adjust stock"
                        >
                          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        {!item.postedToMarketplace ? (
                          <button
                            onClick={() => { setPostModalItem(item.id); setPostPrice(String(item.price.amount)); }}
                            className="h-8 px-2.5 rounded-[8px] flex items-center gap-1.5 text-caption font-semibold text-brand-dark hover:bg-brand/10 transition-colors"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span className="hidden sm:inline">Sell</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => removeItemFromMarketplace(item.id)}
                            className="h-8 px-2.5 rounded-[8px] flex items-center gap-1.5 text-caption font-semibold text-error hover:bg-error/10 transition-colors"
                          >
                            <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span className="hidden sm:inline">Unlist</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-subhead font-bold text-ink">Add Inventory Item</h2>
                  <button onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] flex items-center justify-center text-ink-quaternary hover:text-ink hover:bg-surface-secondary/80 transition-colors">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Name</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">SKU</label>
                      <input
                        value={form.sku}
                        onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="Auto-generated"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Category</label>
                      <input
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="e.g. Men's Fashion"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Stock</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Min Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={form.minStock}
                        onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Price ({selectedCurrency})</label>
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Unit</label>
                      <input
                        value={form.unit}
                        onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="pcs"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Supplier</label>
                      <input
                        value={form.supplier}
                        onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                        className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                        placeholder="Supplier name"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      Add Item
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post to Marketplace Modal */}
      <AnimatePresence>
        {postModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setPostModalItem(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-subhead font-bold text-ink">Post to Marketplace</h3>
                <button onClick={() => setPostModalItem(null)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors">
                  <X className="h-4 w-4 text-ink-secondary" />
                </button>
              </div>
              <p className="text-caption text-ink-tertiary">
                Set a selling price and list this item on the marketplace for customers to purchase.
              </p>
              <div>
                <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Marketplace Price ({selectedCurrency})</label>
                <input
                  type="number"
                  min="0"
                  value={postPrice}
                  onChange={(e) => setPostPrice(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="Enter selling price"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="ghost" className="flex-1" onClick={() => setPostModalItem(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!postPrice || parseFloat(postPrice) <= 0}
                  onClick={() => {
                    if (postModalItem && postPrice) {
                      postItemToMarketplace(postModalItem, { amount: parseFloat(postPrice), currency: selectedCurrency });
                      setPostModalItem(null);
                      setPostPrice("");
                    }
                  }}
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
                  Post
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {adjustItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-scrim backdrop-blur-sm" onClick={() => setAdjustItem(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-surface-primary border border-glass-border rounded-[16px] shadow-2xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-[10px] bg-surface-secondary/80 flex items-center justify-center">
                    <Settings2 className="h-4 w-4 text-info" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-subhead font-bold text-ink">Adjust Stock</h3>
                    <p className="text-caption text-ink-tertiary">{adjustItem.name}</p>
                  </div>
                </div>
                <button onClick={() => setAdjustItem(null)} className="h-8 w-8 rounded-full bg-surface-secondary/80 flex items-center justify-center hover:bg-surface-secondary transition-colors">
                  <X className="h-4 w-4 text-ink-secondary" />
                </button>
              </div>

              <div>
                <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Stock on hand</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdjustForm((f) => ({ ...f, stock: String(Math.max(0, (parseInt(f.stock, 10) || 0) - 1)) }))}
                    className="h-10 w-10 rounded-[10px] bg-surface-secondary/80 border border-glass-border flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
                  >
                    <Minus className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={adjustForm.stock}
                    onChange={(e) => setAdjustForm((f) => ({ ...f, stock: e.target.value }))}
                    className="flex-1 h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink text-center focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                  <button
                    onClick={() => setAdjustForm((f) => ({ ...f, stock: String((parseInt(f.stock, 10) || 0) + 1) }))}
                    className="h-10 w-10 rounded-[10px] bg-surface-secondary/80 border border-glass-border flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Min stock</label>
                  <input
                    type="number"
                    min="0"
                    value={adjustForm.minStock}
                    onChange={(e) => setAdjustForm((f) => ({ ...f, minStock: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="text-caption text-ink-secondary font-semibold block mb-1.5">Price ({selectedCurrency})</label>
                  <input
                    type="number"
                    min="0"
                    value={adjustForm.price}
                    onChange={(e) => setAdjustForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full h-10 px-3 bg-surface-secondary/60 border border-glass-border rounded-[10px] text-caption text-ink placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>

              <p className="text-caption text-ink-tertiary">
                Stock status recalculates automatically: 0 = Out, at or below min = Low.
              </p>

              <div className="flex gap-3 pt-1">
                <Button variant="ghost" className="flex-1" onClick={() => setAdjustItem(null)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={saveAdjust}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
