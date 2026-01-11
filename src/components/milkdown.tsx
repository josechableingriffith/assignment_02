// Información de Milkdown
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord.css";


import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);


export function Milkdown() {


// Funció para separar titulo y cuerpo
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

// Funcion subir imagenes



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





// Crepe

const crepe = new Crepe({
  root: document.getElementById("app"),
  defaultValue: "# Your title here\n\n![dsa]()\n\nStart writing your review...",
  featureConfigs: {
    [Crepe.Feature.ImageBlock]: {
      onUpload: handleImageUpload,
    },
  },
});

crepe.on((listener) => {
  listener.markdownUpdated((markdown) => {
  console.log("Markdown updated:", markdown);
  const now = crepe.getMarkdown();
  console.log("Contenido actual:", now);
  
  
  });
  
});



crepe.create();

// Botó para guardar

document.getElementById("saveBtn").addEventListener("click", async () => {
  const markdown = crepe.getMarkdown();
  console.log("Contenido guardado:", markdown);
  const { title, body } = splitTitleFromBody(markdown);
// Funcion preview
function getExcerpt(markdown: string, maxLines = 2) {
  return markdown
    // quitar imágenes
    .replace(/!\[.*?\]\(.*?\)/g, "")
    // quitar títulos
    .replace(/^#+\s.*$/gm, "")
    // dividir por líneas
    .split("\n")
    // limpiar líneas vacías
    .map(l => l.trim())
    .filter(Boolean)
    // tomar solo las primeras líneas
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
    alert("Error al guardar");
    return;
  }
  window.location.href = "/dashboard";




});
}
export default Milkdown;
