import { getSupabaseServer } from "../../../lib/supabaseServer";

import type { APIRoute } from "astro";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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
