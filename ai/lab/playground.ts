/**
 * BirichiNex AI Lab — terminal playground.
 *
 * Test the AI engines locally without the UI:
 *   - `npm run ai:lab`            start interactive lab (copilot mode)
 *   - `:advisor <question>`       ask the AI Advisor (local engine)
 *   - `:search <query>`           search the knowledge base
 *   - `:mode copilot|advisor`     switch the default mode
 *   - `:quit` / Ctrl+C            exit
 *
 * Every question you type is routed through the SAME code the app uses
 * (ai/src/*), so a tweak in the AI Center is instantly testable here.
 */
import * as readline from "node:readline";
import { fileURLToPath } from "node:url";
import { respondToQuery, viewChips, CopilotContext } from "../src/knowledge";
import { chatWithAI, configureAI } from "../src/api-client";
import { searchKnowledge } from "../src/knowledge-base";
import { buildSystemPrompt } from "../src/prompt-builder";

// ── Sample business context (like a live founder) ─────────────────────────────

const sampleAudit = {
  scores: {
    founderReadiness: 72,
    businessMaturity: 58,
    growthReadiness: 66,
    digitalReadiness: 74,
    marketplaceReadiness: 61,
    businessHealth: 66,
  },
  businessProfile: {
    name: "Neema Boutique",
    industry: "Fashion retail",
    stage: "Growth",
  },
  strengths: [],
  gaps: [],
  actionPlan: [],
  answers: {},
  createdAt: new Date().toISOString(),
} as unknown as CopilotContext["audit"];

const copilotCtx: CopilotContext = {
  currentView: "dashboard",
  userName: "Neema",
  businessName: "Neema Boutique",
  audit: sampleAudit,
  contactsCount: 12,
  revenue: 1850000,
  inventoryCount: 40,
  agentCalls: 5,
  activeCourses: 2,
  currency: "TZS",
  hasSubscription: true,
  trackedItems: [
    {
      kind: "order",
      trackingNumber: "PM-KE-2026-003",
      status: "out_for_delivery",
      title: "Wholesale Bale 45kg",
      originCity: "Mombasa",
      destinationCity: "Nairobi",
      carrier: "PortMetrics Express",
      estimatedDelivery: "2026-07-21T12:00:00Z",
    },
  ],
};

const advisorContext = {
  userData: {
    userName: "Neema",
    membershipTier: "Gold",
    loyaltyTier: "Gold",
    loyaltyPoints: 2400,
    inventoryCount: 40,
    transactionCount: 86,
    contactCount: 12,
    cartCount: 3,
    currency: "TZS",
    businessName: "Neema Boutique",
    industry: "Fashion retail",
    growthStage: "Growth",
    businessHealth: 66,
    founderReadiness: 72,
    businessMaturity: 58,
    growthReadiness: 66,
    digitalReadiness: 74,
    marketplaceReadiness: 61,
  },
  conversationHistory: [],
  currentPage: "dashboard",
};

// ── Lab ───────────────────────────────────────────────────────────────────────

type Mode = "copilot" | "advisor";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let mode: Mode = "copilot";

function banner() {
  console.log("");
  console.log("  ┌────────────────────────────────────────────────┐");
  console.log("  │          BirichiNex AI LAB (ai/lab)            │");
  console.log("  └────────────────────────────────────────────────┘");
  console.log("  type a question, or use a command:");
  console.log("    :advisor <question>   ask the AI Advisor");
  console.log("    :search <query>       search the knowledge base");
  console.log("    :mode copilot|advisor switch default mode");
  console.log("    :quit                 exit");
  console.log("");
}

function handleCopilot(input: string) {
  const reply = respondToQuery(input, copilotCtx);
  console.log(`\n  🤖 Copilot: ${reply.text}`);
  if (reply.actions?.length) {
    console.log(`     actions: ${reply.actions.map((a) => `[${a.label} → ${a.view}]`).join("  ")}`);
  }
}

async function handleAdvisor(input: string) {
  console.log("\n  ⏳ Advisor is thinking (local engine)…");
  try {
    const reply = await chatWithAI(input, advisorContext);
    console.log(`\n  🧠 Advisor (${reply.intent}, ${Math.round(reply.confidence * 100)}%):\n`);
    console.log(reply.content);
    if (reply.suggestedFollowUps.length) {
      console.log(`\n     follow-ups: ${reply.suggestedFollowUps.join(" | ")}`);
    }
  } catch (err) {
    console.log("\n  ⚠️  Advisor error:", (err as Error).message);
  }
}

function handleSearch(query: string) {
  const results = searchKnowledge(query, 5);
  if (results.length === 0) {
    console.log("\n  🔎 No knowledge entries matched.");
    return;
  }
  console.log(`\n  🔎 Top ${results.length} matches for "${query}":\n`);
  results.forEach((r, i) => {
    console.log(`   ${i + 1}. [${r.category}] ${r.topic} — ${r.subtopic}`);
    console.log(`      ${r.content.slice(0, 140)}…`);
  });
}

function prompt() {
  rl.question(
    mode === "copilot" ? "\n  💬 you > " : "\n  💬 you (advisor) > ",
    async (raw) => {
      const input = raw.trim();
      if (!input) return prompt();

      if (input === ":quit" || input === "exit" || input === "quit") {
        console.log("\n  👋 Kwaheri!\n");
        rl.close();
        return;
      }
      if (input === ":mode copilot") {
        mode = "copilot";
        console.log("  → copilot mode");
        return prompt();
      }
      if (input === ":mode advisor") {
        mode = "advisor";
        console.log("  → advisor mode");
        return prompt();
      }
      if (input.startsWith(":advisor ")) {
        await handleAdvisor(input.slice(9));
        return prompt();
      }
      if (input.startsWith(":search ")) {
        handleSearch(input.slice(8));
        return prompt();
      }

      if (mode === "advisor") {
        await handleAdvisor(input);
      } else {
        handleCopilot(input);
      }
      return prompt();
    },
  );
}

// If running directly (not imported), start the lab.
const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  configureAI({ provider: "local" });
  banner();
  console.log(`  Mode: ${mode}  ·  Chips: ${viewChips("dashboard").slice(0, 3).join(" / ")}`);
  console.log("  Advisor system prompt preview:");
  console.log(buildSystemPrompt(advisorContext).split("\n").slice(0, 3).join("\n"));
  prompt();
}
