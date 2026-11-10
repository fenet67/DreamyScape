const NOT_CONFIGURED_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

const AuthNotConfigured = () => (
  <div className="card p-7 sm:p-8">
    <span className="eyebrow">Almost there</span>
    <h1 className="mt-4 font-display text-3xl font-semibold">Sign-in isn't switched on yet</h1>
    <p className="mt-3 text-sm text-ink-soft">
      Add your Firebase web app config as environment variables, then restart the dev
      server and redeploy:
    </p>
    <ul className="mt-4 space-y-1.5 font-mono text-xs text-ink">
      {NOT_CONFIGURED_VARS.map((name) => (
        <li key={name} className="rounded-lg border border-line bg-base px-3 py-1.5">
          {name}
        </li>
      ))}
    </ul>
    <p className="mt-4 text-xs text-ink-soft">
      Until then DreamyScape stays open in guest mode and saves to this browser only.
    </p>
  </div>
);

export default AuthNotConfigured;
