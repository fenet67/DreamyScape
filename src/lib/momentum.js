// Goals already store when they were finished, so the week's tally and the run
// of days both come from the same timestamps — no extra state to keep.
// One entry per calendar day that has at least one finished goal.
export const completionDays = (goals) => {
  const days = new Map();

  goals.forEach((goal) => {
    if (!goal.completedAt) return;
    const key = new Date(goal.completedAt).toDateString();
    days.set(key, (days.get(key) ?? 0) + 1);
  });

  return days;
};

// The longest run of consecutive days with a finish, for the record books.
export const longestStreak = (goals) => {
  const days = [...completionDays(goals).keys()]
    .map((key) => new Date(key))
    .sort((a, b) => a - b);

  let best = 0;
  let run = 0;
  let previous = null;

  days.forEach((day) => {
    // Rounded so daylight-saving days (23 or 25 hours) still count as one.
    const step = previous ? Math.round((day - previous) / 86400000) : null;
    run = step === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  });

  return best;
};

export const streakStats = (goals) => {
  // The week runs Monday to Sunday, and today counts.
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  const finishedThisWeek = goals.filter(
    (goal) => goal.completedAt && new Date(goal.completedAt) >= weekStart,
  ).length;

  const finishedDays = new Set(
    goals
      .filter((goal) => goal.completedAt)
      .map((goal) => new Date(goal.completedAt).toDateString()),
  );

  // A streak stays alive until today ends, so it only breaks once a day is missed.
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  if (!finishedDays.has(day.toDateString())) day.setDate(day.getDate() - 1);

  let streak = 0;
  while (finishedDays.has(day.toDateString())) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }

  return { finishedThisWeek, streak };
};
