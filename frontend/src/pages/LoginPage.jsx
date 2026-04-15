import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const LoginPage = () => {
  const { user, login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isSignup) {
        await signup({ fullName: form.fullName, email: form.email, password: form.password });
      } else {
        await login({ email: form.email, password: form.password });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 via-white to-teal-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-100 bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-slate-900">Retail IMS</h1>
        <p className="mt-1 text-sm text-slate-600">{isSignup ? "Create account" : "Login to continue"}</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {isSignup && (
            <input
              className="w-full rounded-lg border border-brand-100 px-3 py-2 outline-none focus:border-brand-500"
              placeholder="Full name"
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
          )}
          <input
            className="w-full rounded-lg border border-brand-100 px-3 py-2 outline-none focus:border-brand-500"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-brand-100 px-3 py-2 outline-none focus:border-brand-500"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-3 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Please wait..." : isSignup ? "Create account" : "Login"}
          </button>
        </form>

        <button
          className="mt-4 text-sm text-brand-600 hover:text-brand-700"
          onClick={() => setIsSignup((prev) => !prev)}
        >
          {isSignup ? "Already have an account? Login" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
