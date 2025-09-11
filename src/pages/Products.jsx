import { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import Swal from "sweetalert2";
import { supabase } from "../supabase/supabase-client";
import { motion, AnimatePresence } from "framer-motion";

const STATIC_CATEGORIES = [
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

// Variants per composizione elegante con stagger
const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      // attiva lo staggering sugli item figli
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
      mass: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeInOut" },
  },
};

export default function Products() {
  const [cat, setCat] = useState("Tutte");
  const [tag, setTag] = useState("Tutte");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  // load from supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        Swal.fire("Errore", error.message, "error");
      } else {
        setAll(data || []);
      }
      setLoading(false);
    })();
  }, []);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (all || [])
      .filter((p) => cat === "Tutte" || p.category === cat)
      .filter((p) => tag === "Tutte" || p.tag === tag)
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.short.toLowerCase().includes(q)
      );
  }, [all, cat, tag, search]);

  function handleOpen(p) {
    setOpen(p);
  }
  function handleClose() {
    setOpen(null);
  }

  function handleOrder() {
    Swal.fire({
      title: "Ordina su Discord",
      text: "Verrai reindirizzato al server Discord per completare l'ordine.",
      icon: "info",
      confirmButtonText: "Vai al Discord",
      showCancelButton: true,
    }).then((r) => {
      if (r.isConfirmed)
        window.open("https://discord.gg/BjHsyyta8r", "_blank", "noreferrer");
    });
  }

  return (
    <section>
      {/* Titolo con fade/slide-in */}
      <motion.h1
        className="text-4xl md:text-5xl font-black text-center py-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        Prodotti
      </motion.h1>

      {/* Filtri con leggero fade-in */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
      >
        <Filters
          categories={STATIC_CATEGORIES}
          cat={cat}
          setCat={setCat}
          tag={tag}
          setTag={setTag}
          search={search}
          setSearch={setSearch}
        />
      </motion.div>

      <div className="container-max">
        {loading ? (
          <div className="py-10 text-center text-white/70">Caricamento…</div>
        ) : (
          <>
            {/* Griglia animata: parent con stagger + AnimatePresence per enter/exit */}
            <motion.div
              className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px] my-6"
              variants={gridVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence mode="popLayout">
                {list.map((p, i) => (
                  <motion.div
                    key={p.id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                  >
                    <ProductCard
                      p={p}
                      index={i}
                      onClick={() => handleOpen(p)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* CTA con micro-animazione */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
            >
              <button className="btn btn-ghost" onClick={handleOrder}>
                Scopri come ordinare
              </button>
            </motion.div>
          </>
        )}
      </div>

      {/* Modal con AnimatePresence (richiede che il modal supporti framer-motion internamente; vedi nota sotto) */}
      <AnimatePresence>
        {open && (
          // Se non modifichi il componente Modal, puoi racchiuderlo in un motion.div trasparente per gestire exit
          <motion.div
            key="product-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProductModal product={open} onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
