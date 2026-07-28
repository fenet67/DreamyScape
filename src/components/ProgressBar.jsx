import { motion } from "framer-motion";
const ProgressBar = ({ progress = 0, label }) => {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2 text-sm font-semibold text-ink-soft">
          <span>{label}</span>
          <span className="text-violet">{safeProgress}%</span>
        </div>
      )}

      <div className="relative w-full h-3 rounded-full bg-violet-tint overflow-visible">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet to-sky"
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.div
          className="absolute top-1/2 h-4 w-4 rounded-full bg-surface border-2 border-violet shadow-soft"
          initial={{ left: 0 }}
          animate={{ left: `calc(${safeProgress}% - 8px)` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ translate: "0 -50%" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;