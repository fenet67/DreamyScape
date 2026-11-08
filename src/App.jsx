import { lazy, Suspense, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";

// The landing page ships with the initial bundle; everything else loads on demand.
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Goals = lazy(() => import("./pages/Goals"));
const VisionBoard = lazy(() => import("./pages/VisionBoard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const NotFound = lazy(() => import("./pages/NotFound"));

const titles = {
  "/": "DreamyScape · Turn your dreams into reality",
  "/about": "About · DreamyScape",
  "/dashboard": "Dashboard · DreamyScape",
  "/goals": "Goals · DreamyScape",
  "/vision-board": "Vision Board · DreamyScape",
  "/achievements": "Achievements · DreamyScape",
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
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col min-h-screen">
        <RouteEffects />
        <Navbar />

        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/vision-board" element={<VisionBoard />} />
              <Route path="/achievements" element={<Achievements />} />
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
