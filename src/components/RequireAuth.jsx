import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/auth-context";

// Gates a page behind sign-in — but only once auth is configured, so the app
// keeps working as a local-only notebook until Firebase keys are added.
const RequireAuth = ({ children }) => {
  const { configured, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-page py-24 text-center text-sm text-ink-soft" role="status">
        Checking your session…
      </div>
    );
  }

  if (configured && !user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;
