// pages/AccountPanel.jsx
const BUCKET = "media";
const SAVED_TABLE_CANDIDATES = [
  "saved_items",
  "favorites",
  "bookmarks",
  "wishlists",
];

import { useEffect, useMemo, useRef, useState } from "react";
import supabase from "../supabase/supabase-client";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import ProductModal from "../components/ProductModal";

/* ---------- Animazioni ---------- */
const pageVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const pageHeaderVariant = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut", delay: 0.05 },
  },
};
const gridVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
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

/* ---------- Helpers ---------- */
async function fileToSquareWebp(file, size = 512) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2,
        sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      canvas.toBlob(
        (blob) => {
          if (!blob)
            return reject(new Error("Errore nella generazione avatar"));
          resolve(new File([blob], "avatar.webp", { type: "image/webp" }));
        },
        "image/webp",
        0.9
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function StatusPill({ status }) {
  const isSold = status === "venduto";
  return (
    <span
      className={`badge absolute right-2 top-2 select-none ${
        isSold
          ? "bg-[#ff3b30] text-white border border-white/20"
          : "bg-[#123a22] text-[#a7ffcb] border border-white/20"
      }`}
      title={isSold ? "Venduto" : "In vendita"}
    >
      <span className="font-black mr-1">{isSold ? "⛔" : "💰"}</span>
      {isSold ? "Venduto" : "In vendita"}
    </span>
  );
}

/* ---------- Card Prodotto salvato ---------- */
function SavedProductCard({ product, onUnsave, onOpen }) {
  const p = product;
  const media0 = p?.media?.[0];
  const isImage = media0?.type === "image";

  return (
    <motion.article
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.03] shadow hover:-translate-y-1.5 transition cursor-pointer"
      variants={cardItemVariant}
      initial="hidden"
      animate="show"
      exit="exit"
      layout
      onClick={() => onOpen?.(p)}
      role="button"
      tabIndex={0}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="relative aspect-[16/10] bg-[#0b1220]">
        <div
          className={`${
            p.status === "venduto" ? "grayscale-[0.4] opacity-90" : ""
          }`}
        >
          {isImage ? (
            <img
              src={media0?.src}
              className="w-full h-full object-cover"
              alt={p.title}
            />
          ) : (
            <video src={media0?.src} className="w-full h-full object-cover" />
          )}
        </div>

        <span className="badge badge-soft absolute left-2 top-2">{p.tag}</span>
        <StatusPill status={p.status} />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="font-black text-sm sm:text-base truncate">
            {p.title}
          </div>
          <div className="ml-auto font-black text-sm sm:text-base shrink-0 whitespace-nowrap">
            {p.old_price ? (
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="line-through opacity-70">{p.old_price}</span>
                <span className="text-emerald-300">{p.price}</span>
              </div>
            ) : (
              <span>{p.price}</span>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/75 mt-1 line-clamp-2">
          {p.short}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="badge badge-soft">{p.category}</span>
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnsave?.();
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="ml-auto px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[12px] sm:text-sm text-white/90 whitespace-nowrap shrink-0"
            title="Rimuovi dai salvati"
          >
            Rimuovi
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- Skeletons ---------- */
function LineSkeleton({ w = "w-2/3" }) {
  return (
    <motion.div
      className={`h-3 ${w} rounded bg-white/10 overflow-hidden relative`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
    />
  );
}
function AvatarSkeleton() {
  return (
    <motion.div
      className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
    />
  );
}

/* ---------- Pannello Account ---------- */
export default function Account() {
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "saved"
  const [loading, setLoading] = useState(true);

  // Auth + profilo
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    id: "",
    username: "",
    first_name: "",
    last_name: "",
    avatar_url: "",
    is_admin: false,
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Salvati
  const [savedTable, setSavedTable] = useState(null);
  const [savedProducts, setSavedProducts] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedInfo, setSavedInfo] = useState("");

  // Modale prodotto
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        console.error(authErr);
        Swal.fire(
          "Errore",
          "Non riesco a leggere l’utente autenticato.",
          "error"
        );
        setLoading(false);
        return;
      }
      const u = authData?.user || null;
      setUser(u);

      if (!u) {
        setLoading(false);
        return;
      }

      // carica/crea profilo
      const { data: row, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .maybeSingle();
      if (error) {
        console.error(error);
        Swal.fire("Errore", error.message, "error");
        setLoading(false);
        return;
      }

      if (!row) {
        await supabase.from("profiles").insert({
          id: u.id,
          username: u.user_metadata?.user_name || "",
          first_name: u.user_metadata?.first_name || "",
          last_name: u.user_metadata?.last_name || "",
          avatar_url: u.user_metadata?.avatar_url || "",
          is_admin: false,
        });
        setProfile((p) => ({ ...p, id: u.id }));
      } else {
        setProfile({
          id: row.id,
          username: row.username || "",
          first_name: row.first_name || "",
          last_name: row.last_name || "",
          avatar_url: row.avatar_url || "",
          is_admin: !!row.is_admin,
        });
      }

      setLoading(false);
      detectSavedTable();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function detectSavedTable() {
    setSavedInfo("");
    for (const name of SAVED_TABLE_CANDIDATES) {
      const { error, status } = await supabase.from(name).select("id").limit(1);
      if (!error) {
        setSavedTable(name);
        return;
      }
      if (status === 404 || error?.code === "PGRST205") continue;
      if (error) {
        setSavedTable(name);
        setSavedInfo(
          "Non hai i permessi per leggere i salvati. Controlla le policy RLS."
        );
        return;
      }
    }
    setSavedTable(null);
    setSavedInfo(
      "Tabella dei salvati non trovata. Crea la tabella o modifica SAVED_TABLE_CANDIDATES."
    );
  }

  // carica salvati quando apro il tab
  useEffect(() => {
    if (activeTab !== "saved" || !user) return;
    if (!savedTable) return;

    (async () => {
      setSavedLoading(true);
      try {
        // Prova join (se FK impostate)
        let { data, error } = await supabase
          .from(savedTable)
          .select("id, product:products(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error || !Array.isArray(data)) {
          // Fallback
          const res = await supabase
            .from(savedTable)
            .select("product_id, id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (res.error) throw res.error;
          const ids = (res.data || []).map((r) => r.product_id).filter(Boolean);
          let products = [];
          if (ids.length) {
            const { data: prods, error: perr } = await supabase
              .from("products")
              .select("*")
              .in("id", ids);
            if (perr) throw perr;
            products = prods || [];
          }
          const map = new Map(products.map((p) => [p.id, p]));
          data = (res.data || [])
            .map((r) => ({ id: r.id, product: map.get(r.product_id) }))
            .filter((r) => !!r.product);
        }

        setSavedProducts((data || []).map((r) => r.product));
      } catch (err) {
        console.error(err);
        setSavedInfo(
          "Impossibile leggere gli articoli salvati (controlla RLS/permessi)."
        );
      } finally {
        setSavedLoading(false);
      }
    })();
  }, [activeTab, user, savedTable]);

  async function onAvatarPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//i.test(file.type))
      return Swal.fire(
        "Attenzione",
        "Seleziona un file immagine valido",
        "warning"
      );

    try {
      const square = await fileToSquareWebp(file, 512);
      const path = `avatars/${profile.id}-${Date.now()}.webp`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, square, { upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const url = pub.publicUrl;

      setProfile((p) => ({ ...p, avatar_url: url }));
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);
      if (updErr) throw updErr;

      Swal.fire("Fatto!", "Avatar aggiornato", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Errore", err.message || "Upload avatar fallito", "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveProfile(e) {
    e?.preventDefault?.();
    if (!profile.id) return;
    setSaving(true);
    try {
      const payload = {
        username: profile.username?.trim() || null,
        first_name: profile.first_name?.trim() || null,
        last_name: profile.last_name?.trim() || null,
        avatar_url: profile.avatar_url || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", profile.id);
      if (error) throw error;
      Swal.fire("Salvato", "Profilo aggiornato con successo", "success");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Errore",
        err.message || "Impossibile salvare il profilo",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  const fullName = useMemo(
    () =>
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      profile.username ||
      "Il tuo profilo",
    [profile]
  );

  /* ---- Badge conteggio animato ---- */
  const savedCount = savedProducts.length;

  return (
    <>
      <motion.section
        className="container-max my-6 pt-20"
        variants={pageVariant}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div
          className="mb-4 flex flex-wrap items-center gap-3 justify-between"
          variants={pageHeaderVariant}
          initial="hidden"
          animate="show"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black">
            Pannello Account
          </h1>
          {user?.email && (
            <span className="px-2 py-1 rounded-lg text-[11px] md:text-xs bg-white/10 border border-white/20">
              {user.email}
            </span>
          )}
        </motion.div>

        {/* Card principale con Top Tabs */}
        <motion.div className="card-surface overflow-hidden" layout>
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Account tabs"
            className="relative flex flex-wrap items-center gap-2 px-3 sm:px-4 pt-3 border-b border-white/10"
          >
            <TabButton
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              label="Dati profilo"
            />
            <TabButton
              active={activeTab === "saved"}
              onClick={() => setActiveTab("saved")}
              label={
                <span className="inline-flex items-center gap-2">
                  Articoli salvati
                  <motion.span
                    key={savedCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-lg text-[11px] font-black bg-white/10 border border-white/20"
                  >
                    {savedCount}
                  </motion.span>
                </span>
              }
            />

            {/* Indicatore attivo animato */}
            <ActiveTabUnderline activeTab={activeTab} />
          </div>

          {/* Contenuto Tabs */}
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {activeTab === "profile" ? (
                <motion.div
                  key="tab-profile"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  {loading ? (
                    /* Skeleton profilo */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-4">
                        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                          <div className="flex items-center gap-4">
                            <AvatarSkeleton />
                            <div className="flex-1 min-w-0 space-y-2">
                              <LineSkeleton w="w-1/2" />
                              <LineSkeleton w="w-2/3" />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <LineSkeleton w="w-28" />
                            <LineSkeleton w="w-20" />
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-8">
                        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4 space-y-4">
                          <LineSkeleton w="w-full" />
                          <LineSkeleton w="w-full" />
                          <LineSkeleton w="w-2/3" />
                          <div className="flex gap-2">
                            <LineSkeleton w="w-32" />
                            <LineSkeleton w="w-24" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !user ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-white/70"
                    >
                      Devi effettuare l’accesso per gestire il profilo.
                    </motion.div>
                  ) : (
                    <form
                      onSubmit={saveProfile}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                      {/* Avatar + info */}
                      <motion.div className="lg:col-span-4" layout>
                        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                          <div className="flex items-center gap-4">
                            <motion.div
                              className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 bg-[#0b1220]"
                              whileHover={{ scale: 1.02 }}
                            >
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-white/40 text-sm">
                                  Nessun avatar
                                </div>
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black truncate">
                                {fullName}
                              </div>
                              <div className="text-white/60 text-sm truncate">
                                {user?.email || "—"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <motion.button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-3 py-2 rounded-xl bg-white text-[#0a1020] font-bold whitespace-nowrap"
                            >
                              Cambia avatar
                            </motion.button>
                            {profile.avatar_url && (
                              <motion.button
                                type="button"
                                onClick={async () => {
                                  try {
                                    setProfile((p) => ({
                                      ...p,
                                      avatar_url: "",
                                    }));
                                    await supabase
                                      .from("profiles")
                                      .update({ avatar_url: null })
                                      .eq("id", profile.id);
                                  } catch {}
                                }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90"
                              >
                                Rimuovi
                              </motion.button>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={onAvatarPick}
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Form campi */}
                      <motion.div className="lg:col-span-8" layout>
                        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-white/70">
                                Nome
                              </label>
                              <motion.input
                                value={profile.first_name}
                                onChange={(e) =>
                                  setProfile((p) => ({
                                    ...p,
                                    first_name: e.target.value,
                                  }))
                                }
                                whileFocus={{ scale: 1.01 }}
                                className="mt-1 w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-white/70">
                                Cognome
                              </label>
                              <motion.input
                                value={profile.last_name}
                                onChange={(e) =>
                                  setProfile((p) => ({
                                    ...p,
                                    last_name: e.target.value,
                                  }))
                                }
                                whileFocus={{ scale: 1.01 }}
                                className="mt-1 w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm text-white/70">
                                Username
                              </label>
                              <motion.input
                                value={profile.username}
                                onChange={(e) =>
                                  setProfile((p) => ({
                                    ...p,
                                    username: e.target.value,
                                  }))
                                }
                                whileFocus={{ scale: 1.01 }}
                                className="mt-1 w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <motion.button
                              type="submit"
                              disabled={saving}
                              whileHover={!saving ? { y: -2 } : {}}
                              whileTap={!saving ? { scale: 0.98 } : {}}
                              className="btn btn-primary whitespace-nowrap"
                            >
                              <AnimatePresence initial={false} mode="wait">
                                {saving ? (
                                  <motion.span
                                    key="saving"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="inline-flex items-center gap-2"
                                  >
                                    <motion.span
                                      aria-hidden
                                      className="inline-block w-4 h-4 rounded-full border-2 border-[#0a1020]"
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        repeat: Infinity,
                                        duration: 0.8,
                                        ease: "linear",
                                      }}
                                      style={{
                                        borderRightColor: "transparent",
                                      }}
                                    />
                                    Salvo…
                                  </motion.span>
                                ) : (
                                  <motion.span
                                    key="save"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                  >
                                    Salva modifiche
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.button>

                            <motion.button
                              type="button"
                              onClick={() => window.location.reload()}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90"
                            >
                              Annulla
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="tab-saved"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <AnimatePresence initial={false}>
                    {savedInfo && (
                      <motion.div
                        key="saved-info"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mb-4 rounded-xl border border-white/15 bg-white/[.04] px-3 py-2 text-sm text-white/80"
                      >
                        {savedInfo}
                        {!savedTable && (
                          <div className="mt-2 text-white/60">
                            Crea ad esempio una tabella{" "}
                            <code className="px-1 rounded bg-black/40">
                              saved_items
                            </code>{" "}
                            con colonne:
                            <code className="ml-1 px-1 rounded bg-black/40">
                              id
                            </code>
                            ,
                            <code className="ml-1 px-1 rounded bg-black/40">
                              user_id
                            </code>
                            ,
                            <code className="ml-1 px-1 rounded bg-black/40">
                              product_id
                            </code>
                            ,
                            <code className="ml-1 px-1 rounded bg-black/40">
                              created_at
                            </code>
                            .
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {savedLoading ? (
                    /* Skeleton salvati */
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 sm:gap-[22px]">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.03] p-3"
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.6,
                            ease: "easeInOut",
                            delay: i * 0.05,
                          }}
                        >
                          <div className="aspect-[16/10] rounded-xl bg-white/10 mb-3" />
                          <LineSkeleton w="w-3/4" />
                          <div className="mt-2 flex items-center gap-2">
                            <LineSkeleton w="w-16" />
                            <LineSkeleton w="w-20" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : savedProducts.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-white/70"
                    >
                      Non hai ancora salvato nessun articolo.
                    </motion.div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 sm:gap-[22px]"
                      variants={gridVariant}
                      initial="hidden"
                      animate="show"
                      layout
                    >
                      <AnimatePresence mode="popLayout">
                        {savedProducts.map((p) => (
                          <SavedProductCard
                            key={p.id}
                            product={p}
                            onOpen={(prod) => setModalProduct(prod)}
                            onUnsave={async () => {
                              if (!savedTable || !user) return;
                              try {
                                await supabase
                                  .from(savedTable)
                                  .delete()
                                  .eq("user_id", user.id)
                                  .eq("product_id", p.id);
                                setSavedProducts((arr) =>
                                  arr.filter((x) => x.id !== p.id)
                                );
                                if (modalProduct?.id === p.id)
                                  setModalProduct(null);
                              } catch (err) {
                                console.error(err);
                                Swal.fire(
                                  "Errore",
                                  "Impossibile rimuovere l'articolo dai salvati.",
                                  "error"
                                );
                              }
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.section>

      {/* Modale prodotto salvato */}
      <AnimatePresence>
        {modalProduct && (
          <ProductModal
            product={modalProduct}
            onClose={() => setModalProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- Componenti UI di supporto ---------- */

function TabButton({ active, onClick, label }) {
  return (
    <motion.button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
        active
          ? "bg-white text-[#0a1020]"
          : "bg-white/10 text-white border border-white/20 hover:bg-white/15"
      }`}
    >
      {label}
    </motion.button>
  );
}

function ActiveTabUnderline({ activeTab }) {
  // Usa lo stesso layoutId per un underline che “salta” da un tab all’altro
  return (
    <div className="w-full relative mt-2">
      <motion.div
        layoutId="tab-underline"
        className="h-[3px] rounded-full bg-white"
        style={{
          width: activeTab === "profile" ? 110 : 160, // larghezze indicative
        }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
      />
    </div>
  );
}
