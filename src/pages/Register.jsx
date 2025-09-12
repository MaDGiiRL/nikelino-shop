// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import supabase from "../supabase/supabase-client";
import Swal from "sweetalert2";
import { ConfirmSchema, getErrors, getFieldError } from "../lib/validationForm";
import LogoSpin from "../components/LogoSpin";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });

  // ====== Variants Framer Motion ======
  const pageV = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const cardV = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const fieldsV = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const itemV = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  };

  const buttonTap = { scale: 0.98, y: 1 };
  const buttonHover = { y: -2 };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);

    // 1) Validazione Zod
    const result = ConfirmSchema.safeParse(formState);
    if (!result.success) {
      setFormErrors(getErrors(result.error));
      return;
    }

    try {
      setLoading(true);

      // 2) Pre-check username per evitare unique_violation
      const { data: existing, error: unameErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", formState.username)
        .maybeSingle();

      if (unameErr) {
        console.error("[Supabase] Username check error:", unameErr);
      }
      if (existing) {
        setFormErrors((prev) => ({ ...prev, username: "Username già in uso" }));
        await Swal.fire({
          icon: "warning",
          title: "Username già in uso",
          text: "Scegline un altro.",
        });
        setLoading(false);
        return;
      }

      // 3) Signup
      const { data, error } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: formState.username,
            first_name: formState.firstName,
            last_name: formState.lastName,
            avatar_url: null,
          },
        },
      });

      console.log("[Supabase] signUp response:", {
        data,
        error,
        user: data?.user,
        session: data?.session,
      });

      if (error) {
        let msg =
          error.message ||
          "Errore durante la registrazione. Riprova più tardi.";
        if (/rate limit|rate_limit/i.test(msg)) {
          msg = "Limite email raggiunto: riprova fra poco.";
        } else if (/invalid redirect/i.test(msg)) {
          msg = "Redirect URL non autorizzato nelle impostazioni Auth.";
        } else if (/duplicate|unique/i.test(msg)) {
          msg = "Username già in uso.";
        }

        await Swal.fire({
          icon: "error",
          title: "Registrazione fallita",
          text: msg,
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Registrazione riuscita!",
        text: "Benvenuto! Verrai reindirizzato alla Home.",
        confirmButtonText: "Vai alla Home",
      });

      window.location.replace("/");
    } catch (err) {
      console.error("[Supabase] signUp exception:", err);
      await Swal.fire({
        icon: "error",
        title: "Errore imprevisto",
        text: err.message || "Qualcosa è andato storto. Riprova.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onBlur = (property) => () => {
    const message = getFieldError(property, formState[property]);
    setFormErrors((prev) => ({ ...prev, [property]: message }));
    setTouchedFields((prev) => ({ ...prev, [property]: true }));
  };

  const isInvalid = (property) => {
    if (formSubmitted || touchedFields[property]) {
      return !!formErrors[property];
    }
    return undefined;
    // (undefined evita aria-invalid="false")
  };

  const setField = (property, valueSelector) => (e) => {
    setFormState((prev) => ({
      ...prev,
      [property]: valueSelector ? valueSelector(e) : e.target.value,
    }));
  };

  return (
    <motion.div
      className="container-max px-4 py-10 md:pt-50 pt-20"
      variants={pageV}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={cardV}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-md rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-6 shadow-xl"
      >
        {/* Logo con leggero float verticale */}
        <motion.div
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-4"
        >
          <LogoSpin />
        </motion.div>

        <motion.h1
          className="text-xl font-extrabold text-white mb-4 text-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          Crea un account
        </motion.h1>

        <motion.form
          onSubmit={onSubmit}
          noValidate
          className="grid gap-3"
          variants={fieldsV}
          initial="hidden"
          animate="show"
        >
          {/* Email */}
          <motion.label
            variants={itemV}
            htmlFor="email"
            className="text-sm font-semibold text-white/80"
          >
            Email:
          </motion.label>
          <motion.input
            variants={itemV}
            type="email"
            id="email"
            name="email"
            value={formState.email}
            onChange={setField("email")}
            onBlur={onBlur("email")}
            aria-invalid={isInvalid("email")}
            required
            whileFocus={{ scale: 1.01 }}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <AnimatePresence mode="popLayout">
            {formErrors.email && (
              <motion.small
                key="err-email"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-red-300"
              >
                {formErrors.email}
              </motion.small>
            )}
          </AnimatePresence>

          {/* First Name */}
          <motion.label
            variants={itemV}
            htmlFor="firstName"
            className="text-sm font-semibold text-white/80"
          >
            First Name:
          </motion.label>
          <motion.input
            variants={itemV}
            type="text"
            id="firstName"
            name="firstName"
            value={formState.firstName}
            onChange={setField("firstName")}
            onBlur={onBlur("firstName")}
            aria-invalid={isInvalid("firstName")}
            required
            whileFocus={{ scale: 1.01 }}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <AnimatePresence mode="popLayout">
            {formErrors.firstName && (
              <motion.small
                key="err-firstName"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-red-300"
              >
                {formErrors.firstName}
              </motion.small>
            )}
          </AnimatePresence>

          {/* Last Name */}
          <motion.label
            variants={itemV}
            htmlFor="lastName"
            className="text-sm font-semibold text-white/80"
          >
            Last Name:
          </motion.label>
          <motion.input
            variants={itemV}
            type="text"
            id="lastName"
            name="lastName"
            value={formState.lastName}
            onChange={setField("lastName")}
            onBlur={onBlur("lastName")}
            aria-invalid={isInvalid("lastName")}
            required
            whileFocus={{ scale: 1.01 }}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <AnimatePresence mode="popLayout">
            {formErrors.lastName && (
              <motion.small
                key="err-lastName"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-red-300"
              >
                {formErrors.lastName}
              </motion.small>
            )}
          </AnimatePresence>

          {/* Username */}
          <motion.label
            variants={itemV}
            htmlFor="username"
            className="text-sm font-semibold text-white/80"
          >
            Username:
          </motion.label>
          <motion.input
            variants={itemV}
            type="text"
            id="username"
            name="username"
            value={formState.username}
            onChange={setField("username")}
            onBlur={onBlur("username")}
            aria-invalid={isInvalid("username")}
            required
            whileFocus={{ scale: 1.01 }}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <AnimatePresence mode="popLayout">
            {formErrors.username && (
              <motion.small
                key="err-username"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-red-300"
              >
                {formErrors.username}
              </motion.small>
            )}
          </AnimatePresence>

          {/* Password */}
          <motion.label
            variants={itemV}
            htmlFor="password"
            className="text-sm font-semibold text-white/80"
          >
            Password:
          </motion.label>
          <motion.input
            variants={itemV}
            type="password"
            id="password"
            name="password"
            value={formState.password}
            onChange={setField("password")}
            onBlur={onBlur("password")}
            aria-invalid={isInvalid("password")}
            required
            whileFocus={{ scale: 1.01 }}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <AnimatePresence mode="popLayout">
            {formErrors.password && (
              <motion.small
                key="err-password"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-red-300"
              >
                {formErrors.password}
              </motion.small>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            variants={itemV}
            whileHover={!loading ? buttonHover : {}}
            whileTap={!loading ? buttonTap : {}}
            className="mt-2 rounded-xl bg-white text-[#0a1020] font-extrabold px-4 py-2 hover:-translate-y-0.5 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            <AnimatePresence initial={false} mode="wait">
              {loading ? (
                <motion.span
                  key="sending"
                  className="inline-flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.span
                    aria-hidden
                    className="inline-block w-4 h-4 rounded-full border-2 border-[#0a1020]"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                    style={{ borderRightColor: "transparent" }}
                  />
                  Invio…
                </motion.span>
              ) : (
                <motion.span
                  key="signup"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  Sign Up
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
