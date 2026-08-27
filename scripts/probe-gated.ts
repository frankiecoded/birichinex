import { classifyAgentCommand } from "../ai/src/agent";
import { buildAgentContext, executeAgentCommand } from "../src/lib/agent-execute";
import { useStore } from "../src/store/useStore";

async function main() {
  const ctx = buildAgentContext();
  const s = useStore.getState();
  const beforeCalls = s.agentCalls.length;
  const beforeDrops = s.dropshipOrders.length;
  const beforeTx = s.transactions.length;

  for (const raw of [
    "Log 500,000 income from Safi Traders",
    "I spent 80k on transport",
    "Place a dropship order for one iPhone 14 Pro",
    "Call Sarah Wanjiku",
    "Call my missed customers",
  ]) {
    const cmd = classifyAgentCommand(raw, ctx);
    console.log(`${raw} → ${cmd.intent} (confirm=${cmd.needsConfirmation}, missing=${cmd.missing.join(",") || "none"})`);
    const res = await executeAgentCommand(cmd);
    console.log(`   → ${res.ok ? "OK" : "ERR"}: ${res.title}`);
  }

  const s2 = useStore.getState();
  console.log(`\nagentCalls +${s2.agentCalls.length - beforeCalls}, dropshipOrders +${s2.dropshipOrders.length - beforeDrops}, transactions +${s2.transactions.length - beforeTx}`);
  console.log(`sample call: ${s2.agentCalls[0]?.customerName} → ${s2.agentCalls[0]?.outcome}`);
  console.log(`sample drop: ${s2.dropshipOrders[0]?.productName} ×${s2.dropshipOrders[0]?.quantity} = ${s2.dropshipOrders[0]?.total.amount} TZS`);
}

main();
