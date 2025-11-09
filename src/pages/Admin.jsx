// pages/AdminDashboard.jsx
const BUCKET = "media";

import { useEffect, useMemo, useRef, useState } from "react";
import supabase from "../supabase/supabase-client";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Costanti ---------- */
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
  "Grafiche",
  "Pack",
  "Auto emissive",
  "Auto non emissive",
];

// Filtro tag nella LISTA admin
const TAGS = ["Tutti", "Fantasy", "Modern", "Altro"];

// Opzioni tag nel FORM (vuoto consentito)
const TAG_OPTIONS = [
  { value: "", label: "— nessun tag —" },
  { value: "Fantasy", label: "Fantasy" },
  { value: "Modern", label: "Modern" },
];

const STATUSES = [
  { value: "tutti", label: "Tutti", icon: "✨" },
  { value: "in_vendita", label: "In vendita", icon: "💰" },
  { value: "venduto", label: "Venduto", icon: "⛔" },
];

/* ---------- Helpers prezzo ---------- */
function priceToNumber(p) {
  if (!p) return NaN;
  const s = String(p)
    .replace(/[^\d.,-]/g, "")
    .replace(",", ".");
  return parseFloat(s);
}
function formatPrice(p) {
  if (p == null || p === "") return "";
  const n = priceToNumber(p);
  if (Number.isNaN(n)) return String(p);
  return `€${n.toFixed(2)}`;
}
/* ⬇️ arrotonda SEMPRE verso l’alto al centesimo */
function roundUpToCents(n) {
  return Math.ceil(n * 100) / 100;
}

/* ---------- Stato form vuoto ---------- */
const empty = {
  title: "",
  price: "",
  old_price: "",
  is_discounted: false,
  discount_percent: null,
  category: "Tattoos",
  tag: "Modern", // selezionabile come vuoto nel form
  short: "",
  details: "",
  status: "in_vendita",
  files: [], // legacy
  media: [], // legacy
};

/* ---------- Animazioni ---------- */
const pageHeaderVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const formGridVariant = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const fieldVariant = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 240, damping: 18 },
  },
};
const gridVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.065, delayChildren: 0.06 },
  },
};
const cardItemVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

/* ---------- UI pills ---------- */
function StatusPill({ status }) {
  const isSold = status === "venduto";
  return (
    <span
      className={`badge absolute right-2 top-2 select-none ${
        isSold
          ? "bg-[#fd6058fb] text-white border border-white/20"
          : "bg-[#123a22] text-[#a7ffcb] border border-white/20"
      }`}
      title={isSold ? "Venduto" : "In vendita"}
    >
      <span className="font-black mr-1">{isSold ? "⛔" : "💰"}</span>
      {isSold ? "Venduto" : "In vendita"}
    </span>
  );
}

/* ---------- Utils media ---------- */
function inferIsVideo(fileOrName, mime) {
  if (mime && /^video\//i.test(mime)) return true;
  const n =
    typeof fileOrName === "string" ? fileOrName : fileOrName?.name || "";
  return /\.(mp4|webm|mov|m4v|avi|mkv|wmv|flv|mpeg|mpg|3gp|ogv|ogg)$/i.test(n);
}

// Whitelist immagini consentite
const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg", // .jpg, .jpeg
  "image/png",
  "image/gif", // GIF animate
  "image/webp",
]);
const ALLOWED_IMAGE_EXTS = /\.(jpe?g|png|gif|webp)$/i;

function isAllowedImage(file) {
  if (ALLOWED_IMAGE_MIMES.has(file.type)) return true;
  return ALLOWED_IMAGE_EXTS.test(file.name || "");
}

function ensureClientId() {
  let id = localStorage.getItem("nikelino_client_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("nikelino_client_id", id);
  }
  return id;
}

