// components/ProductCard.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import supabase from "../supabase/supabase-client";
import Swal from "sweetalert2";

const SAVED_TABLE_CANDIDATES = [
  "saved_items",
  "favorites",
  "bookmarks",
  "wishlists",
];

/* helper robusto per numeri prezzo (con € o virgole) */
function priceToNumber(v) {
  if (v == null || v === "") return NaN;
  const n = String(v)
    .replace(/[^\d.,-]/g, "")
    .replace(",", ".");
  const f = parseFloat(n);
  return Number.isNaN(f) ? NaN : f;
}

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

export default function ProductCard({ p, onClick, index }) {
  // Deriva info sconto da vari campi possibili
  const priceNum = priceToNumber(p.price);
  const oldNum = priceToNumber(p.old_price);
  const hasOld = !Number.isNaN(oldNum) && oldNum > 0;
  const computedPercent =
    !Number.isNaN(priceNum) && hasOld && oldNum > priceNum
      ? Math.round(((oldNum - priceNum) / oldNum) * 100)
      : null;

  const discountPercent =
    typeof p?.discount_percent === "number"
      ? p.discount_percent
      : computedPercent;

  const hasDiscount =
    (!!p?.is_discounted || hasOld || typeof p?.discount_percent === "number") &&
    ((discountPercent != null && discountPercent > 0) ||
      (hasOld && !Number.isNaN(priceNum) && priceNum < oldNum));

  // --- Salvataggio ---
  const [userId, setUserId] = useState(null);
  const [savedTable, setSavedTable] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id || null;
      setUserId(uid);

      // detect tabella
      for (const name of SAVED_TABLE_CANDIDATES) {
        const { error, status } = await supabase
          .from(name)
          .select("id")
          .limit(1);
        if (!error) {
          setSavedTable(name);
          break;
        }
        if (!(status === 404 || error?.code === "PGRST205")) {
          // tabella forse esiste ma no permessi: usala ugualmente per i tentativi insert/delete
          setSavedTable(name);
          break;
        }
      }

      // stato iniziale salvato
      if (uid && p?.id) {
        const table = savedTable || SAVED_TABLE_CANDIDATES[0];
        try {
          const { data: row } = await supabase
            .from(table)
            .select("id")
            .eq("user_id", uid)
            .eq("product_id", p.id)
            .maybeSingle();
          setIsSaved(!!row);
        } catch {
          // ignora
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.id]);

  async function toggleSave(e) {
    e?.stopPropagation?.();
    if (!userId) {
      Swal.fire("Accedi", "Devi accedere per salvare gli articoli.", "info");
      return;
    }
    const table = savedTable || SAVED_TABLE_CANDIDATES[0];
    setSaving(true);
    try {
      if (!isSaved) {
        const { error } = await supabase
          .from(table)
          .insert({ user_id: userId, product_id: p.id });
        if (error) throw error;
        setIsSaved(true);
      } else {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", userId)
          .eq("product_id", p.id);
        if (error) throw error;
        setIsSaved(false);
      }
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Errore",
        "Operazione non riuscita. Controlla la tabella dei salvati e le policy RLS.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  const media0 = p?.media?.[0];
  const isImage = media0?.type === "image";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.06 }}
      className="card-surface overflow-hidden group hover:-translate-y-2 hover:shadow-[0_36px_80px_rgba(0,0,0,0.66)] transition"
      onClick={onClick}
    >
      <div className="relative aspect-[16/10] bg-[#0b1220] cursor-pointer overflow-hidden">
        {isImage ? (
          <img
            src={media0?.src}
            alt={p.title}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <video
            src={media0?.src}
            muted
            className="w-full h-full object-cover"
          />
        )}

        <span className="badge badge-soft absolute left-2 top-2">{p.tag}</span>
        <StatusPill status={p.status} />

        {hasDiscount && (
          <span className="absolute inset-x-2 bottom-2 text-center text-[10px] sm:text-xs font-black tracking-widest px-2 py-1 rounded-lg bg-[#0a1020]/70 text-white/95 shadow">
            SCONTO {discountPercent ? `-${discountPercent}%` : ""}
          </span>
        )}

        {/* Heart salva/unsalva */}
        <button
          type="button"
          onClick={toggleSave}
          disabled={saving}
          title={isSaved ? "Rimuovi dai salvati" : "Salva articolo"}
          className={`absolute right-2 bottom-2 grid place-items-center w-9 h-9 rounded-xl border transition 
            ${
              isSaved
                ? "bg-white text-[#0a1020] border-white/20"
                : "bg-white/10 text-white border-white/20 hover:bg-white/15"
            }`}
        >
          {/* icona cuore */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 ${isSaved ? "" : "opacity-90"}`}
          >
            <path d="M11.645 20.91l-.007-.003-.022-.01a20.55 20.55 0 01-1.078-.58 25.18 25.18 0 01-4.244-3.017C3.852 15.04 2.25 12.886 2.25 10.5 2.25 7.42 4.714 5 7.688 5A5.5 5.5 0 0112 7.052 5.5 5.5 0 0116.313 5c2.973 0 5.437 2.42 5.437 5.5 0 2.386-1.602 4.54-4.044 6.8a25.18 25.18 0 01-4.244 3.017 20.55 20.55 0 01-1.078.58l-.022.01-.007.003a.75.75 0 01-.546 0z" />
          </svg>
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="font-black truncate capitalize">{p.title}</div>
          <div className="ml-auto font-black shrink-0 whitespace-nowrap">
            {hasDiscount && p.old_price ? (
              <div className="flex items-baseline gap-2">
                <span className="line-through opacity-70">{p.old_price}</span>
                <span className="text-emerald-300">{p.price}</span>
              </div>
            ) : (
              <span>{p.price}</span>
            )}
          </div>
        </div>

        <p className="text-sm text-white/75 mt-1 line-clamp-2">{p.short}</p>
        <div className="mt-2">
          <span className="badge badge-soft">{p.category}</span>
        </div>
      </div>
    </motion.article>
  );
}
