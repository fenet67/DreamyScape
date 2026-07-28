import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineFlag,
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiOutlineSparkles,
} from "react-icons/hi2";
import ProgressBar from "../components/ProgressBar";
import { useLocalStorage, STORAGE_KEYS } from "../hooks/useLocalStorage";

const StatCard = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="card p-6"
  >
    <div className="h-10 w-10 rounded-lg bg-violet-tint flex items-center justify-center text-violet mb-4">
      <Icon size={20} />
    </div>
    <p className="text-sm text-ink-soft">{label}</p>
    <p className="text-4xl font-display font-semibold mt-1">{value}</p>
  </motion.div>
);

const Dashboard = () => {
  const [goals] = useLocalStorage(STORAGE_KEYS.goals, []);
  const [dreams] = useLocalStorage(STORAGE_KEYS.dreams, []);

  const totalGoals = goals.length;
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const inProgress = totalGoals - completedGoals;
  const progress = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  if (totalGoals === 0 && dreams.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <div className="h-14 w-14 rounded-2xl bg-violet-tint flex items-center justify-center text-violet mx-auto mb-6">
          <HiOutlineSparkles size={26} />
        </div>
        <h1 className="font-display text-3xl font-semibold mb-3">Nothing to show yet</h1>
        <p className="text-ink-soft max-w-sm mx-auto mb-8">
          Your dashboard fills in once you add a dream or a goal. Start with
          whichever feels easier.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/goals" className="btn-primary">
            Add a goal
          </Link>
          <Link to="/vision-board" className="btn-secondary">
            Add a dream
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-10">Dashboard</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <StatCard icon={HiOutlineFlag} label="Total goals" value={totalGoals} delay={0} />
        <StatCard icon={HiOutlineCheckCircle} label="Completed" value={completedGoals} delay={0.05} />
        <StatCard icon={HiOutlineChartBar} label="In progress" value={inProgress} delay={0.1} />
        <StatCard icon={HiOutlineSparkles} label="Dreams" value={dreams.length} delay={0.15} />
      </div>

      <div className="card p-7">
        <h2 className="text-xl font-semibold mb-6">Overall progress</h2>
        <ProgressBar progress={progress} />
        <p className="text-sm text-ink-soft mt-4">
          {completedGoals} of {totalGoals} goal{totalGoals === 1 ? "" : "s"} complete.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;