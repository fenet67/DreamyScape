import { Link } from "react-router-dom";
import { HiOutlineSparkles } from "react-icons/hi2";

const NotFound = () => {
  return (
    <div className="container-page py-28 text-center">
      <div className="h-14 w-14 rounded-2xl bg-violet-tint flex items-center justify-center text-violet mx-auto mb-6">
        <HiOutlineSparkles size={26} />
      </div>
      <h1 className="font-display text-4xl font-semibold mb-3">
        This page drifted off
      </h1>
      <p className="text-ink-soft max-w-sm mx-auto mb-8">
        We couldn't find what you were looking for. Let's get you back on track.
      </p>
      <Link to="/" className="btn-primary">
        Back home
      </Link>
    </div>
  );
};

export default NotFound;