/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StarterPackage {
  id: string;
  name: string;
  tagline: string;
  priceTZS: number;
  badge?: string;
  features: string[];
  includes: { item: string; detail: string }[];
  estimatedROI: string;
  idealFor: string;
  ctaLabel: string;
}

export const STARTER_PACKAGES: StarterPackage[] = [
  {
    id: "pkg-starter",
    name: "Starter Business Package",
    tagline: "Everything you need to start your first business",
    priceTZS: 450000,
    badge: "Most Popular",
    features: [
      "25kg Sorted Starter Bale (any category)",
      "2 Business Academy courses",
      "WhatsApp advisory support (30 days)",
      "Retail pricing guide",
      "Business launch checklist",
    ],
    includes: [
      { item: "25kg Starter Bale", detail: "~85 retail-ready items" },
      { item: "Academy Access", detail: "2 core business courses" },
      { item: "Advisor Support", detail: "30 days WhatsApp guidance" },
    ],
    estimatedROI: "Up to 120% return on investment",
    idealFor: "First-time entrepreneurs, students, side-hustle starters",
    ctaLabel: "Start Your Business",
  },
  {
    id: "pkg-growth",
    name: "Growth Package",
    tagline: "Scale from starter to serious business",
    priceTZS: 1000000,
    features: [
      "45kg Wholesale Bale + 1 Refurbished device",
      "Full Business Academy access",
      "Business plan template",
      "Monthly advisor check-in (3 months)",
      "Digital marketing toolkit",
      "Pricing calculator training",
    ],
    includes: [
      { item: "45kg Wholesale Bale", detail: "~160 sorted items" },
      { item: "Refurbished Device", detail: "Certified tech for your business" },
      { item: "Full Academy", detail: "All courses + resources" },
      { item: "Advisor Program", detail: "3 months of check-ins" },
    ],
    estimatedROI: "Up to 180% return on investment",
    idealFor: "Existing traders looking to scale, Instagram sellers, boutique owners",
    ctaLabel: "Grow Your Business",
  },
  {
    id: "pkg-premium",
    name: "Premium Entrepreneur Package",
    tagline: "The complete business-in-a-box for serious entrepreneurs",
    priceTZS: 2200000,
    badge: "Best Value",
    features: [
      "55kg Premium Bale + Tech setup (laptop or tablet)",
      "Full Academy + completion certificate",
      "Dedicated business advisor (6 months)",
      "Showroom consultation session",
      "Distribution network introduction",
      "Priority sourcing access",
      "Quarterly business review",
    ],
    includes: [
      { item: "55kg Premium Bale", detail: "~210 premium items" },
      { item: "Tech Setup", detail: "Certified laptop or tablet" },
      { item: "Dedicated Advisor", detail: "6 months personal guidance" },
      { item: "Distribution Access", detail: "Regional network entry" },
    ],
    estimatedROI: "Up to 250% return on investment",
    idealFor: "Serious entrepreneurs, franchise starters, aspiring distributors",
    ctaLabel: "Launch Your Empire",
  },
];
