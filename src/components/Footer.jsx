import logoImg from "../assets/logo-no-bg.png";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/20 mt-10">
      <div className="container-max px-4">
        <div
          className="flex flex-col items-center text-center gap-4 py-6
                        md:flex-row md:items-center md:justify-between md:text-left md:gap-6"
        >
          {/* Logo + Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src={logoImg}
              alt="logo"
              className="w-8 sm:w-9 md:w-10 h-auto rounded-full"
            />
            <span className="text-white/80 font-medium">Nikelino Shop</span>
          </div>

          {/* Links + Year */}
          <div
            className="flex flex-col items-center gap-2 text-white/80 text-sm md:text-base
                          md:items-end md:text-right"
          >

            <span className="leading-snug break-words">
              © {year} Developed with <span className="text-red-400">❤</span> by{" "}
              <span className="font-semibold">MadGiiRL</span> &amp; Design by{" "}
              <span className="font-semibold">Nikelino</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
