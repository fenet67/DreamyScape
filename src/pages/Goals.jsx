import { useEffect, useState } from "react";

const Goals = () => {
  const [title, setTitle] = useState("");

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("dreamyscape-goals");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "dreamyscape-goals",
      JSON.stringify(goals)
    );
  }, [goals]);

  const addGoal = () => {
    if (!title.trim()) return;

    const newGoal = {
      id: Date.now(),
      title,
      completed: false,
    };

    setGoals([...goals, newGoal]);
    setTitle("");
  };

  const toggleComplete = (id) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed: !goal.completed,
            }
          : goal
      )
    );
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-5xl font-bold mb-10">
        Goals
      </h1>

      <div className="flex gap-3 mb-10">
        <input
          type="text"
          placeholder="Add a goal"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="border p-3 rounded-lg flex-1"
        />

        <button
          onClick={addGoal}
          className="border px-6 rounded-lg"
        >
          Add
        </button>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="border rounded-xl p-5 flex justify-between items-center"
          >
            <div>
              <h3
                className={
                  goal.completed
                    ? "line-through"
                    : ""
                }
              >
                {goal.title}
              </h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  toggleComplete(goal.id)
                }
                className="border px-4 py-2 rounded-lg"
              >
                {goal.completed
                  ? "Undo"
                  : "Complete"}
              </button>

              <button
                onClick={() =>
                  deleteGoal(goal.id)
                }
                className="border px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;