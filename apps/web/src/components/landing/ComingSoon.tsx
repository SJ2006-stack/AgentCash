import { Container } from "@/components/ui/Container";

export function ComingSoon() {
  return (
    <section className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16">
      <Container className="flex flex-col items-center justify-center text-center">
        <p className="ac-eyebrow mb-6 text-emerald-400/90">AgentCash</p>
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
          COMING SOON
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground sm:text-xl">
          Micro-payments for AI agents. We&apos;re putting the finishing touches on the product.
        </p>
      </Container>
    </section>
  );
}
