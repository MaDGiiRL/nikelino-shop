import { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import Swal from "sweetalert2";
import { supabase } from "../supabase/supabase-client";

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
      <h1 className="text-5xl md:text-6xl font-black text-center py-10">
        Prodotti
      </h1>

      <Filters
        categories={STATIC_CATEGORIES}
        cat={cat}
        setCat={setCat}
        tag={tag}
        setTag={setTag}
        search={search}
        setSearch={setSearch}
      />

      <div className="container-max">
        {loading ? (
          <div className="py-10 text-center text-white/70">Caricamento…</div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px] my-6">
              {list.map((p, i) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  index={i}
                  onClick={() => handleOpen(p)}
                />
              ))}
            </div>

            <div className="flex justify-center mb-8">
              <button className="btn btn-ghost" onClick={handleOrder}>
                Scopri come ordinare
              </button>
            </div>
          </>
        )}
      </div>

      {open && <ProductModal product={open} onClose={handleClose} />}
    </section>
  );
}
