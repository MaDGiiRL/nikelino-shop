import { NavLink } from "react-router-dom";

const linkBase =
  "navbtn px-3 py-2 font-extrabold rounded-xl border border-white/30 text-white/90 hover:-translate-y-0.5 transition duration-150";

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 surface-blur h-[64px]">
      <div className="container-max h-full flex items-center justify-center gap-3">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive ? "bg-white text-[#0a1020] border-0" : "bg-white/10"
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive ? "bg-white text-[#0a1020] border-0" : "bg-white/10"
            }`
          }
        >
          Products
        </NavLink>
        <NavLink
          to="/description"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive ? "bg-white text-[#0a1020] border-0" : "bg-white/10"
            }`
          }
        >
          About Me
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `navbtn ${
              isActive
                ? "bg-white text-[#0a1020] border-0"
                : "bg-white/10 border border-white/30 text-white/90 hover:-translate-y-0.5 transition duration-150"
            }`
          }
        >
          Admin
        </NavLink>
        <a
          href="https://discord.gg/BjHsyyta8r"
          target="_blank"
          rel="noreferrer"
          className="navbtn px-3 py-2 font-extrabold rounded-xl border border-white/30 bg-white text-[#0a1020] hover:-translate-y-0.5 transition duration-150"
        >
          Discord
        </a>
      </div>
    </nav>
  );
}
