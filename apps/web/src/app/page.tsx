import { ComingSoon } from "@/components/landing/ComingSoon";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function Home() {
  return (
    <>
      <main className="min-h-[calc(100dvh-3.5rem)]">
        <ComingSoon />
      </main>
      <SiteFooter />
    </>
  );
}
