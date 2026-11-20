import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineFlag,
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineCalendarDays,
  HiOutlinePhoto,
} from "react-icons/hi2";
import ProgressBar from "../components/ProgressBar";
import { useAuth } from "../context/auth-context";
import { listPhotos } from "../lib/photoStore";
import {
  useLocalStorage,
  STORAGE_KEYS,
  normalizeDream,
  normalizeGoal,
} from "../hooks/useLocalStorage";

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

const formatDue = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const isOverdue = (date) =>
  Boolean(date) && new Date(`${date}T23:59:59`) < new Date();

const completedOn = (timestamp) =>
  timestamp
    ? `Done ${new Date(timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`
    : "Done";

const Dashboard = () => {
  const [goals] = useLocalStorage(STORAGE_KEYS.goals, [], { normalize: normalizeGoal });
  const [dreams] = useLocalStorage(STORAGE_KEYS.dreams, [], { normalize: normalizeDream });

  const { user } = useAuth();
  const owner = user?.uid ?? "guest";
  const [photos, setPhotos] = useState([]);

  // Cover photos live in IndexedDB; a dashboard without them looks the same.
  useEffect(() => {
    let active = true;

    listPhotos(owner)
      .then((records) => {
        if (active) setPhotos(records);
      })
      .catch((error) => {
        console.warn("DreamyScape: could not load cover photos", error);
      });

    return () => {
      active = false;
    };
  }, [owner]);

  const covers = photos.reduce((map, photo) => {
    if (photo.dreamId && photo.cover) map[photo.dreamId] = photo;
    return map;
  }, {});

  const coverPhotos = photos.filter((photo) => photo.dreamId && photo.cover);
  const coveredDreams = dreams.filter((dream) => covers[dream.id]).length;
  const unlinkedPhotos = photos.filter((photo) => !photo.dreamId).length;
  const coverSummary =
    dreams.length === 0
      ? "no dreams to attach them to yet"
      : `${coveredDreams} of ${dreams.length} dream${dreams.length === 1 ? "" : "s"} with a cover`;

  const totalGoals = goals.length;
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const inProgress = totalGoals - completedGoals;
  const progress = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  // Sits under the progress bar so the numbers come with a next step.
  const momentum =
    progress === 100
      ? "Every goal complete. Time to dream up the next one."
      : progress >= 50
        ? `More than halfway there — ${inProgress} goal${inProgress === 1 ? "" : "s"} to go.`
        : completedGoals === 0
          ? "The first checkmark is the hardest. Start with whichever goal feels easiest today."
          : `Off the mark — ${inProgress} goal${inProgress === 1 ? "" : "s"} to go. Small steps count.`;

  const dreamProgress = dreams.map((dream) => {
    const linked = goals.filter((goal) => goal.dreamId === dream.id);
    const done = linked.filter((goal) => goal.completed).length;
    return {
      id: dream.id,
      title: dream.title,
      total: linked.length,
      done,
      percent: linked.length === 0 ? 0 : Math.round((done / linked.length) * 100),
    };
  });

  const upcoming = goals
    .filter((goal) => !goal.completed && goal.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  const recentlyDone = goals
    .filter((goal) => goal.completed)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    .slice(0, 3);

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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-7">
          <h2 className="text-xl font-semibold mb-6">Overall progress</h2>
          <ProgressBar progress={progress} />
          <p className="text-sm text-ink-soft mt-4">
            {completedGoals} of {totalGoals} goal{totalGoals === 1 ? "" : "s"} complete.
          </p>
          <p className="mt-2 text-sm font-semibold text-gold-deep">{momentum}</p>
        </div>

        {upcoming.length > 0 && (
          <div className="card p-7">
            <h2 className="text-xl font-semibold mb-5">Next up</h2>
            <ul className="space-y-4">
              {upcoming.map((goal) => {
                const overdue = isOverdue(goal.dueDate);
                return (
                  <li key={goal.id}>
                    <Link
                      to="/goals"
                      className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-violet-tint/40"
                    >
                      <HiOutlineCalendarDays
                        size={18}
                        className={`mt-0.5 shrink-0 ${overdue ? "text-bloom" : "text-gold-deep"}`}
                      />
                      <div className="min-w-0">
                        <p className="truncate">{goal.title}</p>
                        <p
                          className={`text-xs mt-0.5 ${
                            overdue ? "font-semibold text-bloom" : "text-ink-soft"
                          }`}
                        >
                          Due {formatDue(goal.dueDate)}
                          {overdue ? " · overdue" : ""}
                        </p>
                      </div>
                      {covers[goal.dreamId] && (
                        <img
                          src={covers[goal.dreamId].src}
                          alt={covers[goal.dreamId].name}
                          loading="lazy"
                          className="ml-auto h-12 w-16 shrink-0 rounded-lg object-cover"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {recentlyDone.length > 0 && (
        <div className="card p-7 mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold">Recently completed</h2>
            <Link
              to="/achievements"
              className="text-sm font-semibold text-gold-deep hover:text-caramel transition-colors"
            >
              All achievements
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {recentlyDone.map((goal) => (
              <li
                key={goal.id}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-base/60 px-3 py-2.5"
              >
                <HiOutlineCheckCircle size={17} className="mt-0.5 shrink-0 text-gold-deep" />
                <div className="min-w-0">
                  <p className="truncate text-sm">{goal.title}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{completedOn(goal.completedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {photos.length > 0 && (
        <div className="card p-7 mt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Photos</h2>
              <p className="text-sm text-ink-soft">
                {photos.length} photo{photos.length === 1 ? "" : "s"} · {coverSummary}
                {unlinkedPhotos > 0 ? ` · ${unlinkedPhotos} not linked to a dream` : ""}
              </p>
            </div>
            <Link to="/photos" className="btn-secondary shrink-0 !px-4 !py-2 text-sm">
              <HiOutlinePhoto size={16} aria-hidden="true" />
              View photos
            </Link>
          </div>

          {coverPhotos.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {coverPhotos.slice(0, 4).map((photo) => (
                <li key={photo.id}>
                  <img
                    src={photo.src}
                    alt={photo.name}
                    loading="lazy"
                    className="h-14 w-20 rounded-lg object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {dreamProgress.length > 0 && (
        <div className="card p-7 mt-6">
          <h2 className="text-xl font-semibold mb-6">Progress by dream</h2>
          <ul className="space-y-5">
            {dreamProgress.map((dream) => (
              <li key={dream.id} className="flex items-center gap-3">
                {covers[dream.id] && (
                  <img
                    src={covers[dream.id].src}
                    alt={covers[dream.id].name}
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="font-semibold truncate">{dream.title}</h3>
                    <span className="text-sm text-ink-soft shrink-0">
                      {dream.total === 0 ? "No goals yet" : `${dream.done}/${dream.total} goals`}
                    </span>
                  </div>
                  <ProgressBar progress={dream.percent} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
