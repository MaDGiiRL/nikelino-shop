import { COLLABORATORS } from "../data/data";

export default function CrewStrip() {
  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {COLLABORATORS.map((c) => (
          <div
            key={c.name}
            className="text-2xl flex items-center gap-2 bg-gradient-to-b from-[#0b1324] to-[#0e1830] border border-white/10 rounded-full px-3 py-1.5"
          >
            <img
              src={c.avatar}
              alt={c.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
            />
            <span className="text-2xl font-extrabold">{c.name}</span>
            <span className="pt-1 text-xs text-white/60">{c.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
