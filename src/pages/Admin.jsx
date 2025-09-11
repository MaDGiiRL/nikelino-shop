// src/pages/Admin.jsx
const BUCKET = "media";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase/supabase-client";
import Swal from "sweetalert2";

// --- categorie e tag come prima
const CATEGORIES = [
  "Tutte",
  "Tattoos",
  "Ped",
  "Mappe",
  "Vestiti",
  "Script",
  "Menu Creatura",
  "Spells",
  "Armi",
  "Occhi Custom",
];
const TAGS = ["Fantasy", "Modern"];

const empty = {
  title: "",
  price: "",
  category: "Tattoos",
  tag: "Modern",
  short: "",
  details: "",
  files: [], // File[]
};

// genera/recupera un id locale per cartella storage
function ensureClientId() {
  let id = localStorage.getItem("nikelino_client_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("nikelino_client_id", id);
  }
  return id;
}

export default function Admin() {
  // 🔔 niente session: pannello sempre visibile
  const clientId = ensureClientId();

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // carico i prodotti all'avvio
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      return Swal.fire("Errore", error.message, "error");
    }
    setProducts(data || []);
  }

  /* ---------------- Media utils ---------------- */
  function inferIsVideo(fileOrName, mime) {
    if (mime) return /video/i.test(mime);
    const n =
      typeof fileOrName === "string" ? fileOrName : fileOrName?.name || "";
    return /\.(mp4|webm|mov|m4v)$/i.test(n);
  }

  function addFiles(list) {
    if (!list || !list.length) return;
    const incoming = Array.from(list);
    setForm((f) => ({ ...f, files: [...f.files, ...incoming] }));
  }

  function removeFile(idx) {
    setForm((f) => {
      const next = [...f.files];
      next.splice(idx, 1);
      return { ...f, files: next };
    });
  }

  function moveFile(idx, dir) {
    setForm((f) => {
      const next = [...f.files];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= next.length) return f;
      const [it] = next.splice(idx, 1);
      next.splice(newIdx, 0, it);
      return { ...f, files: next };
    });
  }

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    function prevent(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    function onDragEnter(e) {
      prevent(e);
      el.classList.add("ring-2", "ring-[#28c8ff]/40");
    }
    function onDragOver(e) {
      prevent(e);
    }
    function onDragLeave(e) {
      prevent(e);
      el.classList.remove("ring-2", "ring-[#28c8ff]/40");
    }
    function onDrop(e) {
      prevent(e);
      el.classList.remove("ring-2", "ring-[#28c8ff]/40");
      addFiles(e.dataTransfer.files);
    }

    el.addEventListener("dragenter", onDragEnter);
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragenter", onDragEnter);
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, []);

  /* ---------------- Submit ---------------- */
  async function resizeImage(file, maxSize = 1024) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");

        const ratio = Math.min(img.width / maxSize, img.height / maxSize);
        const sw = maxSize * ratio;
        const sh = maxSize * ratio;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, maxSize, maxSize);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Errore resize canvas");
            const ext = "webp";
            const newFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, `.${ext}`),
              { type: `image/${ext}` }
            );
            resolve(newFile);
          },
          "image/webp",
          0.9
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.title.trim())
      return Swal.fire("Attenzione", "Titolo obbligatorio", "warning");
    if (!form.price.trim())
      return Swal.fire("Attenzione", "Prezzo obbligatorio", "warning");

    setLoading(true);
    try {
      const media = [];

      for (const file of form.files) {
        let uploadFile = file;

        if (!inferIsVideo(file, file.type)) {
          uploadFile = await resizeImage(file, 1024);
        }

        const ext = uploadFile.name.split(".").pop();
        const path = `${clientId}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, uploadFile, { upsert: false });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        media.push({
          type: inferIsVideo(file, file.type) ? "video" : "image",
          src: pub.publicUrl,
        });
      }

      const payload = {
        title: form.title.trim(),
        price: form.price.trim(),
        category: form.category,
        tag: form.tag,
        short: form.short.trim(),
        details: form.details.trim(),
        media,
      };

      const { error: insErr } = await supabase.from("products").insert(payload);
      if (insErr) throw insErr;

      Swal.fire("Pubblicato", "Prodotto creato con successo", "success");
      setForm(empty);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadProducts();
    } catch (err) {
      console.error(err);
      Swal.fire("Errore", err.message || "Upload/insert fallito", "error");
    } finally {
      setLoading(false);
    }
  }

  async function removeProduct(id) {
    const confirm = await Swal.fire({
      title: "Elimina prodotto?",
      text: "Questa azione è irreversibile",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Elimina",
      cancelButtonText: "Annulla",
    });
    if (!confirm.isConfirmed) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return Swal.fire("Errore", error.message, "error");
    Swal.fire("Eliminato", "Prodotto rimosso", "success");
    await loadProducts();
  }

  /* ---------------- View: pannello sempre visibile ---------------- */
  return (
    <section className="container-max my-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-black">Admin Panel</h1>
        {/* niente bottone Esci */}
      </div>

      {/* FORM PUBBLICAZIONE */}
      <div className="card-surface p-6">
        <h3 className="text-xl font-black mb-4">Pubblica prodotto</h3>
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Titolo */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">Titolo</label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
            />
          </div>

          {/* Prezzo */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">Prezzo (es: €25)</label>
            <input
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">Categoria</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl 
                         bg-[#0b1324] text-white 
                         border border-white/20
                         focus:border-[#28c8ff] focus:ring-2 focus:ring-[#28c8ff]/40
                         hover:border-[#60efff]
                         transition-colors duration-200"
            >
              {CATEGORIES.filter((c) => c !== "Tutte").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tag */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">Tag</label>
            <select
              value={form.tag}
              onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl 
                         bg-[#0b1324] text-white 
                         border border-white/20
                         focus:border-[#28c8ff] focus:ring-2 focus:ring-[#28c8ff]/40
                         hover:border-[#60efff]
                         transition-colors duration-200"
            >
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Short */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm text-white/70">Riassunto breve</label>
            <textarea
              rows={2}
              value={form.short}
              onChange={(e) =>
                setForm((f) => ({ ...f, short: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm text-white/70">Dettagli</label>
            <textarea
              rows={5}
              value={form.details}
              onChange={(e) =>
                setForm((f) => ({ ...f, details: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
            />
          </div>

          {/* Dropzone + anteprime */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm text-white/70">
              Media (immagini/video, multipli)
            </label>

            <div
              ref={dropRef}
              className="rounded-2xl border border-dashed border-white/20 bg-white/[.04]
                         p-5 text-center hover:border-[#60efff] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-white/80 font-semibold">Trascina qui i file</p>
              <p className="text-white/60 text-sm">
                oppure clicca per selezionare
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {form.files.length > 0 && (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                  {form.files.map((f, i) => {
                    const isVideo = inferIsVideo(f, f.type);
                    const url = URL.createObjectURL(f);
                    return (
                      <div
                        key={i}
                        className="relative rounded-xl overflow-hidden border border-white/15 bg-black/30"
                        title={f.name}
                      >
                        <div className="aspect-[16/10] bg-[#0b1220]">
                          {isVideo ? (
                            <video
                              src={url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={url}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 p-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => moveFile(i, -1)}
                            className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white/90 text-xs"
                            disabled={i === 0}
                            title="Sposta a sinistra"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFile(i, +1)}
                            className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white/90 text-xs"
                            disabled={i === form.files.length - 1}
                            title="Sposta a destra"
                          >
                            →
                          </button>
                          <span className="text-xs text-white/60 truncate">
                            {isVideo ? "Video" : "Immagine"}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="ml-auto px-2 py-1 rounded-lg bg-white text-[#0a1020] text-xs font-bold"
                            title="Rimuovi"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-white/50">
                  Suggerimento: l’ordine delle anteprime è l’ordine salvato (la
                  prima è la thumbnail).
                </p>
              </>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              disabled={loading}
              type="submit"
              className="btn btn-primary"
            >
              {loading ? "Pubblico…" : "Pubblica"}
            </button>
          </div>
        </form>
      </div>

      {/* LISTA PRODOTTI */}
      <div className="space-y-3">
        <h3 className="text-xl font-black">Prodotti esistenti</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px]">
          {products.map((p) => (
            <article key={p.id} className="card-surface overflow-hidden">
              <div className="relative aspect-[16/10] bg-[#0b1220]">
                {p.media?.[0]?.type === "image" ? (
                  <img
                    src={p.media[0].src}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={p.media?.[0]?.src}
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="badge badge-soft absolute left-2 top-2">
                  {p.tag}
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="font-black">{p.title}</div>
                  <div className="ml-auto font-black">{p.price}</div>
                </div>
                <p className="text-sm text-white/75 mt-1 line-clamp-2">
                  {p.short}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="badge badge-soft">{p.category}</span>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="ml-auto px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:-translate-y-0.5 transition"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
