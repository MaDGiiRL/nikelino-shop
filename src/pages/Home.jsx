import { Link } from "react-router-dom";
import CrewStrip from "../components/CrewStrip";
import logoImg from "../assets/logo-no-bg.png";

export default function Home() {
  return (
    <header className="relative min-h-[58vh] py-16 flex flex-col items-center">

      {/* Contenuto sopra */}
      <div className="relative z-10 container-max space-y-16 pb-12">
        <div className="flex flex-col items-center gap-12">
          {/* Logo tondo animato */}
          <div className="relative w-[140px] h-[140px]">
            <img
              src={logoImg}
              alt="Nikelino logo"
              className="w-full h-full object-cover rounded-full border border-white/20 shadow-deep animate-[float_6s_ease-in-out_infinite]"
            />
            <span className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,#60efff55,transparent_60%)] blur-xl animate-[pulse_3s_ease-in-out_infinite]" />
          </div>

          {/* Testo e CTA */}
          <div className="max-w-3xl text-center space-y-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black">NIKELINO</h1>
              <p className="text-white/80 mt-2 text-lg">
                Grafiche • Settaggi • Editing • FiveM Shop
              </p>
            </div>

            <p className="text-white/70 leading-relaxed">
              Studio creativo per <strong>FiveM</strong> e creator:{" "}
              <strong>tatuaggi</strong> e <strong>occhi custom</strong>,{" "}
              <strong>grafiche</strong>, <strong>intro</strong>,{" "}
              <strong>loghi</strong>, <strong>settaggi streaming</strong> e{" "}
              <strong>video editing</strong>. Lavori veloci, puliti e su misura,
              con supporto dedicato via Discord.
            </p>

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
          </div>
        </div>

        {/* Collaboratori */}
        <CrewStrip />

        {/* CTA finale */}
        <div className="flex justify-center mt-12">
          <Link to="/description" className="btn btn-ghost">
            Scopri Nikelino Shop
          </Link>
        </div>
      </div>
    </header>
  );
}
