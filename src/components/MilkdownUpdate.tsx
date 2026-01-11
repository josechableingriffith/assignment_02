import { createClient } from "@supabase/supabase-js";

import { useEffect, useRef, useState } from "react";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord.css";
import { Crepe } from "@milkdown/crepe";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL!,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY!
);

type MilkdownProps = {
  postid: string;
};

function splitTitleFromBody(markdown: string) {
  const lines = markdown.split("\n");
  let title = "";
  let bodyLines = [...lines];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#")) { // toma cualquier heading (#, ##, ###...)
      title = line;             // ⚠️ mantén los símbolos
      bodyLines = lines.slice(i + 1); // resto del contenido
      break;
    }
  }

  const body = bodyLines.join("\n").trim();
  return { title, body };
}

const handleImageUpload = async (file : File) => {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `posts/${fileName}`;

  const { error } = await supabase.storage
    .from("webContent") // ✅ SOLO bucket
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("webContent")
    .getPublicUrl(filePath);

  return data.publicUrl;
};


export default function MilkdownUpdate({ postid }: MilkdownProps) {
  useEffect(() => {
    const initEditor = async () => {

      const { data:post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postid)
        .single();

      if (error || !post) return;

      const title = post.title ?? "";
      const body = post.body ?? "";
      
      
      const initialValue = (post.title ?? "") + "\n\n" + (post.body ?? "");


      const root = document.getElementById("update");
      if (!root) return;

      const crepe = new Crepe({
        root,
        defaultValue: title+"\n\n"+body,
        featureConfigs: {
          [Crepe.Feature.ImageBlock]: {
            onUpload: handleImageUpload,
          },
        },
      });

      await crepe.create();

document.getElementById("updateBtn").addEventListener("click", async () => {
  const markdown = crepe.getMarkdown();
  const { title, body } = splitTitleFromBody(markdown);

  function getExcerpt(markdown: string, maxLines = 2) {
    return markdown
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/^#+\s.*$/gm, "")
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .slice(0, maxLines)
      .join(" ");
  }
  const excerpt = getExcerpt(body, 2);

function firstimage(markdown: string): string | null {
  if (!markdown) return null;
  const match = markdown.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}
  const cover = firstimage(markdown);

  const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("preview", excerpt);
    formData.append("cover", cover);
    formData.append("id", postid);


  
  const res = await fetch("/api/post/update", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    alert("Error saving");
    return;
  }
  window.location.href = "/dashboard";
  });


    };

    initEditor();
    
  }, [postid]);

  return (
      <div id="update"></div>
  );
}


