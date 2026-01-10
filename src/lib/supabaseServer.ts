import { createServerClient, parseCookieHeader } from "@supabase/ssr";

export function getSupabaseServer(Astro: any) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
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
