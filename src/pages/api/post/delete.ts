import type { APIRoute } from "astro";

import { getSupabaseServer } from "../../../lib/supabaseServer";

export const POST: APIRoute = async (Astro) => {
    
  const supabase = getSupabaseServer(Astro);

  const { data: { user }, error: authError,} = await supabase.auth.getUser();
  const formData = await Astro.request.formData();

   if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }
      
  const id = formData.get("id");
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', id)

if (error) {
  console.error(error.message);
}
 return new Response(null, {
    status: 302,
    headers: { Location: "/dashboard" },
  });
  
};