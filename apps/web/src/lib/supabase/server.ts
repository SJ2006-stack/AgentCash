import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readWorkerEnv } from "@/lib/env/worker-env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    readWorkerEnv("NEXT_PUBLIC_SUPABASE_URL")!,
    readWorkerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* Server Component */
          }
        },
      },
    },
  );
}
