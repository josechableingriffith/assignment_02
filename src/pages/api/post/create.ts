import { preview, type APIRoute } from "astro";

import { getSupabaseServer } from "../../../lib/supabaseServer";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
export const POST: APIRoute = async (Astro) => {
    
const supabase = getSupabaseServer(Astro);
const { data: { user }, error: authError,} = await supabase.auth.getUser();
const { data: profile, error } = await supabase
  .from("users_data")
  .select("*")
  .eq("id", user.id)
  .single();
if (authError || !user) {
  return new Response("Unauthorized", { status: 401 });
}

const formData = await Astro.request.formData();
const body = formData.get("body");
const title = formData.get("title");
const preview = formData.get("preview");
const cover = formData.get("cover");


if (!body || !title) {
  return new Response("Title and body are required", { status: 400 });
}

const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/^-+/, "").replace(/-+$/, "");


const { data, error: sendError } = await supabase
  .from("posts")
  .insert([
    {
      body: body,
      title: title,
      author_id: user.id, 
      author_name: profile?.name,
      author_last_name: profile?.last_name,
      slug: slug,
      preview: preview,
      date_posted: new Date(),
      cover: cover,
    },
  ])
  .select();
if (error) {
  console.error(error.message);
}
 return new Response(null, {
    status: 302,
    headers: { Location: "/dashboard" },
  });
};