import React, { useState } from "react";
import supabase from "../supabase/supabase-client";
import { ConfirmSchema, getErrors, getFieldError } from "../lib/validationForm";

export default function RegisterPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverOk, setServerOk] = useState("");

  const [formState, setFormState] = useState({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    setServerError("");
    setServerOk("");

    // 1) Validazione Zod
    const result = ConfirmSchema.safeParse(formState);
    if (!result.success) {
      setFormErrors(getErrors(result.error));
      return;
    }

    try {
      setLoading(true);

      // 2) Pre-check username per evitare unique_violation sul trigger
      const { data: existing, error: unameErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", formState.username)
        .maybeSingle();

      if (unameErr) {
        console.error("[Supabase] Username check error:", unameErr);
        // non blocco, ma segnalo
      }
      if (existing) {
        setFormErrors((prev) => ({ ...prev, username: "Username già in uso" }));
        setLoading(false);
        return;
      }

      // 3) Signup — aggiungi emailRedirectTo se la conferma email è attiva
      const { data, error } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, // importante se Email Confirmations è ON
          data: {
            username: formState.username,
            first_name: formState.firstName,
            last_name: formState.lastName,
            avatar_url: null,
          },
        },
      });

      // ---- LOG DIAGNOSTICO COMPLETO ----
      console.log("[Supabase] signUp response:", {
        data,
        error,
        user: data?.user,
        session: data?.session,
      });

      if (error) {
        // Messaggi chiari per i casi più comuni
        if (/rate limit|rate_limit/i.test(error.message)) {
          setServerError("Limite email raggiunto: riprova fra poco.");
        } else if (/invalid redirect/i.test(error.message)) {
          setServerError(
            "Redirect URL non autorizzato nelle impostazioni Auth."
          );
        } else if (/duplicate|unique/i.test(error.message)) {
          setServerError("Username già in uso.");
        } else {
          setServerError(error.message || "Errore durante la registrazione");
        }
        return;
      }

      // NB: con conferma email attiva, data.user c’è ma data.session è null
      setServerOk(
        "Registrazione riuscita! Controlla l'email per confermare l'account."
      );
      setFormErrors({});
    } catch (err) {
      console.error("[Supabase] signUp exception:", err);
      setServerError(err.message || "Errore durante la registrazione");
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
  };

  const setField = (property, valueSelector) => (e) => {
    setFormState((prev) => ({
      ...prev,
      [property]: valueSelector ? valueSelector(e) : e.target.value,
    }));
  };

  return (
    <div className="container-max px-4 py-10 md:pt-50 pt-20">
      <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-6 shadow-xl">
        <h1 className="text-xl font-extrabold text-white mb-4">
          Crea un account
        </h1>

        {serverError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {serverError}
          </div>
        )}
        {serverOk && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {serverOk}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="grid gap-3">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-white/80"
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formState.email}
            onChange={setField("email")}
            onBlur={onBlur("email")}
            aria-invalid={isInvalid("email")}
            required
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {formErrors.email && (
            <small className="text-red-300">{formErrors.email}</small>
          )}

          <label
            htmlFor="firstName"
            className="text-sm font-semibold text-white/80"
          >
            First Name:
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formState.firstName}
            onChange={setField("firstName")}
            onBlur={onBlur("firstName")}
            aria-invalid={isInvalid("firstName")}
            required
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {formErrors.firstName && (
            <small className="text-red-300">{formErrors.firstName}</small>
          )}

          <label
            htmlFor="lastName"
            className="text-sm font-semibold text-white/80"
          >
            Last Name:
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formState.lastName}
            onChange={setField("lastName")}
            onBlur={onBlur("lastName")}
            aria-invalid={isInvalid("lastName")}
            required
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {formErrors.lastName && (
            <small className="text-red-300">{formErrors.lastName}</small>
          )}

          <label
            htmlFor="username"
            className="text-sm font-semibold text-white/80"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formState.username}
            onChange={setField("username")}
            onBlur={onBlur("username")}
            aria-invalid={isInvalid("username")}
            required
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {formErrors.username && (
            <small className="text-red-300">{formErrors.username}</small>
          )}

          <label
            htmlFor="password"
            className="text-sm font-semibold text-white/80"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formState.password}
            onChange={setField("password")}
            onBlur={onBlur("password")}
            aria-invalid={isInvalid("password")}
            required
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {formErrors.password && (
            <small className="text-red-300">{formErrors.password}</small>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-white text-[#0a1020] font-extrabold px-4 py-2 hover:-translate-y-0.5 transition disabled:opacity-60"
          >
            {loading ? "Invio…" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
