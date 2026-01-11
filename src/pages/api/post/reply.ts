import { preview, type APIRoute } from "astro";

import { getSupabaseServer } from "../../../lib/supabaseServer";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL!,
  import.meta.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY!
);
export const POST: APIRoute = async (Astro) => {
    
const supabase = getSupabaseServer(Astro);

const { data: { user }, error: authError,} = await supabase.auth.getUser();
if (authError || !user) {
  return new Response("Unauthorized", { status: 401 });
}

const { data: profile } = await supabase
  .from("users_data")
  .select("*")
  .eq("id", user.id)
  .single();
  
const author = user.id;

const formData = await Astro.request.formData();
const replie = formData.get("content_reply")?.toString();
const comment = formData.get("replied_comment")?.toString();

console.log(replie,comment);

const date = new Date().toISOString();

const { data, error: error } = await supabase
  .from("replies")
  .insert([
    {
      replied_comment: comment,
      author_comment: author, 
      posted: date,
      content_replies: replie,
    },
  ])
  .select();
if (error) {
  console.error(error.message);
}
 return new Response(null, {
  status: 303,
  headers: {
    Location: Astro.request.headers.get("referer") ?? "/",
  },
});
};