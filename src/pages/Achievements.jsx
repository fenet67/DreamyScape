const Achievements = () => {
  const goals =
    JSON.parse(
      localStorage.getItem(
        "dreamyscape-goals"
      )
    ) || [];

  const completedGoals = goals.filter(
    (goal) => goal.completed
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-5xl font-bold mb-10">
        Achievements
      </h1>

      {completedGoals.length === 0 ? (
        <div className="border rounded-xl p-8 text-center">
          No achievements yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {completedGoals.map((goal) => (
            <div
              key={goal.id}
              className="border rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold">
                {goal.title}
              </h2>

              <p className="mt-3">
                Goal completed successfully.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;