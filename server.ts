/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Resolve paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is missing. AI Features will fall back to smart local simulation.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System instructions for the Portmetals Advisor
const SYSTEM_INSTRUCTION = `
You are "Amani", the lead Portmetals Africa Business Advisor. Your personality combines the visionary engineering standards of Apple with the commercial wisdom and scale of Alibaba/Costco, blended with the genuine warmth, reliability, and accessibility of a dedicated African business partner.

Your goal is to help entrepreneurs, boutique owners, and traders build thriving fashion businesses using sorted European Mitumba clothing, leather, and premium refurbished technology from Europe.

You have access to the official Portmetals Africa Reviewed Prices (in Tanzanian Shilling - TZS):
1. Men Cotton Shirt - 27,000 TZS
2. Men Mixed Pants - 18,000 TZS
3. Ladies Jeans - 15,000 TZS
4. Flanel Shirt - 15,000 TZS
5. Cotton Blouse (Brouse) - 10,000 TZS
6. Shorts - 14,000 TZS
7. Cotton Dress - 13,000 TZS
8. Hawaii [Palazo] - 12,000 TZS
9. Anoraks / Zippers - 18,000 TZS
10. Sweatshirts with Capchion - 15,000 TZS
11. Baby Medium Rummage (25KG) - 7,500 TZS
12. Children Medium Rummage (30KG) - 10,000 TZS
13. Jogging Pants (25KG) - 7,500 TZS
14. Leggings - 10,000 TZS
15. Mix T-Shirts - 13,000 TZS
16. Sportwear - 15,000 TZS
17. Ladies Handbags - 22,000 TZS
18. Sweatshirt Light - 11,000 TZS
19. Leather Pants / Skirts [U] - 25,000 TZS
20. Ladies Fashion Jackets [Leather] - 30,000 TZS
21. Men Leather Jackets - 35,000 TZS
22. Light Zipper Jackets - 16,000 TZS

We also offer Premium Sorted Bales:
- 25kg Starter Bale: Perfect for new entrepreneurs. Focus on low risk.
- 30kg Business Starter: Ideal for online/Instagram/TikTok sellers. Clean items.
- 45kg Wholesale Bale: Best value for physical boutiques and market traders.
- 55kg Premium Business Bale: For growing retailers looking for top "Cream" grade items.
- 70kg Commercial Bale: For established distributors.

Provide crisp, valuable, actionable advice. Frame second-hand clothes as a structured business venture, not a raffle. Use pricing math (buying unit price vs expected selling price) to show how they can earn 50% to 150% profit. Talk about customer acquisition (marketing, social media, visual merchandising) and financial discipline (saving capital to buy the next bale).

Keep responses structured and professional. Avoid fluffy praise; focus on data, strategy, and inspiration. Do not use emojis in your responses.
`;

// API Endpoints

