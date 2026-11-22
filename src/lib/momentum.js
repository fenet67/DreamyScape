// Goals already store when they were finished, so the week's tally and the run
// of days both come from the same timestamps — no extra state to keep.
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
