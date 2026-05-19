import { redirect } from "next/navigation";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { SocialRows } from "@/components/landing/SocialRows";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main>
      <Hero />
      <Features />
      <SocialRows />
    </main>
  );
}
