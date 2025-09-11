import { useEffect, useRef } from "react";

export default function MediaCarousel({ media, index, onIndex }) {
  const viewportRef = useRef(null);

  useEffect(() => {
    // focus video on change
    const node = viewportRef.current?.querySelector("video");
    if (node) {
      node.pause();
      node.currentTime = 0;
    }
  }, [index]);

  if (!media?.length) return <div className="p-4">Nessun media</div>;
  const active = media[index];

  return (
    <div className="relative bg-[#0a1020]">
      <div ref={viewportRef} className="grid place-items-center w-full">
        {active.type === "image" ? (
          <img
            src={active.src}
            alt="media"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={active.src}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="absolute left-0 right-0 bottom-0 flex gap-2 p-2 overflow-x-auto bg-gradient-to-b from-transparent to-black/60">
        {media.map((m, i) => (
          <button
            key={i}
            onClick={() => onIndex(i)}
            className={`w-[68px] h-[68px] rounded-xl overflow-hidden border ${
              i === index ? "border-white" : "border-white/40"
            }`}
          >
            {m.type === "image" ? (
              <img src={m.src} className="w-full h-full object-cover" />
            ) : (
              <video
                src={m.src}
                muted
                loop
                className="w-full h-full object-cover"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
