import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export type CardKind = "single_use" | "subscription_lock";

export async function ensureCardholder(
  supabase: SupabaseClient,
  stripe: Stripe | null,
  skipStripe: boolean,
  agentId: string,
): Promise<string | null> {
  const { data: agent, error } = await supabase
    .from("agents")
    .select("stripe_cardholder_id, name")
    .eq("id", agentId)
    .single();
  if (error || !agent) return null;
  if (agent.stripe_cardholder_id) return agent.stripe_cardholder_id as string;
  if (!stripe || skipStripe) return null;
  try {
    const holder = await stripe.issuing.cardholders.create(
      {
        type: "individual",
        name: (agent.name as string) ?? "Mandate Agent",
        email: `agent-${agentId.slice(0, 8)}@mandate.local`,
        phone_number: "+18005550199",
        billing: {
          address: {
            line1: "1272 Valencia Street",
            city: "San Francisco",
            state: "CA",
            postal_code: "94110",
            country: "US",
          },
        },
        individual: {
          first_name: "Mandate",
          last_name: "Agent",
          dob: { day: 1, month: 1, year: 1990 },
        },
      },
      { idempotencyKey: `mandate-holder-${agentId}` },
    );
    await supabase.from("agents").update({ stripe_cardholder_id: holder.id }).eq("id", agentId);
    return holder.id;
  } catch (e) {
    console.error("[mandate-engine] cardholder create failed", e instanceof Error ? e.message : e);
    return null;
  }
}

export type IssuedCard = { id: string; last4?: string; simulated: boolean };

export async function createCard(
  stripe: Stripe | null,
  skipStripe: boolean,
  opts: {
    cardholderId: string;
    amountCents: number;
    kind: CardKind;
    periodDays?: number;
  },
): Promise<IssuedCard> {
  if (!stripe || skipStripe) {
    return {
      id:
        opts.kind === "subscription_lock"
          ? `card_sim_sub_${Math.random().toString(36).slice(2, 8)}`
          : `card_sim_single_${Math.random().toString(36).slice(2, 8)}`,
      last4: "4242",
      simulated: true,
    };
  }
  const limits: Stripe.Issuing.CardCreateParams.SpendingControls.SpendingLimit[] =
    opts.kind === "single_use"
      ? [{ amount: opts.amountCents, interval: "per_authorization" }]
      : [{ amount: opts.amountCents, interval: "monthly" }];
  const card = await stripe.issuing.cards.create({
    cardholder: opts.cardholderId,
    currency: "usd",
    type: "virtual",
    status: "active",
    spending_controls: { spending_limits: limits },
  });
  return { id: card.id, last4: card.last4 ?? undefined, simulated: false };
}

export async function deactivateCard(stripe: Stripe | null, skipStripe: boolean, stripeCardId: string): Promise<boolean> {
  if (!stripe || skipStripe || stripeCardId.startsWith("card_sim")) return true;
  try {
    await stripe.issuing.cards.update(stripeCardId, { status: "canceled" });
    return true;
  } catch (e) {
    console.error("[mandate-engine] card cancel failed", e instanceof Error ? e.message : e);
    return false;
  }
}

export async function retrieveIssuingCard(stripe: Stripe | null, skipStripe: boolean, stripeCardId: string) {
  if (!stripe || skipStripe || stripeCardId.startsWith("card_sim")) {
    return {
      id: stripeCardId,
      status: "active",
      last4: "4242",
      exp_month: 12,
      exp_year: new Date().getUTCFullYear() + 2,
      brand: "visa",
      simulated: true,
    };
  }
  const c = await stripe.issuing.cards.retrieve(stripeCardId);
  return {
    id: c.id,
    status: c.status,
    last4: c.last4 ?? null,
    exp_month: c.exp_month ?? null,
    exp_year: c.exp_year ?? null,
    brand: c.brand ?? null,
    simulated: false,
  };
}

export async function listIssuingTransactions(
  stripe: Stripe | null,
  skipStripe: boolean,
  stripeCardId: string,
  limit: number,
) {
  if (!stripe || skipStripe || stripeCardId.startsWith("card_sim")) {
    return { transactions: [] as { id: string; amount: number; status: string; created: number; merchant?: string }[] };
  }
  const txs = await stripe.issuing.transactions.list({
    card: stripeCardId,
    limit: Math.min(100, Math.max(1, limit)),
  });
  const transactions = txs.data.map((t) => ({
    id: t.id,
    amount: t.amount,
    status: t.type ?? "unknown",
    created: t.created,
    merchant: t.merchant_data?.name ?? undefined,
  }));
  return { transactions };
}
