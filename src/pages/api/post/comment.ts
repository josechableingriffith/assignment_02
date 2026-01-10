import { preview, type APIRoute } from "astro";

import { getSupabaseServer } from "../../../lib/supabaseServer";

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
const comment = formData.get("comment")?.toString();
const post = formData.get("post_commented")?.toString();

const date = new Date().toISOString();

const { data, error: error } = await supabase
  .from("comments")
  .insert([
    {
      author_comment: author, 
      post_commented: post,
      posted: date,
      content_comment: comment,
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