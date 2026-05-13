import type { MandateEngineConfig } from "./types.js";

export type ApprovalMessage = {
  agentName: string;
  amountCents: number;
  merchant: string;
  intent: string;
  sourceContext: string | null;
  cardKind: "single_use" | "subscription_lock";
  subscriptionPeriodDays?: number;
  approveUrl: string;
  denyUrl: string;
  token: string;
};

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function describeCard(m: ApprovalMessage): string {
  if (m.cardKind === "subscription_lock") {
    return `subscription_lock (merchant-locked + expires in ${m.subscriptionPeriodDays ?? 30}d)`;
  }
  return "single_use (per-authorization card)";
}

export async function sendSlackApproval(webhookUrl: string, m: ApprovalMessage): Promise<boolean> {
  try {
    const text =
      `*Mandate approval requested*\n` +
      `> Agent: ${m.agentName}\n` +
      `> Amount: ${formatUsd(m.amountCents)} to *${m.merchant}*\n` +
      `> Intent: ${m.intent}\n` +
      (m.sourceContext ? `> Source: ${m.sourceContext}\n` : "") +
      `> Card: ${describeCard(m)}`;
    const blocks = [
      { type: "section", text: { type: "mrkdwn", text } },
      {
        type: "actions",
        elements: [
          { type: "button", style: "primary", text: { type: "plain_text", text: "Approve" }, url: m.approveUrl },
          { type: "button", style: "danger", text: { type: "plain_text", text: "Deny" }, url: m.denyUrl },
        ],
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `Token: \`${m.token}\` — link expires when the request times out.` }],
      },
    ];
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, blocks }),
    });
    if (!res.ok) {
      console.error("[mandate-engine] slack webhook non-2xx", res.status, await safeText(res));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[mandate-engine] slack webhook error", e instanceof Error ? e.message : e);
    return false;
  }
}

export async function sendWhatsappApproval(cfg: MandateEngineConfig, toE164: string, m: ApprovalMessage): Promise<boolean> {
  const sid = cfg.twilioAccountSid ?? "";
  const token = cfg.twilioAuthToken ?? "";
  const from = cfg.twilioWhatsappFrom ?? "";
  if (!sid || !token || !from) {
    console.error("[mandate-engine] twilio config missing; skipping whatsapp send");
    return false;
  }
  try {
    const body =
      `Mandate approval requested\n` +
      `Agent: ${m.agentName}\n` +
      `Amount: ${formatUsd(m.amountCents)} to ${m.merchant}\n` +
      `Intent: ${m.intent}\n` +
      (m.sourceContext ? `Source: ${m.sourceContext}\n` : "") +
      `Card: ${describeCard(m)}\n\n` +
      `Reply YES ${m.token} to approve or NO ${m.token} to deny.\n` +
      `Or tap: ${m.approveUrl}`;

    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const form = new URLSearchParams({
      To: toE164.startsWith("whatsapp:") ? toE164 : `whatsapp:${toE164}`,
      From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
      Body: body,
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    if (!res.ok) {
      console.error("[mandate-engine] twilio whatsapp non-2xx", res.status, await safeText(res));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[mandate-engine] twilio whatsapp error", e instanceof Error ? e.message : e);
    return false;
  }
}

async function safeText(r: Response): Promise<string> {
  try {
    return (await r.text()).slice(0, 500);
  } catch {
    return "";
  }
}
