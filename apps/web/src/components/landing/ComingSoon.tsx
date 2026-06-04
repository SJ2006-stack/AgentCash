import { DockReveal } from "@/components/landing/DockReveal";
import { ComingSoonHero } from "@/components/landing/ComingSoonHero";
import { MarqueeReveal } from "@/components/landing/MarqueeReveal";
import { Container } from "@/components/ui/Container";
import { GridBackground } from "@/components/ui/GridBackground";

export function ComingSoon() {
  return (
    <section className="relative flex min-h-[min(100dvh-4rem,52rem)] items-center justify-center overflow-hidden py-14 pb-20 sm:py-16 sm:pb-24">
      <GridBackground variant="hero" className="opacity-40" />
      <Container className="relative z-10 flex w-full flex-col items-center justify-center">
        <ComingSoonHero />
        <MarqueeReveal />
        <DockReveal />
      </Container>
    </section>
  );
}
