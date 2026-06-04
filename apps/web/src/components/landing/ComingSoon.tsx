import { AgentCashDock } from "@/components/landing/AgentCashDock";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { ColorTyperEffect } from "@/components/magicui/color-typer-effect";
import { Container } from "@/components/ui/Container";

const ROTATING_PHRASES = [
  "x402 payments",
  "agent wallets",
  "pay per API call",
  "task routing",
] as const;

export function ComingSoon() {
  return (
    <section className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16 pb-24">
      <Container className="flex w-full flex-col items-center justify-center text-center">
        <p className="ac-eyebrow mb-6 text-emerald-400/90">AgentCash</p>
        <ColorTyperEffect
          text="COMING SOON"
          mode="appear"
          className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        />
        <ColorTyperEffect
          words={[...ROTATING_PHRASES]}
          mode="rotate"
          as="p"
          className="mt-4 min-h-[1.5em] text-xl font-semibold tracking-tight sm:text-2xl"
        />
        <p className="mt-6 max-w-md text-lg text-muted-foreground sm:text-xl">
          Micro-payments for AI agents. We&apos;re putting the finishing touches on the product.
        </p>
        <ReviewsMarquee />
        <AgentCashDock />
      </Container>
    </section>
  );
}