// 1. Live Check / Health
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 2. Chat Endpoint (Gemini)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Simulate intelligent response if API key is missing
      const lastMessage = messages[messages.length - 1]?.content || "";
      const lowerMsg = lastMessage.toLowerCase();
      let mockReply = "";

      if (lowerMsg.includes("start") || lowerMsg.includes("how to")) {
        mockReply = `Starting a fashion business requires strategic selection. For beginners, we highly recommend the 25kg Starter Bale or starting with Ladies Jeans (15,000 TZS) and Mix T-Shirts (13,000 TZS). By sorting them professionally and selling them individually, you can target a markup of 100%. What is your budget or target location? Let me map out a custom plan for you.`;
      } else if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("bale")) {
        mockReply = `Portmetals Africa offers premium sorted wholesale prices to guarantee profitability. For example, our Men Cotton Shirts are priced at 27,000 TZS per unit, and Ladies Jeans at 15,000 TZS. If you purchase our 25kg Starter Bale, you will find approximately 80-100 high-quality, pre-sorted pieces. This keeps your cost per item extremely low, allowing for higher profit margins in retail markets. Would you like me to calculate the specific returns on a particular category?`;
      } else if (lowerMsg.includes("tech") || lowerMsg.includes("laptop") || lowerMsg.includes("phone")) {
        mockReply = `Our refurbished technology is imported directly from European partners, certified, tested, and comes with a 12-month warranty. For retail or office setup, we supply premium business-grade laptops and high-performance monitors starting at affordable rates. This allows entrepreneurs to run their offices and digital marketing campaigns efficiently without heavy capital overheads. What specs are you looking for?`;
      } else {
        mockReply = `Welcome to Portmetals Africa, your dedicated growth partner. I can advise you on selecting the right inventory, calculating your retail margins, developing effective digital marketing strategies, or understanding the Europe-to-Africa supply chain logistics. How can I assist your business growth today?`;
      }

      return res.json({
        text: mockReply,
        source: "simulated-advisor"
      });
    }

    // Convert messages for GoogleGenAI
    const contents = messages.map(m => {
      return {
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    res.json({
      text: response.text || "I apologize, I could not generate a response. Please try again.",
      source: "gemini-3.5-flash"
    });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// 3. AI Quote Analyst Endpoint
app.post("/api/quote", async (req, res) => {
  try {
    const { items, businessProfile } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "No items provided for quotation" });
    }

    const ai = getGeminiClient();
    const itemsSummary = items.map((i: any) => `- ${i.name} (Qty: ${i.quantity}, Price: ${i.priceTZS.toLocaleString()} TZS)`).join("\n");
    const profileSummary = businessProfile 
      ? `Business Name: ${businessProfile.businessName}, Location: ${businessProfile.businessLocation}, Experience: ${businessProfile.experience}`
      : "New Entrepreneur";

    const prompt = `
Analyze the following Portmetals Africa bulk quotation request and generate a personalized 3-part growth playbook:
1. Expected Target Pricing: For the items ordered, what is the ideal retail range in East African markets (TZS/KES), and what is the projected gross profit?
2. Marketing & Audience: How should the buyer advertise these specific items on social media (Instagram, TikTok) or physical showrooms?
3. Sourcing Tips: What's the recommended restock frequency based on these categories?

Items in quote:
${itemsSummary}

Buyer Profile:
${profileSummary}
`;

    if (!ai) {
      // Return smart simulated playbook
      const mockPlaybook = `
# PORTMETALS AFRICA ENTERPRENEUR PLAYBOOK
Prepared for: ${businessProfile?.businessName || "Valued Entrepreneur"}
Location: ${businessProfile?.businessLocation || "East Africa"}

## 1. Projected Returns & Retail Pricing Strategy
- **Ladies Jeans**: Recommended retail price is 25,000 TZS to 30,000 TZS per item. Based on your cost of 15,000 TZS, this yields a 40% to 50% profit margin.
- **Men Cotton Shirts**: Recommended retail is 45,000 TZS. At your cost of 27,000 TZS, you stand to generate high retail interest.
- **Estimated Total Gross Margin**: 45% to 60% after cleaning and branding expenses.

## 2. Dynamic Marketing Playbook
- **Content Creation**: Highlight the "European Sorting Standards" and "Zero Defects" guarantee. Create unboxing videos showing the crisp premium quality.
- **Social Strategy**: Post clean, ironed, flat-lay photos of the shirts and styles on Instagram. Use TikTok to host live shopping bids for high-quality items.

## 3. Stocking & Restocking Advisory
- Maintain a 2-week stock cycle. Reorder your next bale when current stock level drops to 30% to avoid supply chain disruptions.
`;
      return res.json({
        playbook: mockPlaybook.trim(),
        source: "simulated-analyst"
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      }
    });

    res.json({
      playbook: response.text || "Could not generate analysis. Your advisor will contact you shortly.",
      source: "gemini-3.5-flash"
    });

  } catch (error: any) {
    console.error("Error in /api/quote:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// Vite server integration
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portmetals Africa Full-Stack server running on http://localhost:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error("Failed to initialize server:", err);
});