/* ---------- Styled Select ---------- */
function StyledSelect({
  value,
  onChange,
  children,
  className = "",
  selectClassName = "",
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className={[
          "peer block w-full appearance-none rounded-xl",
          "bg-white/10 text-white border border-white/20",
          "px-3 py-2 pr-10 outline-none",
          "transition-colors duration-200",
          "hover:border-[#60efff]",
          "focus:border-[#28c8ff] focus:ring-2 focus:ring-[#28c8ff]/40",
          "[color-scheme:dark]",
          "[&>option]:bg-[#0b1324] [&>option]:text-white [&>option]:py-2",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          selectClassName,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>

      {/* caret */}
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70 transition-opacity duration-150 peer-focus:opacity-100"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
      </svg>
    </div>
  );
}

/* ---------- Componente principale ---------- */
export default function Admin() {
  const clientId = ensureClientId();

  const [activeTab, setActiveTab] = useState("form"); // "form" | "list"

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // filtri/search (solo tab lista)
  const [search, setSearch] = useState("");
  const [fCategory, setFCategory] = useState("Tutte");
  const [fTag, setFTag] = useState("Tutti");
  const [fStatus, setFStatus] = useState("tutti");

  const originalPriceRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // Bozza media (mix esistenti + nuovi) — l'ordine definisce la cover (index 0)
  const [mediaDraft, setMediaDraft] = useState([]);

  /* ---------- Load ---------- */
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

  /* ---------- DnD handlers ---------- */
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

  /* ---------- File & MediaDraft ops ---------- */
  function addFiles(list) {
    if (!list || !list.length) return;

    const incoming = [];
    const rejected = [];

    Array.from(list).forEach((file) => {
      const isVideo = inferIsVideo(file, file.type);
      const isImage =
        /^image\//i.test(file.type) || ALLOWED_IMAGE_EXTS.test(file.name || "");

      // Accetta: qualsiasi video; immagini solo se nella whitelist
      if (isVideo || (isImage && isAllowedImage(file))) {
        incoming.push({
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: isVideo ? "video" : "image",
          file,
          preview: URL.createObjectURL(file),
        });
      } else {
        rejected.push(file.name || "file");
      }
    });

    if (rejected.length) {
      Swal.fire(
        "Formato non supportato",
        `Sono stati ignorati i seguenti file:\n\n• ${rejected.join(
          "\n• "
        )}\n\nImmagini consentite: JPEG/JPG, PNG, GIF, WEBP. Video: tutti i formati principali.`,
        "warning"
      );
    }

    if (incoming.length) {
      setMediaDraft((cur) => [...cur, ...incoming]);
    }
  }

  function removeDraft(idx) {
    setMediaDraft((arr) => {
      const next = [...arr];
      const [it] = next.splice(idx, 1);
      if (it?.preview) URL.revokeObjectURL(it.preview);
      return next;
    });
  }

  function moveDraft(idx, dir) {
    setMediaDraft((arr) => {
      const next = [...arr];
      const ni = idx + dir;
      if (ni < 0 || ni >= next.length) return arr;
      const [it] = next.splice(idx, 1);
      next.splice(ni, 0, it);
      return next;
    });
  }

  function setCover(idx) {
    setMediaDraft((arr) => {
      if (idx <= 0) return arr;
      const next = [...arr];
      const [it] = next.splice(idx, 1);
      next.unshift(it);
      return next;
    });
  }

  async function resizeImage(file, maxSize = 1024) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        const ratio = Math.min(img.width / maxSize, img.height / maxSize);
        const sw = maxSize * ratio,
          sh = maxSize * ratio;
        const sx = (img.width - sw) / 2,
          sy = (img.height - sh) / 2;
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

  /* ---------- Edit / Reset ---------- */
  function editProduct(p) {
    setEditingId(p.id);
    originalPriceRef.current = p.price;

    // media esistenti -> bozza ordinabile
    setMediaDraft(
      (Array.isArray(p.media) ? p.media : []).map((m, i) => ({
        id: `ex-${i}-${Date.now()}`,
        type: m.type,
        src: m.src,
      }))
    );

    setForm({
      ...empty,
      title: p.title || "",
      price: p.price || "",
      old_price: p.old_price || "",
      is_discounted: !!p.is_discounted,
      discount_percent: p.discount_percent ?? null,
      category: p.category || "Tattoos",
      tag: p.tag ?? "", // consente tag vuoto
      short: p.short || "",
      details: p.details || "",
      status: p.status || "in_vendita",
      files: [],
      media: [],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    originalPriceRef.current = null;
    setForm({ ...empty, files: [] });
    setMediaDraft([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* ---------- Sconto helpers ---------- */
  function toggleDiscount(checked) {
    setForm((f) => {
      const next = { ...f, is_discounted: checked };
      if (!checked) {
        next.old_price = "";
        next.discount_percent = null;
      } else if (!f.old_price) {
        next.old_price = f.price || originalPriceRef.current || "";
      }
      return next;
    });
  }
  function applyPercent() {
    setForm((f) => {
      const base = priceToNumber(
        f.old_price || originalPriceRef.current || f.price
      );
      const perc = Number(f.discount_percent);
      if (!base || Number.isNaN(base) || Number.isNaN(perc)) return f;

      const raw = base * (1 - perc / 100);
      const rounded = roundUpToCents(raw); // ⬅️ arrotonda per eccesso
      return { ...f, price: formatPrice(rounded) };
    });
  }

  /* ---------- Submit ---------- */
  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim())
      return Swal.fire("Attenzione", "Titolo obbligatorio", "warning");
    if (!form.price.trim())
      return Swal.fire("Attenzione", "Prezzo obbligatorio", "warning");

    setLoading(true);
    try {
      // Costruisci media finali rispettando l'ordine in mediaDraft (index 0 = cover)
      const finalMedia = [];
      for (const item of mediaDraft) {
        if (item.file) {
          let uploadFile = item.file;

          if (item.type === "image") {
            // Non ridimensionare le GIF per preservare l’animazione
            const isGif =
              item.file.type === "image/gif" ||
              /\.gif$/i.test(item.file.name || "");
            if (!isGif) {
              uploadFile = await resizeImage(item.file, 1024);
            }
          }

          const ext = uploadFile.name.split(".").pop();
          const path = `${clientId}/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(path, uploadFile, { upsert: false });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);
          finalMedia.push({ type: item.type, src: pub.publicUrl });
        } else {
          finalMedia.push({ type: item.type, src: item.src });
        }
      }

      // Coerenza sconto
      let payload = {
        title: form.title.trim(),
        price: form.price.trim(),
        category: form.category,
        tag: form.tag ?? "", // può essere stringa vuota
        short: form.short.trim(),
        details: form.details.trim(),
        status: form.status,
        media: finalMedia, // cover = index 0
        is_discounted: !!form.is_discounted,
        old_price: form.is_discounted
          ? form.old_price || originalPriceRef.current || ""
          : null,
        discount_percent: form.is_discounted
          ? form.discount_percent ?? null
          : null,
      };

      if (
        editingId &&
        originalPriceRef.current &&
        form.price.trim() !== originalPriceRef.current
      ) {
        if (!payload.is_discounted) {
          payload.is_discounted = true;
          payload.old_price = originalPriceRef.current;
        }
      }

      if (editingId) {
        const { error: upErr } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);
        if (upErr) throw upErr;
        Swal.fire("Aggiornato", "Prodotto modificato con successo", "success");
      } else {
        const { error: insErr } = await supabase
          .from("products")
          .insert(payload);
        if (insErr) throw insErr;
        Swal.fire("Pubblicato", "Prodotto creato con successo", "success");
      }

      resetForm();
      await loadProducts();
      setActiveTab("list");
    } catch (err) {
      console.error(err);
      Swal.fire("Errore", err.message || "Operazione fallita", "error");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Row actions ---------- */
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

  async function toggleStatus(id, current) {
    const next = current === "venduto" ? "in_vendita" : "venduto";
    const { error } = await supabase
      .from("products")
      .update({ status: next })
      .eq("id", id);
    if (error) return Swal.fire("Errore", error.message, "error");
    await loadProducts();
  }

  /* ---------- Derivate ---------- */
  const stats = useMemo(() => {
    const tot = products.length;
    const sold = products.filter((p) => p.status === "venduto").length;
    const sale = products.filter((p) => p.is_discounted && p.old_price).length;
    return { tot, sold, sale };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (fCategory !== "Tutte" && p.category !== fCategory) return false;
      if (fTag !== "Tutti") {
        if (fTag === "Altro") {
          if (p.tag && String(p.tag).trim() !== "") return false;
        } else if (p.tag !== fTag) {
          return false;
        }
      }
      if (fStatus !== "tutti" && p.status !== fStatus) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.short} ${p.details} ${p.category} ${
        p.tag || ""
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, search, fCategory, fTag, fStatus]);

  /* ---------- UI ---------- */
  return (
    <section className="container-max my-6 pt-20 md:pt-20 sm:pt-20">
      {/* Header */}
      <motion.div
        className="mb-4 flex flex-wrap items-center gap-3 justify-between"
        variants={pageHeaderVariant}
        initial="hidden"
        animate="show"
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black">
          Admin Dashboard
        </h1>
      </motion.div>

      {/* Card principale con Top Tabs */}
      <div className="card-surface overflow-hidden">
        {/* Top Nav Tabs */}
        <div
          role="tablist"
          aria-label="Admin tabs"
          className="flex flex-wrap p-2 items-center gap-2 px-3 sm:px-4 pt-3 border-b border-white/10"
        >
          <button
            role="tab"
            aria-selected={activeTab === "form"}
            onClick={() => setActiveTab("form")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === "form"
                ? "bg-white text-[#0a1020]"
                : "bg-white/10 text-white border border-white/20 hover:bg-white/15"
            }`}
            title="Pubblica o modifica un prodotto"
          >
            {editingId ? "Modifica prodotto" : "Pubblica prodotto"}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "list"}
            onClick={() => setActiveTab("list")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === "list"
                ? "bg-white text-[#0a1020]"
                : "bg-white/10 text-white border border-white/20 hover:bg-white/15"
            }`}
            title="Lista prodotti online"
          >
            Lista prodotti
            <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-lg text[11px] text-[11px] font-black bg-white/10 border border-white/20">
              {stats.tot}
            </span>
          </button>

          {/* Stato editing a destra */}
          {editingId && activeTab === "form" && (
            <span className="ml-auto mr-2 px-2 py-1 rounded-lg text-[11px] bg-white/10 border border-white/20 whitespace-nowrap">
              In modifica: {editingId.slice(0, 8)}…
            </span>
          )}
        </div>

        {/* Contenuto Tab */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === "form" ? (
              <motion.div
                key="tab-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {/* Form Pubblica/Modifica */}
                <motion.form
                  onSubmit={onSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={formGridVariant}
                  initial="hidden"
                  animate="show"
                >
                  {/* Titolo */}
                  <motion.div variants={fieldVariant} className="space-y-2">
                    <label className="text-sm text-white/70">Titolo</label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                    />
                  </motion.div>

                  {/* Prezzo */}
                  <motion.div variants={fieldVariant} className="space-y-2">
                    <label className="text-sm text-white/70">
                      Prezzo (es: €25)
                    </label>
                    <input
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                    />
                  </motion.div>

                  {/* Categoria */}
                  <motion.div variants={fieldVariant} className="space-y-2">
                    <label className="text-sm text-white/70">Categoria</label>
                    <StyledSelect
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                    >
                      {CATEGORIES.filter((c) => c !== "Tutte").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </StyledSelect>
                  </motion.div>

                  {/* Tag (con opzione vuota) */}
                  <motion.div variants={fieldVariant} className="space-y-2">
                    <label className="text-sm text-white/70">Tag</label>
                    <StyledSelect
                      value={form.tag ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, tag: e.target.value }))
                      }
                    >
                      {TAG_OPTIONS.map((t) => (
                        <option key={t.label} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </StyledSelect>
                    {form.category === "Grafiche" && (
                      <p className="text-xs text-white/50 mt-1">
                        Per le Grafiche puoi lasciare il tag vuoto se non è né
                        Modern né Fantasy.
                      </p>
                    )}
                  </motion.div>

                  {/* Short */}
                  <motion.div
                    variants={fieldVariant}
                    className="md:col-span-2 space-y-2"
                  >
                    <label className="text-sm text-white/70">
                      Riassunto breve
                    </label>
                    <textarea
                      rows={2}
                      value={form.short}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, short: e.target.value }))
                      }
                      className="w-full bg-white/10 px-3 py-2 rounded-xl text-white border border-white/20 outline-none"
                    />
                  </motion.div>

                  {/* Details */}
                  <motion.div
                    variants={fieldVariant}
                    className="md:col-span-2 space-y-2"
                  >
                    <label className="text-sm text-white/70">Dettagli</label>
                    <textarea
                      rows={5}
                      value={form.details}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, details: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                    />
                  </motion.div>

                  {/* Stato */}
                  <motion.div variants={fieldVariant} className="space-y-2">
                    <label className="text-sm text-white/70">Stato</label>
                    <StyledSelect
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, status: e.target.value }))
                      }
                    >
                      {STATUSES.filter((s) => s.value !== "tutti").map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </StyledSelect>
                  </motion.div>

                  {/* SCONTO */}
                  <motion.div variants={fieldVariant} className="space-y-2">
                    <label className="text-sm text-white/70">Sconto</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="disc"
                        type="checkbox"
                        checked={form.is_discounted}
                        onChange={(e) => toggleDiscount(e.target.checked)}
                      />
                      <label htmlFor="disc" className="text-white/85">
                        Attiva sconto
                      </label>
                    </div>

                    {form.is_discounted && (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-white/60">
                            Prezzo precedente
                          </label>
                          <input
                            value={form.old_price}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                old_price: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                            placeholder="€35.00"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60">
                            % Sconto
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="1"
                              value={form.discount_percent ?? ""}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  discount_percent:
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                }))
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                              placeholder="es. 20"
                            />
                            <button
                              type="button"
                              onClick={applyPercent}
                              className="px-3 py-2 rounded-xl bg-white text-[#0a1020] font-bold whitespace-nowrap"
                              title="Applica % al prezzo"
                            >
                              Applica
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Dropzone */}
                  <motion.div
                    variants={fieldVariant}
                    className="md:col-span-2 space-y-3"
                  >
                    <label className="text-sm text-white/70">
                      Media (immagini/video, multipli)
                    </label>

                    <motion.div
                      ref={dropRef}
                      className="rounded-2xl border border-dashed border-white/20 bg-white/[.04] p-5 text-center hover:border-[#60efff] transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.995 }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 18,
                      }}
                    >
                      <p className="text-white/80 font-semibold">
                        Trascina qui i file
                      </p>
                      <p className="text-white/60 text-sm">
                        oppure clicca per selezionare
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/*"
                        multiple
                        onChange={(e) => addFiles(e.target.files)}
                        className="hidden"
                      />
                      <p className="text-white/50 text-xs mt-2">
                        Formati supportati: JPEG/JPG, PNG, GIF (animate
                        preservate), WEBP e tutti i video principali.
                      </p>
                    </motion.div>

                    {/* Gestione media: ordine / cover / rimozione */}
                    {mediaDraft.length > 0 && (
                      <motion.div
                        className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3"
                        variants={gridVariant}
                        initial="hidden"
                        animate="show"
                        layout
                      >
                        {mediaDraft.map((m, i) => {
                          const thumb = m.preview || m.src;
                          const isCover = i === 0;
                          const showCoverBadge = isCover && m.type === "image"; // COVER solo se la cover è un'IMMAGINE

                          return (
                            <motion.div
                              key={m.id}
                              className="relative rounded-xl overflow-hidden border border-white/15 bg-black/30"
                              variants={cardItemVariant}
                              layout
                              whileHover={{ y: -2 }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                              }}
                            >
                              {/* Badge COVER solo sulla cover (immagine) */}
                              {showCoverBadge && (
                                <span
                                  className="absolute left-2 top-2 z-10 badge bg-white text-[#0a1020] border border-white/20 font-black px-2 py-1 rounded-lg text-[10px]"
                                  title="Copertina"
                                >
                                  COVER
                                </span>
                              )}

                              {/* X in alto a destra */}
                              <button
                                type="button"
                                onClick={() => removeDraft(i)}
                                className="absolute right-2 top-2 z-10 w-7 h-7 rounded-full bg白 text-[#0a1020] font-black shadow hover:scale-105 transition"
                                title="Rimuovi media"
                                style={{ backgroundColor: "#fff" }}
                              >
                                ✕
                              </button>

                              {/* Le anteprime (immagini e video) sono ridimensionate a schermo */}
                              <div className="aspect-[16/10] bg-[#0b1220]">
                                {m.type === "video" ? (
                                  <video
                                    src={thumb}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                  />
                                ) : (
                                  <img
                                    src={thumb}
                                    className="w-full h-full object-cover"
                                    alt=""
                                  />
                                )}
                              </div>

                              {/* Controls inferiori */}
                              <div className="flex items-center gap-2 p-2 border-t border-white/10">
                                <button
                                  type="button"
                                  onClick={() => moveDraft(i, -1)}
                                  disabled={i === 0}
                                  className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-[11px] sm:text-xs"
                                  title="Sposta a sinistra"
                                >
                                  ←
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveDraft(i, +1)}
                                  disabled={i === mediaDraft.length - 1}
                                  className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-[11px] sm:text-xs"
                                  title="Sposta a destra"
                                >
                                  →
                                </button>

                                <span className="ml-auto text-[11px] sm:text-xs text-white/60">
                                  {m.type === "video" ? "Video" : "Immagine"}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    variants={fieldVariant}
                    className="md:col-span-2 flex items-center gap-2"
                  >
                    <motion.button
                      disabled={loading}
                      type="submit"
                      className="btn btn-primary whitespace-nowrap"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 18,
                      }}
                    >
                      {loading
                        ? "Salvo…"
                        : editingId
                        ? "Salva modifiche"
                        : "Pubblica"}
                    </motion.button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:-translate-y-0.5 transition whitespace-nowrap"
                      >
                        Annulla modifica
                      </button>
                    )}
                  </motion.div>
                </motion.form>
              </motion.div>
            ) : (
              <motion.div
                key="tab-list"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {/* Toolbar + stats */}
                <div className="rounded-2xl border border-white/10 bg-white/[.03] px-4 py-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                    {/* search */}
                    <div className="lg:col-span-5">
                      <label className="text-sm text-white/70">Cerca</label>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="titolo, descrizione, tag…"
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      />
                    </div>
                    {/* filters */}
                    <div className="lg:col-span-2">
                      <label className="text-sm text-white/70">Categoria</label>
                      <StyledSelect
                        className="mt-1"
                        value={fCategory}
                        onChange={(e) => setFCategory(e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </StyledSelect>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-sm text-white/70">Tag</label>
                      <StyledSelect
                        className="mt-1"
                        value={fTag}
                        onChange={(e) => setFTag(e.target.value)}
                      >
                        {TAGS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </StyledSelect>
                    </div>
                    <div className="lg:col-span-3 sm:col-span-2">
                      <label className="text-sm text-white/70">Stato</label>
                      <StyledSelect
                        className="mt-1"
                        value={fStatus}
                        onChange={(e) => setFStatus(e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </StyledSelect>
                    </div>
                  </div>

                  {/* Statistiche */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/15 bg-white/[.04] px-3 py-2 text-center sm:text-left">
                      <div className="text-[11px] sm:text-xs text-white/60">
                        Totali
                      </div>
                      <div className="text-lg sm:text-xl font-black">
                        {stats.tot}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/[.04] px-3 py-2 text-center sm:text-left">
                      <div className="text-[11px] sm:text-xs text-white/60">
                        Venduti
                      </div>
                      <div className="text-lg sm:text-xl font-black">
                        {stats.sold}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/[.04] px-3 py-2 text-center sm:text-left">
                      <div className="text-[11px] sm:text-xs text-white/60">
                        Scontati
                      </div>
                      <div className="text-lg sm:text-xl font-black">
                        {stats.sale}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Griglia prodotti */}
                <div className="p-0">
                  <motion.div
                    className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 sm:gap-[22px]"
                    variants={gridVariant}
                    initial="hidden"
                    animate="show"
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {filtered.map((p) => (
                        <motion.article
                          key={p.id}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.03] shadow"
                          variants={cardItemVariant}
                          layout
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          whileHover={{ y: -3 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                          }}
                        >
                          <div className="relative aspect-[16/10] bg-[#0b1220]">
                            <div
                              className={`${
                                p.status === "venduto"
                                  ? "grayscale-[0.4] opacity-90"
                                  : ""
                              }`}
                            >
                              {p.media?.[0]?.type === "image" ? (
                                <img
                                  src={p.media[0].src}
                                  className="w-full h-full object-cover"
                                  alt={p.title}
                                />
                              ) : (
                                <video
                                  src={p.media?.[0]?.src}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>

                            {/* tag visibile solo se non vuoto */}
                            {p.tag ? (
                              <span className="badge badge-soft absolute left-2 top-2">
                                {p.tag}
                              </span>
                            ) : null}

                            <StatusPill status={p.status} />

                            {p.is_discounted && p.old_price && (
                              <span className="absolute inset-x-2 bottom-2 text-center text-[10px] sm:text-xs font-black tracking-widest px-2 py-1 rounded-lg bg-[#0a1020]/70 text-white/95 shadow">
                                SCONTO{" "}
                                {p.discount_percent
                                  ? `-${p.discount_percent}%`
                                  : ""}
                              </span>
                            )}
                          </div>

                          <div className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="font-black text-sm sm:text-base truncate">
                                {p.title}
                              </div>
                              <div className="ml-auto font-black text-sm sm:text-base shrink-0 whitespace-nowrap">
                                {p.is_discounted && p.old_price ? (
                                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                                    <span className="line-through opacity-70">
                                      {p.old_price}
                                    </span>
                                    <span className="text-emerald-300">
                                      {p.price}
                                    </span>
                                  </div>
                                ) : (
                                  <span>{p.price}</span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm text-white/75 mt-1 line-clamp-2">
                              {p.short}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="badge badge-soft">
                                {p.category}
                              </span>

                              <button
                                onClick={() => toggleStatus(p.id, p.status)}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-[12px] sm:text-sm text白/90 text-white/90 hover:-translate-y-0.5 transition whitespace-nowrap shrink-0 ${
                                  p.status === "venduto"
                                    ? "bg-[#123a22] border-white/20"
                                    : "bg-[#3d0d0d] border-white/20"
                                }`}
                                title={
                                  p.status === "venduto"
                                    ? "Torna in vendita"
                                    : "Segna venduto"
                                }
                              >
                                {p.status === "venduto"
                                  ? "Torna in vendita"
                                  : "Segna venduto"}
                              </button>

                              <button
                                onClick={() => editProduct(p)}
                                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[12px] sm:text-sm text-white/90 hover:-translate-y-0.5 transition whitespace-nowrap shrink-0"
                              >
                                Modifica
                              </button>

                              <button
                                onClick={() => removeProduct(p.id)}
                                className="ml-auto px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[12px] sm:text-sm text-white/90 hover:-translate-y-0.5 transition whitespace-nowrap shrink-0"
                              >
                                Elimina
                              </button>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {filtered.length === 0 && (
                    <div className="text-center py-10 sm:py-12 text-white/60 text-sm sm:text-base">
                      Nessun prodotto corrisponde ai filtri correnti.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
