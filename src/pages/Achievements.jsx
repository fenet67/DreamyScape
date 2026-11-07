import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiOutlineTrophy } from "react-icons/hi2";
import {
  useLocalStorage,
  STORAGE_KEYS,
  normalizeGoal,
} from "../hooks/useLocalStorage";

const formatCompleted = (timestamp) => {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Achievements = () => {
  const [goals] = useLocalStorage(STORAGE_KEYS.goals, [], { normalize: normalizeGoal });
  const completedGoals = goals
    .filter((goal) => goal.completed)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Achievements</h1>
      <p className="text-ink-soft mb-10">Every goal you've followed through on.</p>

      {completedGoals.length === 0 ? (
        <div className="card p-10 text-center max-w-md">
          <div className="h-12 w-12 rounded-xl bg-violet-tint flex items-center justify-center text-violet mx-auto mb-4">
            <HiOutlineTrophy size={22} />
          </div>
          <h2 className="font-semibold text-lg mb-1">No achievements yet</h2>
          <p className="text-ink-soft text-sm mb-6">
            Complete a goal and it'll show up here.
          </p>
          <Link to="/goals" className="btn-secondary">
            Go to goals
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {completedGoals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="card p-6 flex items-start gap-4"
            >
              <div className="h-11 w-11 rounded-xl bg-violet-tint flex items-center justify-center text-violet shrink-0">
                <HiOutlineTrophy size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{goal.title}</h2>
                <p className="text-sm text-ink-soft mt-1">
                  {formatCompleted(goal.completedAt)
                    ? `Completed ${formatCompleted(goal.completedAt)}`
                    : "Goal completed."}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;
