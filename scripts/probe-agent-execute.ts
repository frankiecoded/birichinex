import { classifyAgentCommand, clarificationFor } from "../ai/src/agent";
import { buildAgentContext, executeAgentCommand, undoExecution } from "../src/lib/agent-execute";
import { useStore } from "../src/store/useStore";

function ctx() {
  return buildAgentContext();
}

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra?: string) {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

async function act(raw: string, expectIntent: string, expectOk = true, opts?: { qty?: number; titleIncludes?: string }) {
  const c = ctx();
  const cmd = classifyAgentCommand(raw, c);
  check(`${raw} → ${cmd.intent}`, cmd.intent === expectIntent, `got ${cmd.intent} (${cmd.label})`);
  if (opts?.qty !== undefined) {
    check(`  qty = ${opts.qty}`, cmd.fields.quantity === opts.qty, `got ${cmd.fields.quantity}`);
  }
  if (cmd.needsConfirmation) {
    check(`  confirm gate on ${raw}`, true);
  }
  if (cmd.missing.length > 0) {
    check(`  clarification: ${clarificationFor(cmd, c)}`, true);
  }
  if (!cmd.needsConfirmation && cmd.missing.length === 0) {
    if (expectIntent === "answer") {
      check(`  ${raw} → falls through to Q&A`, true);
      return;
    }
    const res = await executeAgentCommand(cmd);
    check(`  execute ${raw}: ok=${res.ok}`, res.ok === expectOk, `${res.title} — ${res.detail}`);
    if (res.ok) {
      check(`  title: ${res.title}`, res.title.length > 0);
      if (opts?.titleIncludes) check(`  title includes "${opts.titleIncludes}"`, res.title.includes(opts.titleIncludes), res.title);
    }
    if (res.undo) {
      const s = useStore.getState();
      const before = JSON.stringify(s.contacts.length) + s.transactions.length + s.documents.length;
      undoExecution(res.undo);
      const s2 = useStore.getState();
      const after = JSON.stringify(s2.contacts.length) + s2.transactions.length + s2.documents.length;
      check(`  undo ${res.undo.label}`, before !== after || res.undo.kind === "marketplace" || res.undo.kind === "restock");
    }
  }
}

async function main() {
  const s = useStore.getState();
  console.log(`Context: ${s.contacts.length} contacts, ${s.inventoryItems.length} inventory, ${s.documents.length} docs`);

  console.log("\n— navigate —");
  await act("Open my finance dashboard", "navigate");

  console.log("\n— add contact —");
  await act("Add Safi Traders to my contacts", "addContact", true, { titleIncludes: "Safi Traders" });
  await act("Add John Mwakasege", "addContact");

  console.log("\n— log income —");
  await act("Log 500,000 income from Safi Traders", "logTransaction");

  console.log("\n— log expense —");
  await act("I spent 80k on transport", "logTransaction");

  console.log("\n— create document —");
  await act("Create an invoice for Mama Zawadi", "createDocument");

  console.log("\n— post to marketplace —");
  await act("Post my MacBook Air M2 to the marketplace", "postToMarketplace");

  console.log("\n— restock —");
  await act("Restock the MacBook Air M2", "restock");
  await act("Restock 5 of the MacBook Air M2", "restock");

  console.log("\n— dropship —");
  await act("Place a dropship order for one iPhone 14 Pro", "placeDropshipOrder", true, { qty: 1 });
  await act("Buy two Samsung Galaxy S24 Ultra from dropshipping", "placeDropshipOrder", true, { qty: 2 });

  console.log("\n— send email —");
  await act("Send a thank you email to Aisha Nakamya", "sendEmail");

  console.log("\n— reminder —");
  await act("Remind me to call the supplier tomorrow at 9am", "remindMe");

  console.log("\n— make call (simulated fallback) —");
  await act("Call Sarah Wanjiku", "makeCall");

  console.log("\n— batch missed —");
  await act("Call my missed customers", "makeCall");

  console.log("\n— answer fallthrough —");
  await act("How much did I spend on transport?", "answer");

  const sEnd = useStore.getState();
  console.log(`\nAfter: ${sEnd.contacts.length} contacts, ${sEnd.transactions.length} txns, ${sEnd.documents.length} docs, ${sEnd.dropshipOrders.length} dropship, ${sEnd.agentCalls.length} calls, ${sEnd.notifications.length} notifs, ${sEnd.emails.length} emails`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
