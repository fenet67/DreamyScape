import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import UndoToast from "../components/UndoToast";
import {
  useLocalStorage,
  STORAGE_KEYS,
  createId,
  normalizeDream,
} from "../hooks/useLocalStorage";

const tilts = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"];

const VisionBoard = () => {
  const [dream, setDream] = useState("");
  const [dreams, setDreams] = useLocalStorage(STORAGE_KEYS.dreams, [], {
    normalize: normalizeDream,
  });

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const addDream = (e) => {
    e.preventDefault();
    const trimmed = dream.trim();
    if (!trimmed) return;

    setDreams([...dreams, { id: createId(), title: trimmed, createdAt: Date.now() }]);
    setDream("");
  };

  const deleteDream = (id) => {
    const index = dreams.findIndex((d) => d.id === id);
    if (index === -1) return;

    setDreams(dreams.filter((d) => d.id !== id));
    clearTimeout(undoTimer.current);
    setUndo({ dream: dreams[index], index });
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  };

  const undoDelete = () => {
    if (!undo) return;

    clearTimeout(undoTimer.current);
    const restored = [...dreams];
    restored.splice(Math.min(undo.index, restored.length), 0, undo.dream);
    setDreams(restored);
    setUndo(null);
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

  const onEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Vision Board</h1>
      <p className="text-ink-soft mb-10">
        Pin the things you're working toward.{" "}
        <Link to="/photos" className="font-semibold text-gold-deep hover:text-caramel">
          Add photos of them
        </Link>
      </p>

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
            {dreams.map((d, i) => (
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

                <div className="flex items-center gap-4 text-sm">
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <UndoToast
        message={undo ? `Removed “${undo.dream.title}”` : ""}
        onUndo={undoDelete}
        onDismiss={dismissUndo}
      />
    </div>
  );
};

export default VisionBoard;
