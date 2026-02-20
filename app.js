import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.APP_CONFIG || {};
const supabaseUrl = config.SUPABASE_URL || "";
const supabaseAnonKey = config.SUPABASE_ANON_KEY || "";

const form = document.getElementById("note-form");
const contentInput = document.getElementById("content");
const imageInput = document.getElementById("image");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const notesListEl = document.getElementById("notes-list");

let supabase = null;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#dc2626" : "#6b7280";
}

function escapeHtml(text = "") {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(raw) {
  const date = new Date(raw);
  return date.toLocaleString("zh-CN", { hour12: false });
}

function renderNotes(notes) {
  if (!notes.length) {
    notesListEl.innerHTML = "<p>还没有笔记，发布第一条吧。</p>";
    return;
  }

  const html = notes
    .map((note) => {
      const imageBlock = note.image_url
        ? `<img src="${escapeHtml(note.image_url)}" alt="笔记图片" loading="lazy" />`
        : "";

      const contentBlock = note.content
        ? `<p class="note-content">${escapeHtml(note.content)}</p>`
        : "";

      return `
        <article class="note-item ${note.image_url ? "" : "no-image"}">
          ${imageBlock}
          <div class="note-body">
            ${contentBlock}
            <p class="note-time">${formatTime(note.created_at)}</p>
          </div>
        </article>
      `;
    })
    .join("");

  notesListEl.innerHTML = html;
}

async function loadNotes() {
  if (!supabase) return;

  const { data, error } = await supabase
    .from("notes")
    .select("id, content, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    setStatus(`加载失败: ${error.message}`, true);
    return;
  }

  renderNotes(data || []);
}

async function onSubmit(event) {
  event.preventDefault();

  const content = contentInput.value.trim();
  const file = imageInput.files?.[0];

  if (!content && !file) {
    setStatus("请至少输入笔记内容或选择一张图片", true);
    return;
  }

  submitBtn.disabled = true;
  setStatus("发布中...");

  try {
    let imageUrl = null;

    if (file) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const path = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("notes-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("notes-images")
        .getPublicUrl(path);

      imageUrl = urlData.publicUrl;
    }

    const payload = {
      content: content || null,
      image_url: imageUrl,
    };

    const { error: insertError } = await supabase.from("notes").insert(payload);

    if (insertError) throw insertError;

    form.reset();
    setStatus("发布成功");
    await loadNotes();
  } catch (error) {
    setStatus(`发布失败: ${error.message}`, true);
  } finally {
    submitBtn.disabled = false;
  }
}

function init() {
  const missingConfig =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("YOUR_SUPABASE_URL") ||
    supabaseAnonKey.includes("YOUR_SUPABASE_ANON_KEY");

  if (missingConfig) {
    setStatus("请先在 index.html 中配置 Supabase URL 和 Anon Key", true);
    return;
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  form.addEventListener("submit", onSubmit);
  loadNotes();
}

init();
