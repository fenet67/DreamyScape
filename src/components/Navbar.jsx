import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/goals", label: "Goals" },
  { to: "/vision-board", label: "Vision Board" },
  { to: "/achievements", label: "Achievements" },
  { to: "/about", label: "About" },
];

const navLinkClass = ({ isActive }) =>
  `relative px-1 py-2 text-sm font-semibold transition-colors ${
    isActive ? "text-violet" : "text-ink-soft hover:text-ink"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-base/80 backdrop-blur-md">
      <nav className="container-page flex items-center justify-between py-4">
        <Logo />

        <ul className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={navLinkClass} end={link.to === "/"}>
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-violet"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <NavLink to="/goals" className="hidden md:inline-flex btn-primary !py-2.5 !px-5 text-sm">
          Add a goal
        </NavLink>

        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <HiOutlineXMark size={26} /> : <HiOutlineBars3 size={26} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-line bg-surface"
          >
            <ul className="container-page flex flex-col py-3">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block py-3 text-base font-semibold ${
                        isActive ? "text-violet" : "text-ink-soft"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;