import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineFlag, HiOutlineCheck, HiOutlineTrash } from "react-icons/hi2";
import { useLocalStorage, STORAGE_KEYS } from "../hooks/useLocalStorage";

const Goals = () => {
  const [title, setTitle] = useState("");
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.goals, []);

  const addGoal = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setGoals([...goals, { id: Date.now(), title: title.trim(), completed: false }]);
    setTitle("");
  };

  const toggleComplete = (id) => {
    setGoals(
      goals.map((goal) => (goal.id === id ? { ...goal, completed: !goal.completed } : goal))
    );
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  return (
    <div className="container-page py-14 max-w-3xl">
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Goals</h1>
      <p className="text-ink-soft mb-10">
        The concrete, checkable steps behind your bigger dreams.
      </p>

      <form onSubmit={addGoal} className="flex gap-3 mb-10">
        <input
          type="text"
          placeholder="e.g. Finish the AWS certification"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-line bg-surface p-3.5 rounded-xl flex-1 outline-none focus:border-violet transition-colors"
        />
        <button type="submit" className="btn-primary shrink-0">
          Add goal
        </button>
      </form>

      {goals.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="h-12 w-12 rounded-xl bg-violet-tint flex items-center justify-center text-violet mx-auto mb-4">
            <HiOutlineFlag size={22} />
          </div>
          <h2 className="font-semibold text-lg mb-1">No goals yet</h2>
          <p className="text-ink-soft text-sm">Add your first one above to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {goals.map((goal) => (
              <motion.li
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="card p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleComplete(goal.id)}
                    aria-pressed={goal.completed}
                    aria-label={goal.completed ? "Mark as not complete" : "Mark as complete"}
                    className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      goal.completed
                        ? "bg-violet border-violet text-white"
                        : "border-line text-transparent"
                    }`}
                  >
                    <HiOutlineCheck size={15} strokeWidth={3} />
                  </button>
                  <h3
                    className={`truncate ${
                      goal.completed ? "line-through text-ink-soft" : "text-ink"
                    }`}
                  >
                    {goal.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => deleteGoal(goal.id)}
                  aria-label={`Delete goal: ${goal.title}`}
                  className="shrink-0 p-2 text-ink-soft hover:text-bloom transition-colors"
                >
                  <HiOutlineTrash size={19} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default Goals;