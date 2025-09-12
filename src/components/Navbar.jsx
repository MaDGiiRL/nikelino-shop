import logoImg from "../assets/logo-no-bg.png";

import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import SessionContext from "../context/SessionContext";
import supabase from "../supabase/supabase-client"; // default export

// Link base
const linkBase =
  "navbtn px-3 py-2 font-extrabold rounded-xl border border-white/30 text-white/90 hover:-translate-y-0.5 transition duration-150 whitespace-nowrap";
const linkClasses = (isActive) =>
  `${linkBase} ${
    isActive ? "bg-white/10 text-[#0a1020] border-0" : "bg-white/10"
  }`;

const menuBase =
  "origin-top rounded-2xl border border-white/15 bg-[rgba(10,16,32,0.97)] text-white/90 shadow-2xl backdrop-blur-xl transition-all";
const menuOpenCls = "opacity-100 scale-100 pointer-events-auto";
const menuClosedCls = "opacity-0 scale-95 pointer-events-none";
const itemBase =
  "block w-full text-left rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/10";

export default function Navbar() {
  const [pagesOpen, setPagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pagesRef = useRef(null);
  const profileRef = useRef(null);

  const ctx = useContext(SessionContext) || {};
  const session = ctx.session || null;
  const ctxProfile = ctx.profile || null;

  const user = session?.user || null;
  const isAuthed = !!user?.id;

  const [profile, setProfile] = useState(ctxProfile);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    if (!isAuthed) {
      setProfile(null);
      return;
    }
    if (ctxProfile) {
      setProfile(ctxProfile);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, is_admin, avatar_url, username")
        .eq("id", user.id)
        .single();
      if (!cancelled) {
        if (!error) setProfile(data || null);
        setLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed, user?.id, ctxProfile]);

  useEffect(() => {
    setAvatarBroken(false);
  }, [profile?.avatar_url, ctxProfile?.avatar_url]);

  const isAdmin = !!(ctxProfile?.is_admin ?? profile?.is_admin);

  const displayName =
    ctxProfile?.username ||
    profile?.username ||
    user?.user_metadata?.username ||
    user?.email ||
    "Account";

  const initial = (displayName?.[0] || "S").toString().toUpperCase();

  const avatarUrl =
    ctxProfile?.avatar_url ||
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    null;

  useEffect(() => {
    function onClickOutside(e) {
      if (pagesRef.current && !pagesRef.current.contains(e.target)) {
        setPagesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setPagesOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setProfileOpen(false);
    }
  };

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-14 lg:h-16 bg-[rgba(10,16,32,0.55)] backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10"
      aria-label="Primary"
    >
      <div className="container-max h-full flex items-center gap-2 px-3">
        {/* Brand */}
        <NavLink
          to="/"
          className="font-black tracking-tight text-white/95 text-lg lg:text-xl select-none"
        >
          <img src={logoImg} alt="logo" className="w-18 rounded-full" />
          <span className="sr-only">Home</span>
        </NavLink>

        {/* Area centrale: desktop link inline / mobile dropdown */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          {/* Desktop (>=lg): link inline */}
          <div className="hidden lg:flex items-center justify-center gap-4 ms-30">
            <NavLink to="/" className={({ isActive }) => linkClasses(isActive)}>
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) => linkClasses(isActive)}
            >
              Products
            </NavLink>
            <NavLink
              to="/description"
              className={({ isActive }) => linkClasses(isActive)}
            >
              About Me
            </NavLink>
            <a
              href="https://discord.gg/BjHsyyta8r"
              target="_blank"
              rel="noreferrer"
              className="navbtn px-3 py-2 font-extrabold rounded-xl border border-white/30 bg-white/20 text-[#0a1020] hover:-translate-y-0.5 transition duration-150"
            >
              Discord
            </a>
          </div>

          {/* Mobile (<lg): dropdown Pages con stesso stile del Profile */}
          <div className="lg:hidden relative" ref={pagesRef}>
            <button
              type="button"
              onClick={() => setPagesOpen((v) => !v)}
              aria-expanded={pagesOpen}
              aria-haspopup
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white/90 hover:bg-white/15 transition shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
                aria-hidden
              >
                <path d="M3.75 6.75h16.5a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5zm0 6h16.5a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5zm0 6h16.5a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5z" />
              </svg>
              <span className="font-extrabold">Menu</span>
              <svg
                className={`h-4 w-4 transition-transform ${
                  pagesOpen ? "rotate-180" : "rotate-0"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
              </svg>
            </button>

            <div
              role="menu"
              aria-label="Mobile pages menu"
              className={`absolute left-0 right-0 mt-2 ${menuBase} ${
                pagesOpen ? menuOpenCls : menuClosedCls
              }`}
            >
              <div className="p-2 grid gap-1">
                <NavLink
                  to="/"
                  onClick={() => setPagesOpen(false)}
                  className={({ isActive }) =>
                    `${itemBase} ${
                      isActive ? "bg-white/10 text-[#0a1020]" : ""
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/products"
                  onClick={() => setPagesOpen(false)}
                  className={({ isActive }) =>
                    `${itemBase} ${
                      isActive ? "bg-white/10 text-[#0a1020]" : ""
                    }`
                  }
                >
                  Products
                </NavLink>
                <NavLink
                  to="/description"
                  onClick={() => setPagesOpen(false)}
                  className={({ isActive }) =>
                    `${itemBase} ${
                      isActive ? "bg-white/10 text-[#0a1020]" : ""
                    }`
                  }
                >
                  About Me
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setPagesOpen(false)}
                    className={({ isActive }) =>
                      `${itemBase} ${
                        isActive ? "bg-white/10 text-[#0a1020]" : ""
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                )}
                <div className="my-1 h-px bg-white/10" />
                <a
                  href="https://discord.gg/BjHsyyta8r"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl px-3 py-2 text-sm font-semibold bg-white/10 text-[#0a1020]"
                >
                  Discord
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Account dropdown */}
        <div className="relative ml-auto" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-haspopup
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-white/90 hover:bg-white/15 transition"
          >
            {/* Avatar o iniziale */}
            {isAuthed && avatarUrl && !avatarBroken ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-white/20"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <span
                aria-hidden
                className="grid place-items-center w-8 h-8 rounded-full bg-white text-[#0a1020] font-extrabold"
              >
                {initial}
              </span>
            )}

            <span className="hidden sm:inline text-sm font-semibold">
              {isAuthed ? displayName : "Account"}
            </span>
            <svg
              className={`h-4 w-4 transition-transform ${
                profileOpen ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </button>

          <div
            role="menu"
            aria-label="Profile menu"
            className={`absolute right-0 mt-2 w-56 ${menuBase} ${
              profileOpen ? menuOpenCls : menuClosedCls
            }`}
          >
            <div className="p-2">
              {isAuthed ? (
                <>
                  <NavLink
                    to="/account"
                    onClick={() => setProfileOpen(false)}
                    className={({ isActive }) =>
                      `${itemBase} ${
                        isActive ? "bg-white/10 text-[#0a1020]" : ""
                      }`
                    }
                  >
                    Account
                  </NavLink>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className={({ isActive }) =>
                        `${itemBase} ${
                          isActive ? "bg-white/10 text-[#0a1020]" : ""
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                  )}
                  <div className="my-1 h-px bg-white/10" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
                  >
                    Esci
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setProfileOpen(false)}
                    className={({ isActive }) =>
                      `${itemBase} ${
                        isActive ? "bg-white/10 text-[#0a1020]" : ""
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setProfileOpen(false)}
                    className={({ isActive }) =>
                      `${itemBase} ${
                        isActive ? "bg-white/10 text-[#0a1020]" : ""
                      }`
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
