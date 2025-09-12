// src/pages/LoginPage.jsx
import React, { useState } from "react";
import supabase from "../supabase/supabase-client";
import Swal from "sweetalert2";
import {
  ConfirmSchemaLogin,
  getErrors,
  getFieldError,
} from "../lib/validationForm";
import LogoSpin from "../components/LogoSpin";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({ email: "", password: "" });

  // ===== Variants (coerenti con RegisterPage) =====
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
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
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

    // 1) Validazione
    const result = ConfirmSchemaLogin.safeParse(formState);
    if (!result.success) {
      setFormErrors(getErrors(result.error));
      return;
    }

    try {
      setLoading(true);

      // 2) Login
      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      });
      if (error) {
        let msg = error.message || "Credenziali non valide.";
        if (/email not confirmed|confirm/i.test(msg)) {
          msg =
            "Email non confermata. Controlla la posta e conferma l'account.";
        }
        await Swal.fire({ icon: "error", title: "Accesso fallito", text: msg });
        return;
      }

      // ✅ Successo
      await Swal.fire({
        icon: "success",
        title: "Bentornato!",
        text: "Accesso effettuato correttamente.",
        confirmButtonText: "Vai alla Home",
      });

      window.location.replace("/");
    } catch (err) {
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
    return undefined; // evita aria-invalid="false"
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
        {/* Logo con fade-in leggero */}
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
          Accedi
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
                  key="login"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  Login
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
