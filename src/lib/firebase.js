// Web app config is public by design; secrets never live in a client bundle.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Without keys the app stays in guest mode instead of crashing on load. This
// check only reads env vars, so unconfigured builds never download the SDK.
export const isAuthConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

let authPromise = null;

// Firebase Auth is a sizeable chunk, so it loads on demand the first time
// something actually needs it, and is shared afterwards. Everything here is
// imported dynamically so the SDK stays out of the entry bundle.
export const loadAuth = () => {
  if (!isAuthConfigured) return Promise.resolve(null);

  authPromise ??= (async () => {
    const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ]);

    const app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
    return getAuth(app);
  })();

  return authPromise;
};
