// ─────────────────────────────────────────────────────────────────────────────
// BirichiNex — Legal & Trust Centre content.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH for the platform's legal pages. The
// text below is frozen verbatim from the official BirichiNex policy documents
// (Version 1.0 — effective 30 August 2026) and must not be edited casually.
// Every footer legal page renders one of these page definitions.
// ─────────────────────────────────────────────────────────────────────────────

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export interface LegalSectionDef {
  heading?: string;
  blocks: LegalBlock[];
}

export interface LegalPageDef {
  id: string;
  route: string;
  title: string;
  kicker: string;
  summary: string;
  effective: string;
  updated: string;
  sections: LegalSectionDef[];
}

export const LEGAL_COMPANY = {
  company: "BirichiNex Technologies Limited",
  country: "Kenya",
  platform: "BirichiNex",
  website: "BirichiNex.com",
};

export const LEGAL_PAGES: Record<string, LegalPageDef> = {
  terms: {
    id: "terms",
    route: "legal:terms",
    title: "Terms of Service",
    kicker: "Terms of Service",
    summary:
      "The terms that govern access to and use of the BirichiNex platform and the services made available through it.",
    effective: "30 August 2026",
    updated: "30 August 2026",
    sections: [
      {
        heading: "1. About These Terms",
        blocks: [
          { kind: "p", text: "These Terms of Service govern access to and use of the BirichiNex platform and the services made available through it." },
          { kind: "p", text: "BirichiNex is operated by BirichiNex Technologies Limited, Kenya." },
          { kind: "p", text: "BirichiNex provides a connected business ecosystem that may include marketplace services, business-management tools, CRM, inventory, procurement, logistics functionality, payments integrations, analytics, learning resources, community features, artificial-intelligence services and related business-support services." },
          { kind: "p", text: "By creating an account, accessing restricted services or using BirichiNex services, you agree to these Terms and any additional terms that apply to a particular service." },
        ],
      },
      {
        heading: "2. Eligibility and Accounts",
        blocks: [
          { kind: "p", text: "Users must provide accurate, current and complete information when creating or maintaining an account." },
          { kind: "p", text: "Users are responsible for maintaining the confidentiality and security of their account credentials and for activity conducted through their accounts." },
          { kind: "p", text: "Business users and sellers must have authority to act for the business they register or represent." },
          { kind: "p", text: "BirichiNex may require identity, business, seller or other verification before providing access to certain services." },
          { kind: "p", text: "Users must promptly update information that becomes inaccurate or outdated." },
        ],
      },
      {
        heading: "3. BirichiNex Services",
        blocks: [
          { kind: "p", text: "BirichiNex may provide access to services including:" },
          {
            kind: "ul",
            items: [
              "Marketplace and product discovery",
              "Business profiles",
              "Seller services",
              "CRM",
              "Inventory management",
              "Procurement and sourcing",
              "Logistics support and integrations",
              "Finance and business-management functionality",
              "Payment integrations",
              "Analytics",
              "Dropshipping functionality",
              "BirichiNex Academy",
              "Community and networking",
              "BNX AI",
              "Amani",
              "Other business tools introduced from time to time",
            ],
          },
          { kind: "p", text: "Not every feature will necessarily be available to every user, business, country or subscription level." },
          { kind: "p", text: "Features identified as beta, pilot or experimental may change or be withdrawn as they are developed." },
        ],
      },
      {
        heading: "4. User Responsibilities",
        blocks: [
          { kind: "p", text: "Users must:" },
          {
            kind: "ul",
            items: [
              "provide truthful and accurate information;",
              "use BirichiNex lawfully;",
              "respect the rights of other users;",
              "maintain appropriate account security;",
              "provide only information they are authorized to provide;",
              "comply with applicable laws, regulations and contractual obligations;",
              "ensure that business, product and service information they publish is accurate.",
            ],
          },
          { kind: "p", text: "Users remain responsible for decisions they make using information, tools, analytics or AI-generated recommendations provided through BirichiNex." },
        ],
      },
      {
        heading: "5. Marketplace Activity",
        blocks: [
          { kind: "p", text: "BirichiNex may allow businesses to offer products or services through the marketplace." },
          { kind: "p", text: "A product page, checkout process, invoice or order confirmation should identify the relevant seller where appropriate." },
          { kind: "p", text: "Unless expressly identified otherwise, an independent marketplace seller remains responsible for its products, descriptions, pricing, availability, fulfilment, customer obligations and compliance with applicable law." },
          { kind: "p", text: "Where BirichiNex Technologies Limited or another identified BirichiNex entity is itself the seller, this should be clearly stated in the relevant transaction." },
        ],
      },
      {
        heading: "6. AI Services",
        blocks: [
          { kind: "p", text: "BirichiNex may provide artificial-intelligence-enabled functionality including BNX AI and Amani." },
          { kind: "p", text: "AI-generated information may be incomplete, inaccurate or unsuitable for a user's particular circumstances." },
          { kind: "p", text: "AI output is provided as business-support information and should not automatically be treated as professional legal, tax, accounting, investment, medical or other regulated advice." },
          { kind: "p", text: "Users remain responsible for reviewing AI output and making their own business decisions." },
          { kind: "p", text: "Additional provisions are contained in the AI Terms & Responsible Use Policy." },
        ],
      },
      {
        heading: "7. Payments and Fees",
        blocks: [
          { kind: "p", text: "Certain BirichiNex services may be free while others may require subscription fees, commissions, transaction charges or other fees." },
          { kind: "p", text: "Applicable charges must be displayed or otherwise communicated before the relevant paid service or transaction is completed." },
          { kind: "p", text: "Marketplace payments may be processed by BirichiNex or authorized third-party payment providers, depending on the service and payment method available." },
          { kind: "p", text: "Users are responsible for reviewing the applicable price and transaction information before confirming payment." },
        ],
      },
      {
        heading: "8. Intellectual Property",
        blocks: [
          { kind: "p", text: "The BirichiNex name, brand, software, platform design, original content, technology, documentation and other proprietary materials are owned by or licensed to BirichiNex Technologies Limited unless otherwise stated." },
          { kind: "p", text: "Users retain ownership of content and business information they lawfully submit to BirichiNex." },
          { kind: "p", text: "By submitting content necessary to operate a BirichiNex service, users grant BirichiNex the limited rights reasonably required to host, process, display and use that content for providing and improving the relevant service, subject to applicable law and our Privacy Policy." },
          { kind: "p", text: "Users may not copy, reproduce, reverse engineer, misuse or commercially exploit BirichiNex proprietary materials except where authorized or permitted by law." },
        ],
      },
      {
        heading: "9. Prohibited Use",
        blocks: [
          { kind: "p", text: "Users must not use BirichiNex to:" },
          {
            kind: "ul",
            items: [
              "commit fraud or deception;",
              "impersonate another person or business;",
              "sell unlawful, counterfeit, stolen or prohibited products;",
              "provide deliberately false or misleading product information;",
              "manipulate transactions or platform metrics;",
              "introduce malicious software;",
              "attack, disrupt or gain unauthorized access to BirichiNex systems;",
              "misuse personal information;",
              "infringe intellectual-property rights;",
              "use AI functionality for unlawful or abusive activity;",
              "engage in conduct that materially threatens users, the platform or legitimate marketplace activity.",
            ],
          },
        ],
      },
      {
        heading: "10. Suspension and Termination",
        blocks: [
          { kind: "p", text: "BirichiNex may restrict, suspend or terminate access where reasonably necessary because of:" },
          {
            kind: "ul",
            items: [
              "serious or repeated violations of these Terms;",
              "fraud or suspected fraud;",
              "security threats;",
              "unlawful activity;",
              "material marketplace abuse;",
              "failure to satisfy required verification;",
              "legal or regulatory requirements.",
            ],
          },
          { kind: "p", text: "Where reasonably practicable and legally appropriate, BirichiNex may provide notice or an opportunity to resolve the issue." },
        ],
      },
      {
        heading: "11. Service Availability",
        blocks: [
          { kind: "p", text: "BirichiNex aims to provide reliable services but cannot guarantee that every service will operate continuously or without interruption." },
          { kind: "p", text: "Maintenance, technical problems, third-party infrastructure, security requirements, updates and circumstances outside reasonable control may occasionally affect availability." },
        ],
      },
      {
        heading: "12. Limitation of Liability",
        blocks: [
          { kind: "p", text: "Nothing in these Terms excludes or restricts rights or liabilities that cannot lawfully be excluded under applicable law." },
          { kind: "p", text: "To the extent permitted by law, BirichiNex is not responsible for losses resulting solely from a user's business decisions, inaccurate information supplied by users or sellers, unauthorized account use caused by the user's failure to protect credentials, or matters outside BirichiNex's reasonable control." },
          { kind: "p", text: "Any further limitation of liability should remain subject to applicable Kenyan consumer and commercial law." },
        ],
      },
      {
        heading: "13. Governing Law",
        blocks: [
          { kind: "p", text: "These Terms are governed by the laws of Kenya unless mandatory applicable law requires otherwise." },
          { kind: "p", text: "Users and BirichiNex should first attempt in good faith to resolve disputes through the platform's support/dispute-resolution process." },
          { kind: "p", text: "Nothing in these Terms removes any statutory rights or remedies available under applicable law." },
        ],
      },
      {
        heading: "14. Changes to These Terms",
        blocks: [
          { kind: "p", text: "BirichiNex may update these Terms as the platform, services or legal requirements evolve." },
          { kind: "p", text: "Material changes will be communicated through appropriate platform channels where required." },
          { kind: "p", text: "The current version and effective date will remain available on this page." },
        ],
      },
      {
        heading: "15. Contact",
        blocks: [
          { kind: "p", text: "Questions concerning these Terms may be directed through the official BirichiNex Contact page." },
        ],
      },
    ],
  },

  privacy: {
    id: "privacy",
    route: "legal:privacy",
    title: "Privacy Policy",
    kicker: "Privacy Policy",
    summary:
      "How BirichiNex collects, uses, shares and protects personal information, and the rights individuals may have.",
    effective: "30 August 2026",
    updated: "30 August 2026",
    sections: [
      {
        heading: "1. Who We Are",
        blocks: [
          { kind: "p", text: "BirichiNex Technologies Limited operates the BirichiNex platform." },
          { kind: "p", text: "We are committed to handling personal information responsibly, transparently and in accordance with applicable data-protection requirements." },
        ],
      },
      {
        heading: "2. Information We May Collect",
        blocks: [
          { kind: "p", text: "Depending on how a user interacts with BirichiNex, information may include:" },
          {
            kind: "ul",
            items: [
              "name and contact details;",
              "account information;",
              "business and organization information;",
              "seller information;",
              "verification information where required;",
              "marketplace and transaction information;",
              "product and inventory information;",
              "CRM information entered by authorized business users;",
              "communications with BirichiNex;",
              "information submitted to BNX AI or Amani;",
              "device, browser and security information;",
              "platform usage and analytics information;",
              "payment-related transaction information provided by payment partners;",
              "support and complaint information.",
            ],
          },
          { kind: "p", text: "We should collect only information reasonably necessary for legitimate and disclosed purposes." },
        ],
      },
      {
        heading: "3. Why We Process Information",
        blocks: [
          { kind: "p", text: "Information may be processed to:" },
          {
            kind: "ul",
            items: [
              "create and manage accounts;",
              "provide BirichiNex services;",
              "operate marketplace transactions;",
              "provide business-management tools;",
              "enable seller and business functionality;",
              "provide BNX AI and Amani services;",
              "personalize relevant platform experiences;",
              "provide customer support;",
              "detect fraud and protect platform security;",
              "process or facilitate payments;",
              "provide analytics and business insights;",
              "improve platform functionality;",
              "communicate important service information;",
              "comply with applicable legal and regulatory requirements.",
            ],
          },
        ],
      },
      {
        heading: "4. Business and Marketplace Data",
        blocks: [
          { kind: "p", text: "Business users may enter information concerning customers, suppliers, inventory, transactions or other business operations." },
          { kind: "p", text: "Business users are responsible for ensuring that they have an appropriate legal basis or authorization to provide personal information concerning other individuals to BirichiNex." },
        ],
      },
      {
        heading: "5. BNX AI and Amani Data",
        blocks: [
          { kind: "p", text: "Information submitted to BNX AI may be processed to understand the user's business context, generate assessments, recommendations, priorities, action plans and related guidance." },
          { kind: "p", text: "Information processed through Amani may be used to provide activated communication, sales-support, customer-service or operational functionality." },
          { kind: "p", text: "Where future Amani functionality involves voice calls, recording or transcription, appropriate disclosures, permissions and consent mechanisms should be implemented before such functionality is activated where required by law." },
        ],
      },
      {
        heading: "6. Sharing Information",
        blocks: [
          { kind: "p", text: "BirichiNex may share information where reasonably necessary with authorized service providers supporting services such as:" },
          {
            kind: "ul",
            items: [
              "cloud hosting and infrastructure;",
              "payment processing;",
              "communications;",
              "analytics;",
              "security;",
              "customer support;",
              "logistics;",
              "technical infrastructure.",
            ],
          },
          { kind: "p", text: "BirichiNex may also disclose information where required by law, court order or a competent regulatory authority." },
          { kind: "p", text: "We do not treat personal information as a product for unauthorized sale." },
        ],
      },
      {
        heading: "7. Data Retention",
        blocks: [
          { kind: "p", text: "Personal information should be retained only for as long as reasonably necessary for the purposes for which it was collected, including providing services, maintaining legitimate business records, resolving disputes, protecting security and satisfying legal obligations." },
          { kind: "p", text: "Retention periods may differ depending on the category of information and applicable requirements." },
        ],
      },
      {
        heading: "8. Security",
        blocks: [
          { kind: "p", text: "BirichiNex will maintain reasonable technical and organizational safeguards appropriate to the nature of the information processed." },
          { kind: "p", text: "No online system can guarantee absolute security, and users also have responsibility for protecting their account credentials and devices." },
        ],
      },
      {
        heading: "9. Cookies and Analytics",
        blocks: [
          { kind: "p", text: "BirichiNex may use cookies and similar technologies for essential platform functionality, preferences, security and analytics." },
          { kind: "p", text: "Non-essential technologies should be used consistently with applicable consent requirements." },
          { kind: "p", text: "More information is available in the Cookie Policy." },
        ],
      },
      {
        heading: "10. Data-Protection Rights",
        blocks: [
          { kind: "p", text: "Subject to applicable law, individuals may have rights concerning their personal information, including rights to:" },
          {
            kind: "ul",
            items: [
              "be informed about its use;",
              "request access;",
              "request correction;",
              "object to certain processing;",
              "request deletion where applicable;",
              "exercise other applicable statutory data-protection rights.",
            ],
          },
          { kind: "p", text: "Requests may be submitted through BirichiNex's designated Privacy/Data Request contact route." },
        ],
      },
      {
        heading: "11. International Processing",
        blocks: [
          { kind: "p", text: "Some technology or service providers may process information outside Kenya." },
          { kind: "p", text: "Where personal data is transferred internationally, BirichiNex should implement safeguards required by applicable data-protection law." },
        ],
      },
      {
        heading: "12. Changes",
        blocks: [
          { kind: "p", text: "This Privacy Policy may be updated as BirichiNex services, technologies and legal requirements evolve." },
          { kind: "p", text: "The current version and effective date will be published on this page." },
        ],
      },
      {
        heading: "13. Privacy Contact",
        blocks: [
          { kind: "p", text: "Privacy and data-protection requests should be submitted through the designated Privacy/Data Requests contact route." },
        ],
      },
    ],
  },

  cookies: {
    id: "cookies",
    route: "legal:cookies",
    title: "Cookie Policy",
    kicker: "Cookie Policy",
    summary:
      "How BirichiNex uses cookies and similar technologies to operate, secure and improve the platform.",
    effective: "30 August 2026",
    updated: "30 August 2026",
    sections: [
      {
        heading: "Essential Cookies",
        blocks: [
          { kind: "p", text: "These are necessary for functions such as account login, authentication, security, session management and core platform operation." },
        ],
      },
      {
        heading: "Preference Cookies",
        blocks: [
          { kind: "p", text: "These may remember user selections such as language, display preferences or other platform settings." },
        ],
      },
      {
        heading: "Analytics Cookies",
        blocks: [
          { kind: "p", text: "Where enabled, analytics technologies help BirichiNex understand how visitors use the platform, including pages visited, feature usage, traffic sources, device categories and conversion journeys." },
          { kind: "p", text: "Analytics should be configured in a privacy-conscious manner." },
        ],
      },
      {
        heading: "Marketing Cookies",
        blocks: [
          { kind: "p", text: "Marketing or advertising cookies should only be listed and activated if BirichiNex actually uses them." },
        ],
      },
      {
        heading: "Cookie Controls",
        blocks: [
          { kind: "p", text: "Where consent is required for non-essential cookies, users should be provided with appropriate controls to accept or manage those cookies." },
          { kind: "p", text: "The cookie banner and this policy must reflect the technologies actually installed on BirichiNex." },
        ],
      },
    ],
  },

  ai: {
    id: "ai",
    route: "legal:ai",
    title: "AI Terms & Responsible Use",
    kicker: "AI Terms & Responsible Use",
    summary:
      "How BirichiNex's AI services — BNX AI and Amani — may be used, and the responsibilities that come with them.",
    effective: "30 August 2026",
    updated: "30 August 2026",
    sections: [
      {
        heading: "BNX AI",
        blocks: [
          { kind: "p", text: "BNX AI is BirichiNex's business-intelligence and advisory layer." },
          { kind: "p", text: "Depending on available functionality, it may support:" },
          { kind: "p", text: "Discovery → Founder Profile → Business Profile → Business Health → Priorities → Action Plan → Continuous Guidance" },
        ],
      },
      {
        heading: "Amani",
        blocks: [
          { kind: "p", text: "Amani is designed as an operational and customer-facing AI capability." },
          { kind: "p", text: "Where activated, Amani may support areas such as sales assistance, customer communication, follow-up and other approved operational workflows." },
        ],
      },
      {
        heading: "Important AI Limitations",
        blocks: [
          { kind: "p", text: "Artificial intelligence can make mistakes." },
          { kind: "p", text: "AI-generated information may be inaccurate, incomplete, outdated or inappropriate for a user's specific circumstances." },
          { kind: "p", text: "Users should review important AI outputs before relying on them." },
        ],
      },
      {
        heading: "Professional Advice",
        blocks: [
          { kind: "p", text: "BirichiNex AI services do not replace qualified legal, financial, tax, accounting, medical, investment or other regulated professional advice." },
          { kind: "p", text: "Users remain responsible for important business and professional decisions." },
        ],
      },
      {
        heading: "Information Submitted to AI",
        blocks: [
          { kind: "p", text: "Users should submit only information they are legally authorized to provide." },
          { kind: "p", text: "Users should avoid unnecessarily submitting highly sensitive personal or confidential information." },
        ],
      },
      {
        heading: "Automated Communications",
        blocks: [
          { kind: "p", text: "Where Amani or another BirichiNex AI service communicates externally on behalf of a business, users remain responsible for configuring and supervising its authorized use." },
        ],
      },
      {
        heading: "Calls, Recordings and Transcriptions",
        blocks: [
          { kind: "p", text: "Where AI functionality involves calls, recording, transcription or similar processing, BirichiNex and the relevant business user must comply with applicable notice, consent, privacy and communications requirements." },
          { kind: "p", text: "Such functionality should not be activated without appropriate technical and compliance safeguards." },
        ],
      },
      {
        heading: "Responsible Use",
        blocks: [
          { kind: "p", text: "BirichiNex AI must not be used for fraud, impersonation, unlawful discrimination, harassment, malicious activity, unauthorized surveillance, deceptive practices or other unlawful purposes." },
          { kind: "p", text: "BirichiNex may restrict access to AI services where misuse threatens users, third parties or the platform." },
        ],
      },
    ],
  },

  seller: {
    id: "seller",
    route: "legal:seller",
    title: "Seller Terms",
    kicker: "Seller Terms",
    summary:
      "The commitments that apply to businesses that sell through the BirichiNex marketplace.",
    effective: "30 August 2026",
    updated: "30 August 2026",
    sections: [
      {
        heading: "Seller Onboarding",
        blocks: [
          { kind: "p", text: "Businesses wishing to sell through BirichiNex may be required to complete business and seller verification." },
          { kind: "p", text: "Approval to access seller functionality does not guarantee permanent marketplace access." },
        ],
      },
      {
        heading: "Product Listings",
        blocks: [
          { kind: "p", text: "Sellers are responsible for ensuring that product listings are accurate, lawful and not misleading." },
          { kind: "p", text: "Listings should accurately describe:" },
          {
            kind: "ul",
            items: [
              "product identity;",
              "condition;",
              "relevant specifications;",
              "price;",
              "available quantity;",
              "material limitations;",
              "delivery information where applicable.",
            ],
          },
        ],
      },
      {
        heading: "Authenticity",
        blocks: [
          { kind: "p", text: "Counterfeit, stolen, fraudulent or unlawfully sourced products are prohibited." },
          { kind: "p", text: "Sellers must have the legal right to sell the products they list." },
        ],
      },
      {
        heading: "Pricing",
        blocks: [
          { kind: "p", text: "Sellers are responsible for accurate pricing." },
          { kind: "p", text: "Prices and mandatory charges should be communicated clearly before a buyer confirms an order." },
        ],
      },
      {
        heading: "Inventory",
        blocks: [
          { kind: "p", text: "Sellers must make reasonable efforts to keep inventory information current and should not knowingly offer unavailable stock as available." },
        ],
      },
      {
        heading: "Orders",
        blocks: [
          { kind: "p", text: "Sellers are responsible for processing accepted orders within the requirements communicated for the relevant marketplace service." },
        ],
      },
      {
        heading: "Fulfilment",
        blocks: [
          { kind: "p", text: "Depending on the arrangement, orders may be:" },
          {
            kind: "ul",
            items: [
              "seller fulfilled;",
              "fulfilled through an approved BirichiNex arrangement; or",
              "fulfilled through a logistics partner.",
            ],
          },
          { kind: "p", text: "The applicable fulfilment model should be identified where appropriate." },
        ],
      },
      {
        heading: "Fees and Commissions",
        blocks: [
          { kind: "p", text: "Applicable seller fees or commissions will be communicated through the seller agreement, pricing page or onboarding process before they apply." },
          { kind: "p", text: "No uncommunicated fee should be imposed retroactively." },
        ],
      },
      {
        heading: "Customer Service",
        blocks: [
          { kind: "p", text: "Sellers must cooperate reasonably in addressing customer questions, complaints, delivery problems and legitimate return/refund requests." },
        ],
      },
      {
        heading: "Returns",
        blocks: [
          { kind: "p", text: "Sellers must comply with the applicable return/refund conditions presented to the customer and with mandatory consumer rights under applicable law." },
        ],
      },
      {
        heading: "Prohibited Products",
        blocks: [
          { kind: "p", text: "BirichiNex may prohibit products that are illegal, unsafe, counterfeit, fraudulent, infringing, restricted by platform policy or otherwise inappropriate for the marketplace." },
        ],
      },
      {
        heading: "Seller Performance",
        blocks: [
          { kind: "p", text: "BirichiNex may monitor legitimate marketplace-performance indicators such as order fulfilment, cancellations, complaints, listing accuracy and policy compliance." },
        ],
      },
      {
        heading: "Suspension or Removal",
        blocks: [
          { kind: "p", text: "Seller access or individual listings may be restricted or removed for serious or repeated policy violations, fraud, security concerns, unlawful activity or material customer harm." },
        ],
      },
      {
        heading: "Disputes",
        blocks: [
          { kind: "p", text: "Sellers should first use the BirichiNex dispute/support process." },
          { kind: "p", text: "Nothing in these Seller Terms removes legal rights available under applicable law." },
        ],
      },
    ],
  },

  marketplace: {
    id: "marketplace",
    route: "legal:marketplace",
    title: "Marketplace Terms",
    kicker: "Marketplace Terms",
    summary:
      "The terms that apply when buyers discover and purchase eligible products from participating businesses.",
    effective: "30 August 2026",
    updated: "30 August 2026",
    sections: [
      {
        heading: "Who Is Selling?",
        blocks: [
          { kind: "p", text: "BirichiNex provides digital infrastructure through which buyers may discover and purchase eligible products from participating businesses." },
          { kind: "p", text: "The relevant product/order information should identify the seller." },
          { kind: "p", text: "Where an independent business is identified as seller, that business is responsible for the products it sells and its applicable seller obligations." },
          { kind: "p", text: "Where BirichiNex Technologies Limited or another identified BirichiNex entity is the seller, this will be stated" },
        ],
      },
    ],
  },
};

export const LEGAL_NAV_ORDER = [
  LEGAL_PAGES.terms,
  LEGAL_PAGES.privacy,
  LEGAL_PAGES.cookies,
  LEGAL_PAGES.ai,
  LEGAL_PAGES.seller,
  LEGAL_PAGES.marketplace,
];