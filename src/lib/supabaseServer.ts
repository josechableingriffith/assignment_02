import { createServerClient, parseCookieHeader } from "@supabase/ssr";

export function getSupabaseServer(Astro: any) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return Astro.cookies.get(name)?.value;
        },
        set(name, value, options) {
          Astro.cookies.set(name, value, options);
        },
        remove(name, options) {
          Astro.cookies.delete(name, options);
        },
      },
    }
  );
}
