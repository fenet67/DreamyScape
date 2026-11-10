import { useEffect, useState } from "react";

import { isAuthConfigured, loadAuth } from "../lib/firebase";
import { AuthContext } from "./auth-context";

const MESSAGES = {
  "auth/invalid-credential": "That email and password don't match an account.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-password": "Enter your password.",
  "auth/weak-password": "Use at least 6 characters for your password.",
  "auth/email-already-in-use": "An account already exists for that email.",
  "auth/user-not-found": "That email and password don't match an account.",
  "auth/wrong-password": "That email and password don't match an account.",
  "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",
  "auth/popup-closed-by-user": "The sign-in window closed before it finished.",
  "auth/popup-blocked": "Your browser blocked the sign-in window.",
  "auth/network-request-failed": "Network problem — check your connection and try again.",
  "auth/operation-not-allowed": "That sign-in method isn't enabled in the Firebase console.",
  "auth/unauthorized-domain": "This domain isn't on the Firebase authorized domains list.",
};

const friendly = (error) =>
  MESSAGES[error?.code] ?? error?.message ?? "Something went wrong. Try again.";

// firebase/auth is loaded on demand; Vite puts it in a separate chunk.
const sdk = () => import("firebase/auth");

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isAuthConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthConfigured) return undefined;

    let active = true;
    let unsubscribe = () => {};

    (async () => {
      const auth = await loadAuth();
      if (!auth || !active) return;

      const { onAuthStateChanged } = await sdk();
      if (!active) return;

      unsubscribe = onAuthStateChanged(
        auth,
        (nextUser) => {
          setUser(nextUser);
          setLoading(false);
        },
        (authError) => {
          setError(friendly(authError));
          setLoading(false);
        },
      );
    })().catch((caught) => {
      if (!active) return;
      setError(friendly(caught));
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const run = async (action) => {
    setError(null);
    try {
      const auth = await loadAuth();
      await action(auth);
    } catch (caught) {
      // Callers show the friendly text; the original error stays attached for debugging.
      throw new Error(friendly(caught), { cause: caught });
    }
  };

  const value = {
    configured: isAuthConfigured,
    loading,
    user,
    error,
    signIn: (email, password) =>
      run(async (auth) => {
        const { signInWithEmailAndPassword } = await sdk();
        return signInWithEmailAndPassword(auth, email, password);
      }),
    signUp: (email, password) =>
      run(async (auth) => {
        const { createUserWithEmailAndPassword } = await sdk();
        return createUserWithEmailAndPassword(auth, email, password);
      }),
    signInWithGoogle: () =>
      run(async (auth) => {
        const { GoogleAuthProvider, signInWithPopup } = await sdk();
        return signInWithPopup(auth, new GoogleAuthProvider());
      }),
    signOut: () =>
      run(async (auth) => {
        const { signOut } = await sdk();
        return signOut(auth);
      }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
