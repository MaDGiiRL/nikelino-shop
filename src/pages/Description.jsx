import { motion } from "framer-motion";
import ReviewsGrid from "../components/ReviewsGrid";

const fadeUp = {
  initial: { opacity: 0, y: 14, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function Description() {
  return (
    <section className="space-y-10 px-25">
      {/* Hero titolo descrizione */}
      <motion.div {...fadeUp} className="text-center space-y-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="text-2xl md:text-3xl font-black text-center">
            📖 About Me
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <p className="text-white/70 max-w-2xl mx-auto">
          Servizi creativi per FiveM, streamer e creator: qualità, velocità e
          supporto dedicato.
        </p>
      </motion.div>

      {/* Due blocchi lingua, in griglia responsive */}
      <div className="grid gap-5 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* IT */}
        <motion.article
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.06 }}
          className="card-surface p-5 md:p-6 space-y-5"
        >
          <header className="space-y-2">
            <h3 className="font-black text-2xl">
              Benvenuto nel mondo di Nikelino Shop!
            </h3>
            <p className="text-white/80">
              Cerchi tattoo personalizzati, grafiche uniche, montaggi video e
              molto altro? 🎮 Se sei su FiveM o uno streamer che vuole
              distinguersi… sei nel posto giusto!
            </p>
          </header>

          <blockquote className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
            <p className="mb-3">
              🖌️ <strong className="font-extrabold">Cosa offriamo</strong>
            </p>
            <ul className="space-y-2">
              {[
                "Tatuaggi personalizzati per FiveM",
                "Occhi custom (inclusi nei tattoo o singoli)",
                "Grafiche esclusive",
                "Settaggi per streaming (YouTube, Twitch ecc.)",
                "Intro personalizzate",
                "Loghi e design su misura",
                "Servizio professionale di editing video",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-[#28c8ff]" />
                  <span className="text-[#d8e7f3] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 text-[#d8e7f3]">
              <p>🤝 Supporto dedicato e partnership aperte.</p>
              <p>
                📍 Ti aspettiamo anche in live con <strong>NikeLino_K</strong>:
                unisciti a noi e trasforma le tue idee in realtà!
              </p>
            </div>
          </blockquote>

          <footer className="flex flex-wrap items-center gap-3 pt-2">
            <a
              className="btn btn--ghost btn-ghost"
              href="https://discord.gg/BjHsyyta8r"
              target="_blank"
              rel="noreferrer"
            >
              Entra nel Discord
            </a>
            <span className="text-white/50 text-sm">
              || @everyone @here || —{" "}
              <a
                href="https://discord.gg/BjHsyyta8r"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white transition"
              >
                https://discord.gg/BjHsyyta8r
              </a>
            </span>
          </footer>
        </motion.article>

        {/* EN */}
        <motion.article
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.12 }}
          className="card-surface p-5 md:p-6 space-y-5"
        >
          <header className="space-y-2">
            <h3 className="font-black text-2xl">
              Welcome to the world of Nikelino Shop!
            </h3>
            <p className="text-white/80">
              Looking for custom tattoos, unique graphics, video edits and more?
              🎮 Whether you're into FiveM or streaming — you’re in the right
              place!
            </p>
          </header>

          <blockquote className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
            <p className="mb-3">
              🖌️ <strong className="font-extrabold">What we offer</strong>
            </p>
            <ul className="space-y-2">
              {[
                "Custom tattoos for FiveM",
                "Custom eyes (included or standalone)",
                "Exclusive graphics",
                "Streaming settings (YouTube, Twitch, etc.)",
                "Personalized intros",
                "Custom logos & branding",
                "Professional video editing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-[#28c8ff]" />
                  <span className="text-[#d8e7f3] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 text-[#d8e7f3]">
              <p>🤝 Dedicated support and open to partnerships.</p>
              <p>
                📍 Join our creative world — we’re live with{" "}
                <strong>NikeLino_K</strong> and ready to turn your ideas into
                reality!
              </p>
            </div>
          </blockquote>

          <footer className="flex flex-wrap items-center gap-3 pt-2">
            <a
              className="btn btn--ghost btn-ghost"
              href="https://discord.gg/BjHsyyta8r"
              target="_blank"
              rel="noreferrer"
            >
              Join the Discord
            </a>
            <span className="text-white/50 text-sm">
              || @everyone @here || —{" "}
              <a
                href="https://discord.gg/BjHsyyta8r"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white transition"
              >
                https://discord.gg/BjHsyyta8r
              </a>
            </span>
          </footer>
        </motion.article>
      </div>

      {/* Divider morbido + heading recensioni */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.18 }}
        className="pt-2"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="text-2xl md:text-3xl font-black text-center">
            💬 Recensioni
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Hint riassunto (opzionale) */}
        <p className="text-white/70 text-center max-w-2xl mx-auto mb-4">
          Feedback reali dei clienti: qualità, velocità e cura del dettaglio.
        </p>

        <ReviewsGrid />
      </motion.div>
    </section>
  );
}
