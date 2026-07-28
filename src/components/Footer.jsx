import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line mt-24 bg-surface">
      <div className="container-page py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-ink-soft max-w-xs">
            A quiet place to write down what you're working toward, and watch
            it turn into something you finished.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/dashboard" className="text-ink-soft hover:text-violet transition-colors">
            Dashboard
          </Link>
          <Link to="/goals" className="text-ink-soft hover:text-violet transition-colors">
            Goals
          </Link>
          <Link to="/vision-board" className="text-ink-soft hover:text-violet transition-colors">
            Vision Board
          </Link>
          <Link to="/about" className="text-ink-soft hover:text-violet transition-colors">
            About
          </Link>
        </nav>

       
          <a href="https://github.com/fenet67/DreamyScape"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-violet transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 19 19" fill="none" aria-hidden="true">
            <use href="/icons.svg#github-icon" />
          </svg>
          View source
        </a>
      </div>

      <div className="border-t border-line">
        <p className="container-page py-5 text-xs text-ink-soft">
          © {year} DreamyScape. Built as a portfolio project.
        </p>
      </div>
    </footer>
  );
};

export default Footer;