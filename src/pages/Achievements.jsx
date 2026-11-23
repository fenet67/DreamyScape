import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineFire,
  HiOutlineTrophy,
} from "react-icons/hi2";

import {
  useLocalStorage,
  STORAGE_KEYS,
  normalizeDream,
  normalizeGoal,
} from "../hooks/useLocalStorage";
import { completionDays, longestStreak, streakStats } from "../lib/momentum";

const CALENDAR_WEEKS = 12;

const formatCompleted = (timestamp) => {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const startOfDay = (date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

// Mon–Sun columns ending this week, so the grid reads like a wall calendar.
const buildCalendar = (days) => {
  const end = startOfDay(new Date());
  const start = new Date(end);
  start.setDate(start.getDate() - (CALENDAR_WEEKS * 7 - 1));
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const cells = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const key = cursor.toDateString();
    cells.push({
      key,
      count: days.get(key) ?? 0,
      label: cursor.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
  }

  return cells;
};

const shade = (count) =>
  count === 0
    ? "bg-line/60"
    : count === 1
      ? "bg-gold/40"
      : count === 2
        ? "bg-gold/70"
        : "bg-gold-deep";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card p-5">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-tint text-violet">
      <Icon size={18} aria-hidden="true" />
    </div>
    <p className="text-xs text-ink-soft">{label}</p>
    <p className="mt-0.5 font-display text-3xl font-semibold">{value}</p>
  </div>
);

const Achievements = () => {
  const [goals] = useLocalStorage(STORAGE_KEYS.goals, [], { normalize: normalizeGoal });
  const [dreams] = useLocalStorage(STORAGE_KEYS.dreams, [], { normalize: normalizeDream });

  const completedGoals = goals
    .filter((goal) => goal.completed)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  const { streak, finishedThisWeek } = streakStats(goals);
  const best = longestStreak(goals);
  const days = completionDays(goals);
  const cells = buildCalendar(days);
  const activeDays = cells.filter((cell) => cell.count > 0).length;

  // A dream counts as complete only when it has goals and all of them are done.
  const finishedDreams = dreams.filter((dream) => {
    const linked = goals.filter((goal) => goal.dreamId === dream.id);
    return linked.length > 0 && linked.every((goal) => goal.completed);
  }).length;

  const milestones = [
    {
      id: "first",
      label: "First finish",
      detail: "Complete your first goal",
      earned: completedGoals.length >= 1,
    },
    {
      id: "five",
      label: "Five down",
      detail: "Complete 5 goals",
      earned: completedGoals.length >= 5,
    },
    {
      id: "twelve",
      label: "A dozen",
      detail: "Complete 12 goals",
      earned: completedGoals.length >= 12,
    },
    {
      id: "twentyfive",
      label: "Twenty-five",
      detail: "Complete 25 goals",
      earned: completedGoals.length >= 25,
    },
    {
      id: "week",
      label: "Week streak",
      detail: "Finish something 7 days in a row",
      earned: best >= 7,
    },
    {
      id: "month",
      label: "Month streak",
      detail: "Finish something 30 days in a row",
      earned: best >= 30,
    },
    {
      id: "dream",
      label: "Dream complete",
      detail: "Finish every goal under one dream",
      earned: finishedDreams >= 1,
    },
  ];

  const earnedCount = milestones.filter((milestone) => milestone.earned).length;

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
            {goals.length === 0
              ? "Add a goal first — checking one off is what earns a place here."
              : `You have ${goals.length} goal${goals.length === 1 ? "" : "s"} to finish. Check one off and it lands here.`}
          </p>
          <Link to="/goals" className="btn-secondary">
            {goals.length === 0 ? "Add a goal" : "Go to goals"}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
            <StatCard icon={HiOutlineCheckCircle} label="Goals finished" value={completedGoals.length} />
            <StatCard icon={HiOutlineCalendarDays} label="Finished this week" value={finishedThisWeek} />
            <StatCard icon={HiOutlineFire} label="Day streak" value={streak} />
            <StatCard icon={HiOutlineTrophy} label="Best streak" value={best} />
          </div>

          <div className="card p-6 mb-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold">The last {CALENDAR_WEEKS} weeks</h2>
              <span className="text-sm text-ink-soft">
                {activeDays} day{activeDays === 1 ? "" : "s"} with a finish
              </span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div
                className="grid w-max grid-flow-col grid-rows-7 gap-1"
                role="img"
                aria-label={`Completion calendar for the last ${CALENDAR_WEEKS} weeks: ${activeDays} days with a finished goal.`}
              >
                {cells.map((cell) => (
                  <span
                    key={cell.key}
                    title={
                      cell.count === 0
                        ? `Nothing finished on ${cell.label}`
                        : `${cell.count} goal${cell.count === 1 ? "" : "s"} finished on ${cell.label}`
                    }
                    className={`h-3 w-3 rounded-[3px] ${shade(cell.count)}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
              <span>Nothing</span>
              {[0, 1, 2, 3].map((count) => (
                <span key={count} className={`h-3 w-3 rounded-[3px] ${shade(count)}`} />
              ))}
              <span>More</span>
            </div>
          </div>

          <div className="card p-6 mb-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold">Milestones</h2>
              <span className="text-sm text-ink-soft">
                {earnedCount} of {milestones.length} earned
              </span>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {milestones.map((milestone) => (
                <li
                  key={milestone.id}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${
                    milestone.earned
                      ? "border-gold/40 bg-gold-tint/50"
                      : "border-line bg-base/40"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      milestone.earned
                        ? "bg-gold text-[#33200f]"
                        : "bg-line/40 text-ink-soft"
                    }`}
                  >
                    <HiOutlineTrophy size={17} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        milestone.earned ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {milestone.label}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">{milestone.detail}</p>
                  </div>
                  <span className="sr-only">{milestone.earned ? "Earned" : "Not earned yet"}</span>
                </li>
              ))}
            </ul>
          </div>

          <h2 className="mb-4 text-xl font-semibold">Every finish</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {completedGoals.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="card p-6 flex items-start gap-4"
              >
                <div className="h-11 w-11 rounded-xl bg-violet-tint flex items-center justify-center text-violet shrink-0">
                  <HiOutlineTrophy size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <p className="text-sm text-ink-soft mt-1">
                    {formatCompleted(goal.completedAt)
                      ? `Completed ${formatCompleted(goal.completedAt)}`
                      : "Goal completed."}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Achievements;
