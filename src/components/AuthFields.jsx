import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";

import { fieldClass, labelClass } from "../lib/authForm";

export const EmailField = ({
  id = "email",
  value,
  onChange,
  autoComplete = "email",
  placeholder = "you@example.com",
}) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      Email
    </label>
    <input
      id={id}
      type="email"
      required
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={fieldClass}
    />
  </div>
);

export const PasswordField = ({
  id = "password",
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  placeholder = "Your password",
  minLength = 6,
  hint,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${fieldClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-soft transition-colors hover:text-ink"
        >
          {visible ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
};

export const GoogleButton = ({ onClick, busy, label = "Continue with Google" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    className="btn-secondary w-full !justify-center gap-3"
  >
    <FcGoogle size={18} aria-hidden="true" />
    {label}
  </button>
);

export const FormError = ({ children }) =>
  children ? (
    <p role="alert" className="rounded-xl bg-clay/10 px-3 py-2 text-sm font-semibold text-bloom">
      {children}
    </p>
  ) : null;

export const OrDivider = () => (
  <div className="my-5 flex items-center gap-3" aria-hidden="true">
    <span className="h-px flex-1 bg-line" />
    <span className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">or</span>
    <span className="h-px flex-1 bg-line" />
  </div>
);
