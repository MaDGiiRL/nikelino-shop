import React, { useState } from "react";
import supabase from "../supabase/supabase-client";
import {
  ConfirmSchemaLogin,
  getErrors,
  getFieldError,
} from "../lib/validationForm";

export default function LoginPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [formState, setFormState] = useState({ email: "", password: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    setServerError("");

    const result = ConfirmSchemaLogin.safeParse(formState);
    if (!result.success) {
      setFormErrors(getErrors(result.error));
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      });
      if (error) throw error;
      // navigate('/') se vuoi
    } catch (err) {
      setServerError(err.message || "Credenziali non valide");
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
        <h1 className="text-xl font-extrabold text-white mb-4">Accedi</h1>
        {serverError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {serverError}
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
            {loading ? "Invio…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
