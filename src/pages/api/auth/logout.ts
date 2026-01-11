import { getSupabaseServer } from "../../../lib/supabaseServer";
import type { APIRoute } from "astro";


export const GET: APIRoute = async (Astro) => {
  const supabase = getSupabaseServer(Astro);
  const { error } = await supabase.auth.signOut()

  if (error) {
    return new Response(error.message, { status: 401 });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: "/" },
  });
};
