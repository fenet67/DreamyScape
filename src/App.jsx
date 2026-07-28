import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import VisionBoard from "./pages/VisionBoard";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/vision-board" element={<VisionBoard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;