import { Crepe } from "@milkdown/crepe";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord.css";

import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function Milkdown() {
  function splitTitleFromBody(markdown: string) {
    const lines = markdown.split("\n");
    let title = "";
    let bodyLines = [...lines];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#")) { 
        title = line;             
        bodyLines = lines.slice(i + 1); 
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
      .from("webContent")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("webContent")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };


  const crepe = new Crepe({
    root: document.getElementById("app"),
    defaultValue: "# Your title here\n\n![dsa]()\n\nStart writing your review...",
    featureConfigs: {
      [Crepe.Feature.ImageBlock]: {
        onUpload: handleImageUpload,
      },
    },
  });


  crepe.create();


  document.getElementById("saveBtn").addEventListener("click", async () => {
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

    const res = await fetch("/api/post/create", {
      method: "POST",
      body: formData,
      });
    if (!res.ok) {
      alert("Error saving");
      return;
    }
    window.location.href = "/dashboard";
    });
  }
export default Milkdown;
