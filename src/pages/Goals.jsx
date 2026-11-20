import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineFlag,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import UndoToast from "../components/UndoToast";
import { useAuth } from "../context/auth-context";
import { listPhotos } from "../lib/photoStore";
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

const isDueBy = (goal, end) =>
  Boolean(goal.dueDate) && !goal.completed && new Date(`${goal.dueDate}T23:59:59`) <= end;

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

  const { user } = useAuth();
  const owner = user?.uid ?? "guest";
  const [photos, setPhotos] = useState([]);

  // A goal can show the face of the dream it serves.
  useEffect(() => {
    let active = true;

    listPhotos(owner)
      .then((records) => {
        if (active) setPhotos(records);
      })
      .catch((error) => {
        console.warn("DreamyScape: could not load dream covers", error);
      });

    return () => {
      active = false;
    };
  }, [owner]);

  const covers = photos.reduce((map, photo) => {
    if (photo.dreamId && photo.cover) map[photo.dreamId] = photo;
    return map;
  }, {});

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [dueSoonOnly, setDueSoonOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(undoTimer.current);
      clearTimeout(noticeTimer.current);
    },
    [],
  );

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
    const updated = goals.map((goal) =>
      goal.id === id
        ? {
            ...goal,
            completed: !goal.completed,
            completedAt: goal.completed ? null : Date.now(),
          }
        : goal,
    );
    setGoals(updated);

    // Finishing something is the whole point, so say so.
    const goal = goals.find((item) => item.id === id);
    if (!goal || goal.completed) return;

    const done = updated.filter((item) => item.completed).length;
    const remaining = updated.length - done;

    clearTimeout(noticeTimer.current);
    setNotice(
      remaining === 0
        ? `“${goal.title}” done — that's every goal. Well played.`
        : `“${goal.title}” done. ${done} of ${updated.length} — ${remaining} to go.`,
    );
    noticeTimer.current = setTimeout(() => setNotice(""), 4000);
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

  const dismissNotice = () => {
    clearTimeout(noticeTimer.current);
    setNotice("");
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

  // "Due this week" looks seven days ahead from today, including today.
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);
  const dueSoonCount = goals.filter((goal) => isDueBy(goal, weekEnd)).length;

  const searchTerm = query.trim().toLowerCase();
  const filtersActive = filter !== "all" || dueSoonOnly || searchTerm.length > 0;

  // Applied as explicit passes so every filter is honoured on each state change.
  let visible = goals;
  if (filter === "active") visible = visible.filter((goal) => !goal.completed);
  if (filter === "completed") visible = visible.filter((goal) => goal.completed);
  if (dueSoonOnly) visible = visible.filter((goal) => isDueBy(goal, weekEnd));
  if (searchTerm) {
    visible = visible.filter((goal) => goal.title.toLowerCase().includes(searchTerm));
  }

  const clearFilters = () => {
    setFilter("all");
    setQuery("");
    setDueSoonOnly(false);
  };

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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search goals"
            aria-label="Search goals"
            className="w-full border border-line bg-surface p-2.5 rounded-xl text-sm outline-none focus:border-violet transition-colors sm:max-w-xs"
          />
          <button
            type="button"
            onClick={() => setDueSoonOnly((current) => !current)}
            aria-pressed={dueSoonOnly}
            className={`self-start rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              dueSoonOnly
                ? "bg-violet text-[#33200f]"
                : "border border-line text-ink-soft hover:border-caramel hover:text-ink"
            }`}
          >
            Due this week
            <span className="ml-1.5 opacity-70">{dueSoonCount}</span>
          </button>
        </div>
      )}

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
          <p className="text-ink-soft text-sm">
            Add your first one above — give it a dream and a due date and it'll show up on your
            dashboard.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink-soft mb-4">
            {filtersActive
              ? "Nothing matches those filters — try a different search or clear them."
              : "All caught up. No goals left here."}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-secondary !py-2 !px-5 text-sm"
          >
            Clear filters
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
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-ink-soft">
                            {covers[goal.dreamId] && (
                              <img
                                src={covers[goal.dreamId].src}
                                alt=""
                                loading="lazy"
                                className="h-5 w-5 shrink-0 rounded object-cover"
                              />
                            )}
                            <span className="truncate">{dreamTitle(goal.dreamId)}</span>
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
        message={undo ? `Deleted “${undo.goal.title}”` : notice}
        onUndo={undo ? undoDelete : undefined}
        onDismiss={undo ? dismissUndo : dismissNotice}
      />
    </div>
  );
};

export default Goals;
