import { useEffect, useState } from "react";
import MediaCarousel from "./MediaCarousel";
import { Badge, BadgeSolid } from "./Badges";

export default function ProductModal({ product, onClose }) {
  const [index, setIndex] = useState(0);
  const total = product.media?.length ?? 0;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, onClose]);

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 backdrop-blur-md" onClick={onClose} />

      {/* dialog */}
      <div
        className="relative z-10 max-w-[1100px] mx-auto my-[5vh] grid grid-cols-1 md:grid-cols-2 min-h-[64vh]
                   overflow-hidden rounded-2xl border border-white/10 shadow-deep bg-gradient-to-b from-[#0b1324] to-[#0e1830]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close */}
        <button
          aria-label="Chiudi"
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-black shadow hover:scale-105 transition"
        >
          ✕
        </button>

        {/* Media + categorie/prezzo */}
        <div className="flex flex-col border-b md:border-b-0 md:border-r border-white/10">
          {/* Contenitore media: riempie lo spazio e permette il centraggio verticale */}
          <div className="relative flex-1 min-h-[260px]">
            <MediaCarousel
              media={product.media}
              index={index}
              onIndex={setIndex}
            />

            {/* FRECCE STILE BOOTSTRAP — sempre a metà della foto */}
            {total > 1 && (
              <>
                {/* Prev */}
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Immagine precedente"
                  className="absolute left-3 top-40 translate-y-1/2
                             w-11 h-11 rounded-full
                             flex items-center justify-center
                             bg-black/40 hover:bg-black/55
                             text-white backdrop-blur
                             ring-1 ring-white/20 hover:ring-white/40
                             transition focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  {/* Chevron sinistra */}
                  <svg
                    viewBox="0 0 16 16"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M10.354 1.646a.5.5 0 0 1 0 .708L5.707 7l4.647 4.646a.5.5 0 0 1-.708.708l-5-5a.5.5 0 0 1 0-.708l5-5a.5.5 0 0 1 .708 0z"
                    />
                  </svg>
                </button>

                {/* Next */}
                <button
                  type="button"
                  onClick={next}
                  aria-label="Immagine successiva"
                  className="absolute right-3 top-40 translate-y-1/2
                             w-11 h-11 rounded-full
                             flex items-center justify-center
                             bg-black/40 hover:bg-black/55
                             text-white backdrop-blur
                             ring-1 ring-white/20 hover:ring-white/40
                             transition focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  {/* Chevron destra */}
                  <svg
                    viewBox="0 0 16 16"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M5.646 1.646a.5.5 0 0 1 .708 0l5 5a.5.5 0 0 1 0 .708l-5 5a.5.5 0 1 1-.708-.708L10.293 7 5.646 2.354a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </button>

                {/* Indicatori */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {Array.from({ length: total }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index ? "w-5 bg-white/90" : "w-2 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Metadati sotto l'immagine */}
          <div className="flex items-center text-3xl gap-2 px-4 py-3 border-t border-white/10">
            <Badge>{product.category}</Badge>
            <BadgeSolid>{product.tag}</BadgeSolid>
            <span className="ml-auto font-black text-white">
              {product.price}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 md:p-7 overflow-y-auto">
          <h3 id="modal-title" className="text-3xl font-black m-0">
            {product.title}
          </h3>
          <p className="text-white/85 leading-relaxed mt-4">
            {product.details}
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              className="btn btn--ghost btn-ghost"
              href="https://discord.gg/BjHsyyta8r"
              target="_blank"
              rel="noreferrer"
            >
              Ordina su Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
