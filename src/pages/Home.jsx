import { Link } from "react-router-dom";
import CrewStrip from "../components/CrewStrip";
import logoImg from "../assets/logo-no-bg.png";
import { motion } from "framer-motion";

export default function Home() {
  const page = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemUp = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 70, damping: 16 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  };

  // Logo: gira in entrata, poi passa a fluttuare in loop con Framer
  const spinIn = {
    hidden: { opacity: 0, rotate: -180, scale: 0.5, y: 0 },
    show: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={page}
      className="relative min-h-[58vh] py-16 flex flex-col items-center"
    >
      <motion.span
        variants={fadeIn}
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(40,200,255,.08),transparent_55%)]"
      />

      <div className="relative z-10 container-max space-y-16 pb-12">
        <motion.div
          variants={page}
          className="flex flex-col items-center gap-12"
        >
          {/* Logo animato: gira all'entrata e poi fluttua */}
          <motion.div
            variants={spinIn}
            animate={{
              opacity: 1,
              rotate: 0,
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{
              rotate: { duration: 1, ease: "easeOut" },
              scale: { duration: 0.6 },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
            }}
            className="relative w-[140px] h-[140px]"
          >
            <img
              src={logoImg}
              alt="Nikelino logo"
              className="w-full h-full object-cover rounded-full border border-white/20 shadow-deep"
            />
            <span className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,#60efff55,transparent_60%)] blur-xl animate-[pulse_3s_ease-in-out_infinite]" />
          </motion.div>

          <motion.div
            variants={itemUp}
            className="max-w-3xl text-center space-y-6"
          >
            <motion.div variants={itemUp}>
              <h1 className="text-5xl md:text-6xl font-black">Nikelino Shop</h1>
              <p className="text-white/80 mt-2 text-lg">
                Grafiche • Settaggi • Editing • FiveM Shop
              </p>
            </motion.div>

            <motion.p
              variants={itemUp}
              className="text-white/70 leading-relaxed"
            >
              Studio creativo per <strong>FiveM</strong> e creator:{" "}
              <strong>tatuaggi</strong> e <strong>occhi custom</strong>,{" "}
              <strong>grafiche</strong>, <strong>intro</strong>,{" "}
              <strong>loghi</strong>, <strong>settaggi streaming</strong> e{" "}
              <strong>video editing</strong>. Lavori veloci, puliti e su misura,
              con supporto dedicato via Discord.
            </motion.p>

            {/* Bottoni lasciati statici per non buggare animazioni CSS */}
            <div className="flex justify-center gap-4 mt-6">
              <Link to="/products" className="btn btn-ghost">
                Vai ai Products
              </Link>
              <a
                className="btn btn-primary"
                href="https://discord.gg/BjHsyyta8r"
                target="_blank"
                rel="noreferrer"
              >
                Entra nel Discord
              </a>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemUp}>
          <CrewStrip />
        </motion.div>

        <motion.div variants={itemUp} className="flex justify-center mt-12">
          <Link to="/description" className="btn btn-ghost">
            Scopri Nikelino Shop
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}
