import { motion } from "framer-motion";

export default function ProductCard({ p, onClick, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.06 }}
      className="card-surface overflow-hidden hover:-translate-y-2 hover:shadow-[0_36px_80px_rgba(0,0,0,0.66)] transition"
      onClick={onClick}
    >
      <div className="relative aspect-[16/10] bg-[#0b1220] cursor-pointer overflow-hidden">
        {p.media?.[0]?.type === "image" ? (
          <img
            src={p.media[0].src}
            alt={p.title}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <video
            src={p.media[0].src}
            muted
            className="w-full h-full object-cover"
          />
        )}
        <span className="badge badge-soft absolute left-2 top-2">{p.tag}</span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="font-black">{p.title}</div>
          <div className="ml-auto font-black">{p.price}</div>
        </div>
        <p className="text-sm text-white/75 mt-1 line-clamp-2">{p.short}</p>
        <div className="mt-2">
          <span className="badge badge-soft">{p.category}</span>
        </div>
      </div>
    </motion.article>
  );
}
