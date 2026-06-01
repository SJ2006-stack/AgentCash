import { CliDemo } from "@/components/landing/CliDemo";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Roadmap } from "@/components/landing/Roadmap";
import { SocialRows } from "@/components/landing/SocialRows";

export default function Home() {
  return (
    <main>
      <Hero />
      <CliDemo />
      <Features />
      <Roadmap />
      <SocialRows />
    </main>
  );
}
