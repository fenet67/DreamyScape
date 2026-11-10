import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { HiOutlineArrowRight } from "react-icons/hi2";

import AuthLayout from "../components/AuthLayout";
import AuthNotConfigured from "../components/AuthNotConfigured";
import {
  EmailField,
  FormError,
  GoogleButton,
  OrDivider,
  PasswordField,
} from "../components/AuthFields";
import { useAuth } from "../context/auth-context";

const SignIn = () => {
  const { configured, loading, user, signIn, signInWithGoogle } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from ?? "/dashboard";

  if (!loading && user) return <Navigate to={from} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim(), password);
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

  if (!configured) {
    return (
      <AuthLayout>
        <AuthNotConfigured />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      footer={
        <p className="mt-6 text-center text-sm text-ink-soft">
          New to DreamyScape?{" "}
          <Link
            to="/signup"
            state={{ from }}
            className="font-semibold text-gold-deep hover:text-caramel"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <div className="card p-7 sm:p-8">
        <span className="eyebrow">Welcome back</span>
        <h1 className="mt-4 font-display text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Your board, goals and streaks are right where you left them.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate={false}>
          <EmailField value={email} onChange={(event) => setEmail(event.target.value)} />
          <PasswordField
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Your password"
          />

          <FormError>{error}</FormError>

          <button type="submit" disabled={busy} className="btn-primary w-full !justify-center">
            {busy ? "Signing in…" : "Sign in"}
            <HiOutlineArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <OrDivider />

        <GoogleButton onClick={google} busy={busy} label="Sign in with Google" />

        <p className="mt-6 text-center text-xs text-ink-soft">
          <Link to="/" className="hover:text-ink">
            ← Back to DreamyScape
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
