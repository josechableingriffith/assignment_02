import type { APIRoute } from "astro";

import { getSupabaseServer } from "../../../lib/supabaseServer";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL!,
  import.meta.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY!
);

export const POST: APIRoute = async (Astro) => {
  const supabase = getSupabaseServer(Astro);

const handleImageUpload = async (file : File) => {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `profile_photos/${fileName}`;

  const { error } = await supabase.storage
    .from("webContent") 
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("webContent")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

  const formData = await Astro.request.formData();

  const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
    return new Response("Unauthorized", { status: 401 });
    }
  const { data: profile, error } = await supabase
    .from('users_data')
    .select('*')
    .eq('id', user.id)
    .single();

    const file = formData.get("profile_photo") as File | null;
    let imageUrl: string | null = profile?.profile_photo ?? "/profile-photo.webp";

  if (file && file.size > 0) {
    try {
      imageUrl = await handleImageUpload(file);
      console.log("Imagen subida:", imageUrl);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      return new Response("Error al subir la imagen", { status: 500 });
    }
  }

    const name = formData.get("name")?.toString();
    const last_name = formData.get("last_name")?.toString()
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()

  if (email || password) {
    const { data: authData, error: authUpdateError } = await supabase.auth.updateUser({
      email: email || undefined,
      password: password || undefined,
    });
  if (authUpdateError) {
    console.error(authUpdateError);
      return new Response(authUpdateError.message, { status: 500 });
    }
  }

const { data, error2 } = await supabase
    .from('users_data')
    .upsert({ id: user.id, name: name, last_name: last_name, profile_photo: imageUrl })
    .eq('id', user.id)

if (error) {
    return new Response(error.message, { status: 401 });
}

  return new Response(null, {
    status: 302,
    headers: { Location: "/dashboard" },
  });
};