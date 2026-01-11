import type { APIRoute } from "astro";

import { getSupabaseServer } from "../../../lib/supabaseServer";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const POST: APIRoute = async (Astro) => {
  const supabase = getSupabaseServer(Astro);
  const formData = await Astro.request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const last_name = formData.get("last_name")?.toString();


  if (typeof email !== "string" || typeof password !== "string") {
  return new Response("Email and password required", { status: 400 });
  }
  const { data: signUpData, error: errorsignup } = await supabase.auth.signUp({
    email,
    password,
  });
const userId = signUpData.user?.id;

  const { error: errorinfo } = await supabase
  .from('users_data')
  .insert([
      { id: userId, 
        name: name,
        last_name: last_name,
      }
    ]);

  if (errorsignup) {
    return new Response(errorsignup.message, { status: 401 });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: "/login" },
  });
};
