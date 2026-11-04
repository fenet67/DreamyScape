import { Link } from "react-router-dom";

const Logo = ({ className = "" }) => {
  return (
    <Link to="/" className={`shrink-0 ${className}`} aria-label="DreamyScape home">
      <span className="font-display text-xl font-semibold tracking-tight text-ink">
        DreamyScape
      </span>
    </Link>
  );
};

export default Logo;
