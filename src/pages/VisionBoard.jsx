import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlinePrinter,
} from "react-icons/hi2";
import ProgressBar from "../components/ProgressBar";
import UndoToast from "../components/UndoToast";
import { useAuth } from "../context/auth-context";
import {
  useLocalStorage,
  STORAGE_KEYS,
  createId,
  normalizeDream,
  normalizeGoal,
} from "../hooks/useLocalStorage";
import { listPhotos, setPhotosDream } from "../lib/photoStore";

const tilts = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"];

const VisionBoard = () => {
  const [dream, setDream] = useState("");
  const [dreams, setDreams] = useLocalStorage(STORAGE_KEYS.dreams, [], {
    normalize: normalizeDream,
  });
  // Goals live on the Goals page, but a dream can start one right here.
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.goals, [], {
    normalize: normalizeGoal,
  });

  const { user } = useAuth();
  const owner = user?.uid ?? "guest";
  const [photos, setPhotos] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [goalForId, setGoalForId] = useState(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [undo, setUndo] = useState(null);
  const [printedOn] = useState(() => new Date().toLocaleDateString());
  const undoTimer = useRef(null);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  // Linked photos live in IndexedDB; a board without any still works fine.
  useEffect(() => {
    let active = true;

    listPhotos(owner)
      .then((records) => {
        if (active) setPhotos(records);
      })
      .catch((error) => {
        console.warn("DreamyScape: could not load photos for the board", error);
      });

    return () => {
      active = false;
    };
  }, [owner]);

  const addDream = (e) => {
    e.preventDefault();
    const trimmed = dream.trim();
    if (!trimmed) return;

    setDreams([...dreams, { id: createId(), title: trimmed, createdAt: Date.now() }]);
    setDream("");
  };

  const deleteDream = async (id) => {
    const index = dreams.findIndex((d) => d.id === id);
    if (index === -1) return;

    const linked = photos.filter((photo) => photo.dreamId === id).map((photo) => photo.id);
    // Goals can't belong to a dream that no longer exists, so they go back to
    // being unlinked rather than silently losing their label.
    const linkedGoals = goals.filter((goal) => goal.dreamId === id).map((goal) => goal.id);

    setDreams(dreams.filter((d) => d.id !== id));
    if (linkedGoals.length > 0) {
      setGoals(goals.map((goal) => (goal.dreamId === id ? { ...goal, dreamId: null } : goal)));
    }
    clearTimeout(undoTimer.current);
    setUndo({ dream: dreams[index], index, linked, linkedGoals });
    undoTimer.current = setTimeout(() => setUndo(null), 6000);

    // Photos keep their own record; just detach them from the dream that left.
    if (linked.length === 0) return;
    setPhotos((current) =>
      current.map((photo) => (photo.dreamId === id ? { ...photo, dreamId: null } : photo)),
    );
    try {
      await setPhotosDream(linked, null);
    } catch (error) {
      console.warn("DreamyScape: could not detach photos from the removed dream", error);
    }
  };

  const undoDelete = async () => {
    if (!undo) return;

    const { dream: removed, index, linked, linkedGoals = [] } = undo;

    clearTimeout(undoTimer.current);
    const restored = [...dreams];
    restored.splice(Math.min(index, restored.length), 0, removed);
    setDreams(restored);
    setUndo(null);

    // Undo puts the dream back, so the goals that hung on it return to it.
    if (linkedGoals.length > 0) {
      setGoals((current) =>
        current.map((goal) =>
          linkedGoals.includes(goal.id) ? { ...goal, dreamId: removed.id } : goal,
        ),
      );
    }

    // Undo puts the dream back, so its photos go back on it too.
    if (!linked?.length) return;
    setPhotos((current) =>
      current.map((photo) =>
        linked.includes(photo.id) ? { ...photo, dreamId: removed.id } : photo,
      ),
    );
    try {
      await setPhotosDream(linked, removed.id);
    } catch (error) {
      console.warn("DreamyScape: could not reattach photos to the restored dream", error);
    }
  };

  const dismissUndo = () => {
    clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setEditingTitle(d.title);
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
    setDreams(dreams.map((d) => (d.id === editingId ? { ...d, title: trimmed } : d)));
  };

  const photosByDream = photos.reduce((groups, photo) => {
    if (!photo.dreamId) return groups;
    groups[photo.dreamId] ??= [];
    groups[photo.dreamId].push(photo);
    return groups;
  }, {});

  // A dream's cover is shown large; the other photos stay as a strip.
  const photosFor = (dreamId) => {
    const list = photosByDream[dreamId] ?? [];
    const cover = list.find((photo) => photo.cover) ?? null;

    return {
      list,
      cover,
      rest: cover ? list.filter((photo) => photo.id !== cover.id) : list,
    };
  };

  const startGoal = (id) => {
    setEditingId(null);
    setEditingTitle("");
    setGoalForId(id);
    setGoalTitle("");
  };

  const cancelGoal = () => {
    setGoalForId(null);
    setGoalTitle("");
  };

  // The new goal already belongs to this dream, so no linking step is needed.
  const addGoal = (e, dreamId) => {
    e.preventDefault();
    const trimmed = goalTitle.trim();
    if (!trimmed) return;

    setGoals([
      ...goals,
      {
        id: createId(),
        title: trimmed,
        dreamId,
        dueDate: null,
        completed: false,
        completedAt: null,
        createdAt: Date.now(),
      },
    ]);
    cancelGoal();
  };

  // A dream's goals drive the same bar the dashboard uses, next to its photos.
  const goalStats = (dreamId) => {
    const linked = goals.filter((goal) => goal.dreamId === dreamId);
    const done = linked.filter((goal) => goal.completed).length;

    return {
      total: linked.length,
      done,
      percent: linked.length === 0 ? 0 : Math.round((done / linked.length) * 100),
    };
  };

  const onEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <>
    <div className="container-page py-14 print:hidden">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Vision Board</h1>
          <p className="text-ink-soft">
            Pin the things you're working toward.{" "}
            <Link to="/photos" className="font-semibold text-gold-deep hover:text-caramel">
              Add photos of them
            </Link>
          </p>
        </div>

        {dreams.length > 0 && (
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary shrink-0 !px-4 !py-2 text-sm"
          >
            <HiOutlinePrinter size={16} aria-hidden="true" />
            Print board
          </button>
        )}
      </div>

      <form onSubmit={addDream} className="flex gap-3 mb-12 max-w-2xl">
        <input
          type="text"
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          placeholder="e.g. Travel to Japan"
          className="border border-line bg-surface p-3.5 rounded-xl flex-1 outline-none focus:border-violet transition-colors"
        />
        <button type="submit" className="btn-primary shrink-0">
          Pin it
        </button>
      </form>

      {dreams.length === 0 ? (
        <div className="card p-10 text-center max-w-md">
          <div className="h-12 w-12 rounded-xl bg-violet-tint flex items-center justify-center text-violet mx-auto mb-4">
            <HiOutlineSparkles size={22} />
          </div>
          <h2 className="font-semibold text-lg mb-1">Your board is empty</h2>
          <p className="text-ink-soft text-sm">Pin your first dream above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-7">
          <AnimatePresence initial={false}>
            {dreams.map((d, i) => {
              const board = photosFor(d.id);
              const stats = goalStats(d.id);

              return (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className={`card p-6 ${tilts[i % tilts.length]} hover:rotate-0 transition-transform duration-200`}
              >
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-bloom mb-4" />

                {editingId === d.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={onEditKeyDown}
                      aria-label={`Edit dream: ${d.title}`}
                      autoFocus
                      className="w-full border border-line bg-base px-2.5 py-1.5 rounded-lg text-ink outline-none focus:border-violet transition-colors"
                    />
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="font-semibold text-gold-deep hover:text-clay"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-ink-soft hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3
                    onDoubleClick={() => startEdit(d)}
                    className="text-lg font-semibold mb-5 break-words"
                  >
                    {d.title}
                  </h3>
                )}

                {stats.total > 0 && (
                  <Link to="/goals" className="group mb-5 block">
                    <div className="mb-2 flex items-baseline justify-between gap-3 text-xs text-ink-soft">
                      <span>
                        {stats.done} of {stats.total} goal{stats.total === 1 ? "" : "s"} done
                      </span>
                      <span className="font-semibold text-gold-deep transition-colors group-hover:text-caramel">
                        View goals
                      </span>
                    </div>
                    <ProgressBar progress={stats.percent} />
                  </Link>
                )}

                {board.list.length > 0 && (
                  <div className="mb-5">
                    {board.cover && (
                      <img
                        src={board.cover.src}
                        alt={board.cover.name}
                        loading="lazy"
                        className="mb-1.5 h-32 w-full rounded-xl object-cover"
                      />
                    )}
                    {board.rest.length > 0 && (
                      <ul className="grid grid-cols-3 gap-1.5">
                        {board.rest.slice(0, 3).map((photo) => (
                          <li key={photo.id}>
                            <img
                              src={photo.src}
                              alt={photo.name}
                              loading="lazy"
                              className="h-20 w-full rounded-lg object-cover"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-2 text-xs text-ink-soft">
                      {board.rest.length > 3 ? `+${board.rest.length - 3} more · ` : ""}
                      <Link
                        to="/photos"
                        className="font-semibold text-gold-deep hover:text-caramel"
                      >
                        All photos
                      </Link>
                    </p>
                  </div>
                )}

                {board.list.length === 0 && (
                  <Link
                    to="/photos"
                    className="mb-5 flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2.5 text-xs font-semibold text-ink-soft transition-colors hover:border-caramel hover:text-gold-deep"
                  >
                    <HiOutlinePhoto size={16} aria-hidden="true" />
                    No photos yet — add one
                  </Link>
                )}

                {goalForId === d.id && (
                  <form onSubmit={(e) => addGoal(e, d.id)} className="mb-4 space-y-2">
                    <input
                      type="text"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") cancelGoal();
                      }}
                      aria-label={`Add a goal for ${d.title}`}
                      placeholder="e.g. Book the flights"
                      autoFocus
                      className="w-full border border-line bg-base px-2.5 py-1.5 rounded-lg text-ink outline-none focus:border-violet transition-colors"
                    />
                    <div className="flex items-center gap-3 text-sm">
                      <button type="submit" className="font-semibold text-gold-deep hover:text-clay">
                        Add goal
                      </button>
                      <button
                        type="button"
                        onClick={cancelGoal}
                        className="text-ink-soft hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <button
                    type="button"
                    onClick={() => startEdit(d)}
                    className="inline-flex items-center gap-1.5 text-ink-soft hover:text-gold-deep transition-colors"
                  >
                    <HiOutlinePencilSquare size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDream(d.id)}
                    className="inline-flex items-center gap-1.5 text-ink-soft hover:text-bloom transition-colors"
                  >
                    <HiOutlineTrash size={16} />
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => (goalForId === d.id ? cancelGoal() : startGoal(d.id))}
                    aria-expanded={goalForId === d.id}
                    className="inline-flex items-center gap-1.5 text-ink-soft hover:text-gold-deep transition-colors"
                  >
                    <HiOutlinePlus size={16} />
                    Add goal
                  </button>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <UndoToast
        message={undo ? `Removed “${undo.dream.title}”` : ""}
        onUndo={undoDelete}
        onDismiss={dismissUndo}
      />
    </div>

    {/* Only rendered on paper, via the print media query. */}
    <div className="hidden print:block">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">DreamyScape</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">My vision board</h1>
        <p className="mt-1 text-xs text-ink-soft">
          {dreams.length} dream{dreams.length === 1 ? "" : "s"} · {printedOn}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-5">
        {dreams.map((d) => {
          const board = photosFor(d.id);
          const stats = goalStats(d.id);
          const linked = goals.filter((goal) => goal.dreamId === d.id);
          const shot = board.cover ?? board.rest[0] ?? null;

          return (
            <section key={d.id} className="break-inside-avoid rounded-xl border border-line p-4">
              {shot && (
                <img
                  src={shot.src}
                  alt={shot.name}
                  className="mb-3 h-36 w-full rounded-lg object-cover"
                />
              )}

              <h2 className="font-display text-lg font-semibold">{d.title}</h2>

              {stats.total > 0 && (
                <div className="mt-1.5">
                  <p className="mb-1 text-xs text-ink-soft">
                    {stats.done} of {stats.total} goal{stats.total === 1 ? "" : "s"} done
                  </p>
                  <ProgressBar progress={stats.percent} />
                </div>
              )}

              {linked.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-ink-soft">
                  {linked.map((goal) => (
                    <li key={goal.id} className={goal.completed ? "line-through" : ""}>
                      {goal.completed ? "✓" : "•"} {goal.title}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default VisionBoard;
