import type { APIRoute } from "astro";

import { getSupabaseServer } from "../../../lib/supabaseServer";

export const POST: APIRoute = async (Astro) => {
  const supabase = getSupabaseServer(Astro);
  const formData = await Astro.request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  

  if (typeof email !== "string" || typeof password !== "string") {
  return new Response("Email and password required", { status: 400 });
  }
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(error.message, { status: 401 });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: "/dashboard" },
  });
};
