import type { APIRoute } from "astro";
import { getSupabaseServer } from "../../../lib/supabaseServer";

export const POST: APIRoute = async (Astro) => {
    import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
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
const id = formData.get("id");


if (!body || !title) {
  return new Response("Title and body are required", { status: 400 });
}

const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/^-+/, "").replace(/-+$/, "");

console.log("hola antes el guardado" + id)
const { data, error: sendError } = await supabase
  .from("posts")
  .update(
    {
      body: body,
      title: title,
      slug: slug,
      preview: preview,
      cover: cover,
    },
  )
  .eq('id', id)
  .select();
  console.log("hola desde el guardado")
if (error) {
  console.error(sendError.message);
}
 return new Response(null, {
    status: 302,
    headers: { Location: "/dashboard" },
  });
};