/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Curated Unsplash imagery — wholesale fashion, warehouse, tech, entrepreneurship */

export const IMAGES = {
  hero: {
    main: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2400&q=85",
    overlay: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2400&q=85",
  },
  warehouse: {
    mombasa: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85",
    sorting: "https://images.unsplash.com/photo-1553413077-190603b0234b?auto=format&fit=crop&w=1600&q=85",
    bales: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=85",
  },
  showroom: {
    mombasa: "https://images.unsplash.com/photo-1441984904996-e0b87a68756e?auto=format&fit=crop&w=1600&q=85",
    nairobi: "https://images.unsplash.com/photo-1555529669-2269763671c0?auto=format&fit=crop&w=1600&q=85",
    consultation: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
  },
  academy: {
    hero: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=85",
    classroom: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=85",
    mentor: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=85",
  },
  tech: {
    hero: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=85",
    laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=85",
    phones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=85",
    tablets: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=85",
    desktops: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=85",
    networking: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=85",
  },
  marketplace: {
    hero: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85",
  },
  europe: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=85",
  africa: "https://images.unsplash.com/photo-1547471080-7cc2caa137a0?auto=format&fit=crop&w=800&q=85",
} as const;

export const CATEGORY_IMAGES: Record<string, { image: string; description: string; baleSize: string; resale: string; customer: string }> = {
  "Women's Fashion": {
    image: "https://images.unsplash.com/photo-1483985988355-763728fa4b65?auto=format&fit=crop&w=800&q=85",
    description: "Premium sorted denim, dresses, blouses, and palazzo trousers.",
    baleSize: "45kg / 55kg",
    resale: "High — 70–100% markup on cream items",
    customer: "Boutiques, Instagram sellers, market traders",
  },
  "Men's Fashion": {
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a41?auto=format&fit=crop&w=800&q=85",
    description: "Cotton shirts, mixed pants, flannel, and premium shorts.",
    baleSize: "45kg / 55kg",
    resale: "Strong — office wear and casual demand",
    customer: "Retail shops, street vendors, corporate buyers",
  },
  Kids: {
    image: "https://images.unsplash.com/photo-1503454537845-d6e8c86176cb?auto=format&fit=crop&w=800&q=85",
    description: "Pre-washed infant and children rummage packs.",
    baleSize: "25kg / 30kg",
    resale: "Very high — fast turnover per item",
    customer: "Baby stores, schools, young families",
  },
  Sportswear: {
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=85",
    description: "Track jackets, joggers, leggings, and athletic tees.",
    baleSize: "25kg / 45kg",
    resale: "Strong — gym and youth markets",
    customer: "Fitness boutiques, sports clubs",
  },
  Jackets: {
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85",
    description: "Anoraks, zippers, sweatshirts, and light bomber jackets.",
    baleSize: "45kg",
    resale: "Seasonal premium margins",
    customer: "Universities, outdoor wear retailers",
  },
  Handbags: {
    image: "https://images.unsplash.com/photo-1584917865442-de89a7620a6a?auto=format&fit=crop&w=800&q=85",
    description: "Designer, casual, and formal leather and fabric bags.",
    baleSize: "30kg / 45kg",
    resale: "Premium — up to 150% markup",
    customer: "Niche boutiques, Instagram sellers",
  },
  Leather: {
    image: "https://images.unsplash.com/photo-1520975922284-8b456906c813?auto=format&fit=crop&w=800&q=85",
    description: "Sorted leather pants, skirts, and fashion jackets.",
    baleSize: "25kg / 45kg",
    resale: "Elite — highest margin category",
    customer: "High-end boutiques, alternative fashion",
  },
  "T-Shirts": {
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
    description: "Branded and premium cotton crewneck and v-neck tees.",
    baleSize: "45kg / 55kg",
    resale: "Fast volume sales",
    customer: "Youth kiosks, weekend pop-ups",
  },
};

export const PRODUCT_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1596755094514-f87e34085b56?auto=format&fit=crop&w=600&q=85",
  2: "https://images.unsplash.com/photo-1473966968607-fa801b279a0a?auto=format&fit=crop&w=600&q=85",
  3: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=85",
  4: "https://images.unsplash.com/photo-1598033129185-c4f50f2d8c2e?auto=format&fit=crop&w=600&q=85",
  5: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=600&q=85",
  6: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=85",
  7: "https://images.unsplash.com/photo-1595777457583-95c1f5a1a0a0?auto=format&fit=crop&w=600&q=85",
  8: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=85",
  9: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=85",
  10: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=85",
  11: "https://images.unsplash.com/photo-1515488042361-ee00e017b1b1?auto=format&fit=crop&w=600&q=85",
  12: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=85",
  13: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=600&q=85",
  14: "https://images.unsplash.com/photo-1506629901450-4ebb879c4d0b?auto=format&fit=crop&w=600&q=85",
  15: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=85",
  16: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=85",
  17: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=85",
  18: "https://images.unsplash.com/photo-1620799140408-edc6dcb086d8?auto=format&fit=crop&w=600&q=85",
  19: "https://images.unsplash.com/photo-1520975922284-8b456906c813?auto=format&fit=crop&w=600&q=85",
  20: "https://images.unsplash.com/photo-1521220236056-f10fc8e8b9a8?auto=format&fit=crop&w=600&q=85",
  21: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=85",
  22: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=85",
};

export const TECH_IMAGES: Record<string, string> = {
  "tech-1": IMAGES.tech.laptops,
  "tech-2": IMAGES.tech.tablets,
  "tech-3": IMAGES.tech.laptops,
  "tech-4": IMAGES.tech.phones,
  "tech-5": IMAGES.tech.desktops,
  "tech-6": IMAGES.tech.networking,
};

export const BALE_IMAGES: Record<string, string> = {
  "bale-starter-25": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=85",
  "bale-business-30": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=85",
  "bale-wholesale-45": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=85",
  "bale-premium-55": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=85",
  "bale-commercial-70": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85",
};

export const ACADEMY_IMAGES: Record<string, string> = {
  "lesson-1": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=85",
  "lesson-2": "https://images.unsplash.com/photo-1554224315-bad435d9b0d0?auto=format&fit=crop&w=600&q=85",
  "lesson-3": "https://images.unsplash.com/photo-1611162617474-5b21e939e113?auto=format&fit=crop&w=600&q=85",
  "lesson-4": "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=85",
};

export function getProductImage(productId: number, category: string): string {
  return PRODUCT_IMAGES[productId] ?? CATEGORY_IMAGES[category]?.image ?? IMAGES.marketplace.hero;
}
