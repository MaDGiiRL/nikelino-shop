import logoImg from "../assets/logo-no-bg.png";
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/20 mt-10 footer">
      <div className="container-max flex flex-col md:flex-row items-center justify-between py-5 text-white/80 gap-3">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
            <img
            src={logoImg}
            alt="logo"
            className="w-8 rounded-full"
          />
          <span>Nikelino Shop</span>
        </div>

        {/* Links + Year */}
        <div className="flex items-center gap-2 text-sm">
          <a
            href="https://discord.gg/BjHsyyta8r"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Discord
          </a>
          <span>•</span>
          <span>
            © {year} Developed with <span className="text-red-400">❤</span> by{" "}
            <span className="font-semibold">MadGiiRL</span> &amp; Design by{" "}
            <span className="font-semibold">Nikelino</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
