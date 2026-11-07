import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineSparkles, HiOutlineTrash } from "react-icons/hi2";
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

  const addDream = (e) => {
    e.preventDefault();
    if (!dream.trim()) return;

    setDreams([...dreams, { id: createId(), title: dream.trim(), createdAt: Date.now() }]);
    setDream("");
  };

  const deleteDream = (id) => {
    setDreams(dreams.filter((d) => d.id !== id));
  };

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Vision Board</h1>
      <p className="text-ink-soft mb-10">Pin the things you're working toward.</p>

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
                <h3 className="text-lg font-semibold mb-5 break-words">{d.title}</h3>

                <button
                  type="button"
                  onClick={() => deleteDream(d.id)}
                  className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-bloom transition-colors"
                >
                  <HiOutlineTrash size={16} />
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default VisionBoard;
