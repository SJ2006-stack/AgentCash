import {
  DeveloperSection,
  FAQ,
  Features,
  FinalCTA,
  GetStartedBand,
  Hero,
  HowItWorks,
  LogoStrip,
  ProblemSolution,
  Roadmap,
  SiteFooter,
  SocialRows,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <LogoStrip />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <DeveloperSection />
        <SocialRows />
        <Roadmap />
        <GetStartedBand />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
