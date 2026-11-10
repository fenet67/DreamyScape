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

const SignUp = () => {
  const { configured, loading, user, signUp, signInWithGoogle } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from ?? "/dashboard";

  if (!loading && user) return <Navigate to={from} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Use at least 6 characters for your password.");
      return;
    }

    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      await signUp(email.trim(), password);
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
          Already have an account?{" "}
          <Link
            to="/signin"
            state={{ from }}
            className="font-semibold text-gold-deep hover:text-caramel"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="card p-7 sm:p-8">
        <span className="eyebrow">Get started</span>
        <h1 className="mt-4 font-display text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-ink-soft">
          One account keeps your dreams, goals and progress together.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <EmailField
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
          <PasswordField
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            hint="Six characters or more. Pick something you'll remember."
          />
          <PasswordField
            id="confirm-password"
            label="Confirm password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            placeholder="Type it again"
          />

          <FormError>{error}</FormError>

          <button type="submit" disabled={busy} className="btn-primary w-full !justify-center">
            {busy ? "Creating your account…" : "Create account"}
            <HiOutlineArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <OrDivider />

        <GoogleButton onClick={google} busy={busy} label="Sign up with Google" />

        <p className="mt-6 text-center text-xs text-ink-soft">
          Your goals and dreams are saved in this browser under your account.{" "}
          <Link to="/" className="hover:text-ink">
            Back to DreamyScape
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
