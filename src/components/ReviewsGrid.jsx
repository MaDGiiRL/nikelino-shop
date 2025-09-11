import { REVIEWS } from "../data/data";
import { motion } from "framer-motion";

// Helpers
const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

const extractStars = (text = "") => {
  const stars = (text.match(/⭐|🌟/g) || []).length;
  return Math.min(stars, 5);
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14, filter: "blur(3px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function ReviewsGrid() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 my-6"
    >
      {REVIEWS.map((r, i) => {
        const initials = getInitials(r.author);
        const stars = extractStars(r.text);

        return (
          <motion.article
            key={`${r.author}-${i}`}
            variants={item}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0b1324] to-[#0e1830] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            {/* bordo accent sottile */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#28c8ff]/40 to-transparent" />
            {/* header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center font-extrabold">
                  {initials || "?"}
                </div>
                <span className="absolute -inset-0.5 rounded-full ring-1 ring-[#28c8ff]/50 pointer-events-none" />
              </div>

              <div className="min-w-0">
                <div className="font-black truncate">{r.author}</div>
                <div className="text-[11px] text-white/60">{r.date || ""}</div>
              </div>

              {/* rating */}
              {stars > 0 && (
                <div className="ml-auto flex items-center gap-0.5 text-[#ffd166]">
                  {Array.from({ length: stars }).map((_, k) => (
                    <span key={k} aria-hidden>
                      ★
                    </span>
                  ))}
                  {Array.from({ length: Math.max(0, 5 - stars) }).map(
                    (_, k) => (
                      <span
                        key={`e-${k}`}
                        className="text-white/25"
                        aria-hidden
                      >
                        ★
                      </span>
                    )
                  )}
                </div>
              )}
            </div>

            {/* body */}
            <div className="p-4">
              <div className="relative">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="absolute -left-1 -top-1 w-5 h-5 text-white/15"
                  fill="currentColor"
                >
                  <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V21h8v-9.83A5.17 5.17 0 0 0 4.83 6H7.17ZM19.17 6A5.17 5.17 0 0 0 14 11.17V21h8v-9.83A5.17 5.17 0 0 0 16.83 6h2.34Z" />
                </svg>
                <p className="whitespace-pre-wrap leading-relaxed text-white/90 pl-5">
                  {r.text}
                </p>
              </div>
            </div>

            {/* footer subtle */}
            <div className="px-4 pb-4">
              <div className="h-px bg-white/10 mb-3" />
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}
