import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineArrowUturnLeft, HiOutlineXMark } from "react-icons/hi2";

const UndoToast = ({ message, onUndo, onDismiss }) => (
  <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-5 pointer-events-none">
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto flex items-center gap-4 rounded-full border border-line bg-surface px-5 py-3 shadow-lift"
        >
          <span className="text-sm text-ink">{message}</span>
          <button
            type="button"
            onClick={onUndo}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:text-clay transition-colors"
          >
            <HiOutlineArrowUturnLeft size={15} />
            Undo
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="text-ink-soft hover:text-ink transition-colors"
          >
            <HiOutlineXMark size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default UndoToast;
