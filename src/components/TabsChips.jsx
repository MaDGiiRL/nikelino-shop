import { div } from "framer-motion/client";

export function Tabs({ items, value, onChange, center = false, wrap = false }) {
  const base = [
    "flex gap-2 pr-1",
    wrap ? "flex-wrap" : "overflow-x-auto no-scrollbar snap-x snap-mandatory",
    center ? "justify-center" : "",
  ].join(" ");

  return (
    <div className="relative">
      <div className={base}>
        {items.map((c) => {
          const active = value === c;
          return (
            <button
              key={c}
              onClick={() => onChange(c)}
              className={[
                wrap ? "" : "snap-start",
                "px-3 py-2 rounded-full font-bold transition whitespace-nowrap",
                active
                  ? "bg-gradient-to-r from-[#60efff] to-[#28c8ff] text-[#0a1020]"
                  : "bg-white/10 text-white border border-white/20 hover:-translate-y-0.5",
              ].join(" ")}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Chips({
  items,
  value,
  onChange,
  align = "start", // "start" | "end"
  wrap = false,
}) {
  const base = [
    "flex gap-2",
    wrap ? "flex-wrap" : "overflow-x-auto no-scrollbar",
    align === "end" ? "justify-end" : "justify-start",
  ].join(" ");

  return (
    <div className={base}>
      {items.map((t) => {
        const active = value === t;
        return (
          <div className="py-3">
            <button
              key={t}
              onClick={() => onChange(t)}
              className={[
                "px-3 py-2 rounded-full font-bold transition whitespace-nowrap",
                active
                  ? "bg-gradient-to-r from-[#60efff] to-[#28c8ff] text-[#0a1020]"
                  : "bg-white/10 text-white border border-white/20 hover:-translate-y-0.5",
              ].join(" ")}
            >
              {t}
            </button>
          </div>
        );
      })}
    </div>
  );
}
