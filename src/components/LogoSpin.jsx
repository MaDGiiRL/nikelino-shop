
import { motion } from "framer-motion";
import logoImg from "../assets/logo-no-bg.png";

const spinIn = {
  hidden: { opacity: 0, rotate: -180, scale: 0.5, y: 0 },
  show: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

export default function LogoSpin() {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        variants={spinIn}
        initial="hidden"
        animate="show"
        transition={{
          rotate: { duration: 1, ease: "easeOut" },
          scale: { duration: 0.6 },
          y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
        }}
        className="relative w-[200px] h-[200px]"
      >
        <img
          src={logoImg}
          alt="Nikelino logo"
          className="w-full h-full object-cover rounded-full"
        />
        <span className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,#60efff55,transparent_60%)] blur-xl animate-[pulse_3s_ease-in-out_infinite]" />
      </motion.div>
    </div>
  );
}
