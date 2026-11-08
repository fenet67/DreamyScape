import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineFlag,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import UndoToast from "../components/UndoToast";
import {
  useLocalStorage,
  STORAGE_KEYS,
  createId,
  normalizeDream,
  normalizeGoal,
} from "../hooks/useLocalStorage";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

const formatDue = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const isOverdue = (date, completed) =>
  Boolean(date) && !completed && new Date(`${date}T23:59:59`) < new Date();

const Goals = () => {
  const [title, setTitle] = useState("");
  const [dreamId, setDreamId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.goals, [], {
    normalize: normalizeGoal,
  });
  const [dreams] = useLocalStorage(STORAGE_KEYS.dreams, [], {
    normalize: normalizeDream,
  });

  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const addGoal = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setGoals([
      ...goals,
      {
        id: createId(),
        title: trimmed,
        dreamId: dreamId || null,
        dueDate: dueDate || null,
        completed: false,
        completedAt: null,
        createdAt: Date.now(),
      },
    ]);
    setTitle("");
    setDreamId("");
    setDueDate("");
  };

  const toggleComplete = (id) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed: !goal.completed,
              completedAt: goal.completed ? null : Date.now(),
            }
          : goal,
      ),
    );
  };

  const deleteGoal = (id) => {
    const index = goals.findIndex((goal) => goal.id === id);
    if (index === -1) return;

    setGoals(goals.filter((goal) => goal.id !== id));
    clearTimeout(undoTimer.current);
    setUndo({ goal: goals[index], index });
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  };

  const undoDelete = () => {
    if (!undo) return;

    clearTimeout(undoTimer.current);
    const restored = [...goals];
    restored.splice(Math.min(undo.index, restored.length), 0, undo.goal);
    setGoals(restored);
    setUndo(null);
  };

  const dismissUndo = () => {
    clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const startEdit = (goal) => {
    setEditingId(goal.id);
    setEditingTitle(goal.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = () => {
    const trimmed = editingTitle.trim();
    setEditingId(null);
    setEditingTitle("");
    if (!trimmed) return;
    setGoals(goals.map((goal) => (goal.id === editingId ? { ...goal, title: trimmed } : goal)));
  };

  const onEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === "Escape") cancelEdit();
  };

  const counts = {
    all: goals.length,
    active: goals.filter((goal) => !goal.completed).length,
    completed: goals.filter((goal) => goal.completed).length,
  };

  const visible = goals.filter((goal) =>
    filter === "active" ? !goal.completed : filter === "completed" ? goal.completed : true,
  );

  const dreamTitle = (id) => dreams.find((dream) => dream.id === id)?.title;

  return (
    <div className="container-page py-14 max-w-3xl">
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Goals</h1>
      <p className="text-ink-soft mb-10">
        The concrete, checkable steps behind your bigger dreams.
      </p>

      <form onSubmit={addGoal} className="card p-4 mb-8 space-y-3">
        <input
          type="text"
          placeholder="e.g. Finish the AWS certification"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-line bg-base p-3 rounded-xl outline-none focus:border-violet transition-colors"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          {dreams.length > 0 && (
            <select
              value={dreamId}
              onChange={(e) => setDreamId(e.target.value)}
              aria-label="Link this goal to a dream"
              className="border border-line bg-base p-3 rounded-xl text-ink outline-none focus:border-violet transition-colors flex-1"
            >
              <option value="">No dream</option>
              {dreams.map((dream) => (
                <option key={dream.id} value={dream.id}>
                  {dream.title}
                </option>
              ))}
            </select>
          )}

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
            className="border border-line bg-base p-3 rounded-xl text-ink outline-none focus:border-violet transition-colors flex-1"
          />

          <button type="submit" className="btn-primary shrink-0">
            Add goal
          </button>
        </div>
      </form>

      {goals.length > 0 && (
        <div className="flex items-center gap-2 mb-6" role="group" aria-label="Filter goals">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === id
                  ? "bg-violet text-[#33200f]"
                  : "border border-line text-ink-soft hover:border-caramel hover:text-ink"
              }`}
            >
              {label}
              <span className="ml-1.5 opacity-70">{counts[id]}</span>
            </button>
          ))}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="h-12 w-12 rounded-xl bg-violet-tint flex items-center justify-center text-violet mx-auto mb-4">
            <HiOutlineFlag size={22} />
          </div>
          <h2 className="font-semibold text-lg mb-1">No goals yet</h2>
          <p className="text-ink-soft text-sm">Add your first one above to get started.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink-soft mb-4">
            {filter === "completed"
              ? "Nothing completed yet — pick a goal and check it off."
              : "All caught up. No active goals left."}
          </p>
          <button type="button" onClick={() => setFilter("all")} className="btn-secondary !py-2 !px-5 text-sm">
            Show all goals
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((goal) => {
              const overdue = isOverdue(goal.dueDate, goal.completed);
              const isEditing = editingId === goal.id;

              return (
                <motion.li
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="card p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleComplete(goal.id)}
                      aria-pressed={goal.completed}
                      aria-label={goal.completed ? "Mark as not complete" : "Mark as complete"}
                      className={`shrink-0 mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        goal.completed
                          ? "bg-violet border-violet text-white"
                          : "border-line text-transparent hover:border-violet"
                      }`}
                    >
                      <HiOutlineCheck size={15} strokeWidth={3} />
                    </button>

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={onEditKeyDown}
                            aria-label={`Edit goal: ${goal.title}`}
                            autoFocus
                            className="w-full border border-line bg-base px-2.5 py-1.5 rounded-lg text-ink outline-none focus:border-violet transition-colors"
                          />
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="text-sm font-semibold text-gold-deep hover:text-clay"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-sm text-ink-soft hover:text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <h3
                          onDoubleClick={() => startEdit(goal)}
                          className={`truncate ${
                            goal.completed ? "line-through text-ink-soft" : "text-ink"
                          }`}
                        >
                          {goal.title}
                        </h3>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        {dreamTitle(goal.dreamId) && (
                          <span className="text-xs text-ink-soft truncate">
                            {dreamTitle(goal.dreamId)}
                          </span>
                        )}
                        {goal.dueDate && (
                          <span
                            className={`text-xs ${
                              overdue ? "font-semibold text-bloom" : "text-ink-soft"
                            }`}
                          >
                            Due {formatDue(goal.dueDate)}
                            {overdue ? " · overdue" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startEdit(goal)}
                        aria-label={`Edit goal: ${goal.title}`}
                        className="p-2 text-ink-soft hover:text-gold-deep transition-colors"
                      >
                        <HiOutlinePencilSquare size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      aria-label={`Delete goal: ${goal.title}`}
                      className="p-2 text-ink-soft hover:text-bloom transition-colors"
                    >
                      <HiOutlineTrash size={19} />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <UndoToast
        message={undo ? `Deleted “${undo.goal.title}”` : ""}
        onUndo={undoDelete}
        onDismiss={dismissUndo}
      />
    </div>
  );
};

export default Goals;
