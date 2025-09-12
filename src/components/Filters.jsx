import { useEffect, useState } from "react";
import { Tabs, Chips } from "./TabsChips";
import SearchBox from "./SearchBox";

export default function Filters({
  categories = [],
  cat,
  setCat = () => {},
  tag,
  setTag = () => {},
  search,
  setSearch = () => {},
  // opzionali: se non passati, uso un fallback interno
  status,
  setStatus,
}) {
  const [open, setOpen] = useState(false);

  const mainTags = ["Tutte", "Fantasy", "Modern", "Altro"];
  const otherCategories = categories;

  // ===== Stato "status" robusto (fallback interno) =====
  const [internalStatus, setInternalStatus] = useState("tutti");
  const statusValue =
    typeof status === "string" && status.length ? status : internalStatus;
  const setStatusSafe =
    typeof setStatus === "function" ? setStatus : setInternalStatus;

  useEffect(() => {
    if (typeof status === "string") setInternalStatus(status);
  }, [status]);

  // mapping etichetta <-> valore
  const STATUS_ITEMS = [
    { label: "Tutti", value: "tutti" },
    { label: "In vendita", value: "in_vendita" },
    { label: "Venduto", value: "venduto" },
  ];
  const statusLabels = STATUS_ITEMS.map((s) => s.label);
  const statusLabel =
    STATUS_ITEMS.find((s) => s.value === statusValue)?.label || "Tutti";
  const onStatusChange = (label) => {
    const v = STATUS_ITEMS.find((s) => s.label === label)?.value || "tutti";
    setStatusSafe(v);
  };

  function resetAll() {
    setCat("Tutte");
    setTag("Tutte");
    setSearch("");
    setStatusSafe("tutti");
  }

  // blocca lo scroll della pagina quando il drawer è aperto
  useEffect(() => {
    const html = document.documentElement;
    if (open) html.classList.add("overflow-hidden");
    else html.classList.remove("overflow-hidden");
    return () => html.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <div className="sticky top-[64px] z-40 surface-blur border-b border-white/10">
      <div className="container-max py-3 flex flex-col gap-3">
        {/* DESKTOP (md+): riga 1 (chips+search a destra) */}
        <div className="hidden md:flex items-center gap-3 justify-end">
          <Chips items={mainTags} value={tag} onChange={setTag} align="end" />
          <SearchBox value={search} onChange={setSearch} />
        </div>

        {/* DESKTOP (md+): riga 2 (tutte le categorie centrate) */}
        <div className="hidden md:flex justify-center mt-5">
          <Tabs
            items={otherCategories}
            value={cat}
            onChange={setCat}
            center
            wrap
          />
        </div>

        {/* DESKTOP (md+): riga 3 (stato a destra) */}
        <div className="hidden md:flex items-center justify-end mt-2">
          <Chips
            items={statusLabels}
            value={statusLabel}
            onChange={onStatusChange}
            align="end"
          />
        </div>

        {/* MOBILE: bottone che apre il drawer */}
        <div className="flex md:hidden items-center justify-end">
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-2 rounded-full border border-white/20 text-white/90"
            aria-label="Apri filtri"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="filters-drawer"
          >
            Filtri
          </button>
        </div>
      </div>

      {/* DRAWER MOBILE */}
      {open && (
        <>
          {/* Overlay */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Chiudi filtri"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <aside
            id="filters-drawer"
            role="dialog"
            aria-modal="true"
            className="fixed left-0 top-0 z-[60] h-[100dvh] w-full sm:w-[85%] sm:max-w-[360px]
                       bg-gradient-to-b from-[#0b1324] to-[#0e1830] border-r border-white/10
                       shadow-deep flex flex-col"
          >
            {/* Header drawer */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold">Filtri</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-white text-[#0a1020] font-bold"
                title="Chiudi"
              >
                ✕
              </button>
            </div>

            {/* Contenuto scrollabile */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-[env(safe-area-inset-bottom)]">
              {/* chips principali + search */}
              <div className="space-y-3">
                <Chips
                  items={mainTags}
                  value={tag}
                  onChange={setTag}
                  center
                  wrap
                />
                <SearchBox value={search} onChange={setSearch} full />
              </div>

              {/* categorie */}
              <div className="space-y-2">
                <div className="text-sm text-white/70 text-center">
                  Categorie
                </div>
                <Tabs
                  items={otherCategories}
                  value={cat}
                  onChange={setCat}
                  center
                  wrap
                />
              </div>

              {/* stato */}
              <div className="space-y-2">
                <div className="text-sm text-white/70 text-center">Stato</div>
                <Chips
                  items={statusLabels}
                  value={statusLabel}
                  onChange={onStatusChange}
                  center
                  wrap
                />
              </div>
            </div>

            {/* Azioni */}
            <div className="p-4 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={resetAll}
                className="px-3 py-2 rounded-full text-sm border border-white/20 text-white/80"
              >
                Reset
              </button>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto btn btn-primary"
              >
                Applica
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
