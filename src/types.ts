/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductPrice {
  id: number;
  name: string;
  priceTZS: number; // Tanzanian Shilling
  category: string;
  baleSize?: string;
  description: string;
  expectedProfitMargin: number; // e.g. 0.6 for 60%
  resalePotential: string;
  targetCustomer: string;
}

export interface BaleOption {
  id: string;
  name: string;
  weight: string;
  priceUSD: number;
  priceTZS: number;
  idealCustomer: string;
  estimatedPieces: number;
  expectedResalePotential: string;
  storageRecommendation: string;
  profitOpportunity: string;
  badge?: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  content: string; // Markdown / text
  estimatedIncomeIncrease: string;
}

export interface RefurbishedTech {
  id: string;
  name: string;
  category: "Phones" | "Tablets" | "Laptops" | "Desktops" | "Accessories" | "Networking";
  priceTZS: number;
  condition: "Certified Premium" | "Refurbished Excellent" | "Tested Good";
  specs: string[];
  warranty: string;
  stock: number;
}

export interface SuccessStory {
  id: string;
  name: string;
  businessType: string;
  location: string;
  monthlyRevenueBefore: string;
  monthlyRevenueAfter: string;
  story: string;
  baleTypeUsed: string;
  quote: string;
  imageUrl: string;
}

export interface CartItem {
  id: string;
  type: "product" | "bale" | "tech";
  itemId: string;
  name: string;
  priceTZS: number;
  quantity: number;
  details?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessLocation: string;
  preferredCurrency: "TZS" | "KES" | "USD";
  completedLessons: string[];
  submittedQuotes: Array<{
    id: string;
    date: string;
    items: CartItem[];
    status: "Pending Review" | "Advisor Contacted" | "Approved";
    totalTZS: number;
  }>;
}

export interface AppState {
  cart: CartItem[];
  user: UserProfile | null;
  selectedCurrency: "TZS" | "KES" | "USD";
}
