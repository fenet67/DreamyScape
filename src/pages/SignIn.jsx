import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { HiOutlineArrowRight } from "react-icons/hi2";

import { useAuth } from "../context/auth-context";

const fieldClass =
  "w-full border border-line bg-base p-3 rounded-xl text-ink outline-none focus:border-violet transition-colors";

const ENV_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

const SignIn = () => {
  const { configured, loading, user, signIn, signUp, signInWithGoogle } = useAuth();
  const location = useLocation();

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from ?? "/dashboard";
  const isSignUp = mode === "signup";

  if (!loading && user) return <Navigate to={from} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignUp) await signUp(email.trim(), password);
      else await signIn(email.trim(), password);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-16 max-w-md">
      <span className="eyebrow">Your space</span>
      <h1 className="mt-5 font-display text-4xl font-semibold">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-3 text-ink-soft">
        {isSignUp
          ? "One account keeps your dreams and goals together, on this device."
          : "Sign in to pick up where you left off."}
      </p>

      {!configured ? (
        <div className="card p-6 mt-8">
          <h2 className="font-semibold text-lg mb-2">Sign-in isn't switched on yet</h2>
          <p className="text-sm text-ink-soft mb-4">
            Add your Firebase web app config as environment variables, then restart the dev
            server and redeploy:
          </p>
          <ul className="text-xs font-mono space-y-1 text-ink">
            {ENV_VARS.map((name) => (
              <li key={name} className="rounded-lg border border-line bg-base px-3 py-1.5">
                {name}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-soft">
            Until then DreamyScape stays open in guest mode and saves to this browser only.
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="card p-6 mt-8 space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClass}
                placeholder={isSignUp ? "At least 6 characters" : "Your password"}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm font-semibold text-bloom">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full !justify-center">
              {busy ? "One moment…" : isSignUp ? "Create account" : "Sign in"}
              <HiOutlineArrowRight size={18} aria-hidden="true" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-5" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="btn-secondary w-full !justify-center"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-sm text-ink-soft">
            {isSignUp ? "Already have an account?" : "New to DreamyScape?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignUp ? "signin" : "signup");
                setError("");
              }}
              className="font-semibold text-gold-deep hover:text-caramel"
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </p>

          <p className="mt-6 text-xs text-ink-soft">
            Your goals and dreams are stored in this browser under your account.
          </p>
        </>
      )}
    </div>
  );
};

export default SignIn;
