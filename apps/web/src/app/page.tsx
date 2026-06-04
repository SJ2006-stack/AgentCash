import { ComingSoon } from "@/components/landing/ComingSoon";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function Home() {
  return (
    <>
      <main className="min-h-[calc(120dvh-3.5rem)]">
        <ComingSoon />
      </main>
      <SiteFooter />
    </>
  );
}
