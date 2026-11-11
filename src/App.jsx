import { lazy, Suspense, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";

import { useAuth } from "./context/auth-context";

// The landing page ships with the initial bundle; everything else loads on demand.
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Goals = lazy(() => import("./pages/Goals"));
const VisionBoard = lazy(() => import("./pages/VisionBoard"));
const Photos = lazy(() => import("./pages/Photos"));
const Achievements = lazy(() => import("./pages/Achievements"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const NotFound = lazy(() => import("./pages/NotFound"));

const titles = {
  "/": "DreamyScape · Turn your dreams into reality",
  "/about": "About · DreamyScape",
  "/dashboard": "Dashboard · DreamyScape",
  "/goals": "Goals · DreamyScape",
  "/vision-board": "Vision Board · DreamyScape",
  "/photos": "Photos · DreamyScape",
  "/achievements": "Achievements · DreamyScape",
  "/signin": "Sign in · DreamyScape",
  "/signup": "Create your account · DreamyScape",
};

const RouteEffects = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = titles[pathname] ?? "Page not found · DreamyScape";
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const RouteFallback = () => (
  <div className="container-page py-24 text-center text-sm text-ink-soft" role="status">
    Loading…
  </div>
);

function App() {
  const { user } = useAuth();

  return (
    <MotionConfig reducedMotion="user">
      {/* Remounting on sign-in/out makes every page re-read its scoped storage key. */}
      <div key={user?.uid ?? "guest"} className="flex flex-col min-h-screen">
        <RouteEffects />
        <Navbar />

        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/goals"
                element={
                  <RequireAuth>
                    <Goals />
                  </RequireAuth>
                }
              />
              <Route
                path="/vision-board"
                element={
                  <RequireAuth>
                    <VisionBoard />
                  </RequireAuth>
                }
              />
              <Route
                path="/photos"
                element={
                  <RequireAuth>
                    <Photos />
                  </RequireAuth>
                }
              />
              <Route
                path="/achievements"
                element={
                  <RequireAuth>
                    <Achievements />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}

export default App;
