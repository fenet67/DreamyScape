import { createContext, useContext } from "react";

const notConfigured = async () => {
  throw new Error("Sign-in is not configured yet.");
};

// The default keeps components usable outside the provider (and in guest mode).
const GUEST = {
  configured: false,
  loading: false,
  user: null,
  signIn: notConfigured,
  signUp: notConfigured,
  signInWithGoogle: notConfigured,
  signOut: async () => {},
};

export const AuthContext = createContext(GUEST);

export const useAuth = () => useContext(AuthContext);
