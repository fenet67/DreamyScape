import { HiOutlineCheck, HiOutlineFire } from "react-icons/hi2";

import { streakStats } from "../lib/momentum";

// The "it adds up" line: how much got finished this week, and how many days in
// a row have something to show for them. Hidden until there's something to say.
const MomentumStats = ({ goals }) => {
  const { finishedThisWeek, streak } = streakStats(goals);

  if (finishedThisWeek === 0 && streak === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
      <span className="inline-flex items-center gap-1.5">
        <HiOutlineCheck size={16} className="shrink-0 text-gold-deep" aria-hidden="true" />
        {finishedThisWeek === 0
          ? "Nothing finished this week yet"
          : `${finishedThisWeek} finished this week`}
      </span>
      {streak > 0 && (
        <span className="inline-flex items-center gap-1.5 text-gold-deep">
          <HiOutlineFire size={16} className="shrink-0" aria-hidden="true" />
          {streak}-day streak
        </span>
      )}
    </div>
  );
};

export default MomentumStats;
