import { ComingSoon } from "@/components/landing/ComingSoon";
import { DeveloperSection } from "@/components/landing/DeveloperSection";
import { DocsPreview } from "@/components/landing/DocsPreview";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { GetStartedBand } from "@/components/landing/GetStartedBand";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function Home() {
  return (
    <>
      <main>
        <ComingSoon />
        <LogoStrip />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <DocsPreview />
        <DeveloperSection />
        <GetStartedBand />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
