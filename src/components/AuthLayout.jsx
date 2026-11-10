import { HiOutlineCheckCircle } from "react-icons/hi2";

const perks = [
  "Pin the dreams you're working toward",
  "Break them into goals you can actually finish",
  "Watch the progress add up on your dashboard",
];

// Two panels on wide screens: a warm brand aside and the form card. On small
// screens the aside drops away so the form gets the full width.
const AuthLayout = ({ children, footer }) => (
  <div className="container-page grid max-w-5xl gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
    <aside className="relative isolate hidden overflow-hidden rounded-[2rem] bg-ink p-10 text-white lg:block">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="blob left-[-4rem] top-[-6rem] h-64 w-64 bg-gold/30" />
        <span className="blob bottom-[-6rem] right-[-5rem] h-72 w-72 bg-caramel/30" />
      </div>

      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-gold">
        DreamyScape
      </p>
      <h2 className="mt-5 max-w-xs font-display text-3xl font-semibold leading-tight">
        A warm corner for the life you're building.
      </h2>
      <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
        Dreams get lost in notes apps and good intentions. Here they get a board, a
        deadline, and a small satisfying check mark.
      </p>

      <ul className="mt-8 space-y-4">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-3 text-sm text-white/85">
            <HiOutlineCheckCircle size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
            {perk}
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-4">
        <p className="font-display text-sm italic leading-snug">
          “Small steps, kept somewhere you'll actually see them.”
        </p>
        <p className="mt-2 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/50">
          The idea behind DreamyScape
        </p>
      </div>
    </aside>

    <div className="mx-auto w-full max-w-md lg:max-w-none">
      {children}
      {footer}
    </div>
  </div>
);

export default AuthLayout;
