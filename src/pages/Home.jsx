import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineFlag,
  HiOutlineSparkles,
  HiOutlineSwatch,
  HiOutlineTrophy,
} from "react-icons/hi2";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: "easeOut" },
  }),
};

const dreams = [
  { emoji: "✈️", label: "Japan" },
  { emoji: "🏔️", label: "Summit" },
  { emoji: "📚", label: "12 books" },
];

const previewGoals = [
  { title: "Save for the trip", meta: "5 / 5", done: true },
  { title: "Book the flights", meta: "2 / 4", done: true },
  { title: "Learn basic Japanese", meta: "1 / 3", done: false },
];

const features = [
  {
    icon: HiOutlineFlag,
    title: "Track goals",
    body: "Break big ambitions into goals small enough to start this week — then check them off, one at a time.",
  },
  {
    icon: HiOutlineSwatch,
    title: "Visualize dreams",
    body: "Pin the things you're working toward to a board, so they stay in view instead of drifting away.",
  },
  {
    icon: HiOutlineTrophy,
    title: "Celebrate progress",
    body: "Every finished goal lands in your achievements — a quiet record of what you actually followed through on.",
  },
];

const steps = [
  {
    title: "Capture the dream",
    body: "Write it down and pin it to your vision board. It stops living rent-free in your head.",
  },
  {
    title: "Shape it into goals",
    body: "Slice the dream into a handful of concrete steps you can genuinely finish.",
  },
  {
    title: "Watch it add up",
    body: "Tick things off and let your dashboard show just how far you've come.",
  },
];

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-gold/25 blur-3xl" />
          <div className="absolute top-10 right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-caramel/20 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-base" />
        </div>

        <div className="container-page grid items-center gap-16 pt-14 pb-24 md:grid-cols-[1.05fr_0.95fr] md:pt-20 md:pb-32 lg:gap-20">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <span className="eyebrow">
              <HiOutlineSparkles size={14} aria-hidden="true" />
              Dream it · plan it · do it
            </span>

            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.04] text-ink sm:text-5xl lg:text-[4rem]">
              Turn your dreams
              <br className="hidden sm:block" /> into{" "}
              <span className="gradient-text">reality</span>.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-ink-soft">
              DreamyScape is a warm little corner for the things you're working
              toward. Pin your dreams, break them into goals, and watch the
              progress add up.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/goals" className="btn-primary">
                Start your journey
                <HiOutlineArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                See the dashboard
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-ink-soft">
              {["No account needed", "Saved on your device", "Free, always"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <HiOutlineCheckCircle
                      size={16}
                      className="text-gold-deep"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </motion.div>

          {/* Board preview */}
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto w-full max-w-[26rem]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-3 top-8 bottom-4 -rotate-3 rounded-[2rem] bg-caramel-tint"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-3 top-4 bottom-8 rotate-2 rounded-[2rem] bg-gold-tint"
            />

            <div className="relative rounded-[1.75rem] border border-line bg-surface p-5 shadow-lift">
              <div className="flex items-center justify-between">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink-soft">
                  Vision board
                </p>
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-gold" />
                  <span className="h-2 w-2 rounded-full bg-caramel" />
                  <span className="h-2 w-2 rounded-full bg-line" />
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {dreams.map((dream) => (
                  <div
                    key={dream.label}
                    className="rounded-xl border border-gold/30 bg-gold-tint/60 px-2 py-3 text-center"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {dream.emoji}
                    </span>
                    <p className="mt-1 text-[0.7rem] font-semibold text-ink">
                      {dream.label}
                    </p>
                  </div>
                ))}
              </div>

              <ul className="mt-5 space-y-2.5">
                {previewGoals.map((goal) => (
                  <li
                    key={goal.title}
                    className="flex items-center gap-3 rounded-xl border border-line/90 px-3 py-2.5"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        goal.done
                          ? "bg-gold text-ink"
                          : "border-2 border-line bg-surface"
                      }`}
                    >
                      {goal.done && <HiOutlineCheck size={12} aria-hidden="true" />}
                    </span>
                    <span
                      className={`flex-1 text-sm font-semibold ${
                        goal.done ? "text-ink-soft line-through" : "text-ink"
                      }`}
                    >
                      {goal.title}
                    </span>
                    <span className="text-[0.7rem] font-bold text-ink-soft">
                      {goal.meta}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink-soft">
                  <span>This year</span>
                  <span className="text-gold-deep">62%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gold-tint">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "62%" }}
                    transition={{ duration: 1.1, delay: 0.45, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-gold to-caramel"
                  />
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -12, rotate: -10 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="absolute -top-8 -right-2 w-36 rounded-2xl border border-gold/40 bg-gold-tint px-4 py-3 shadow-card sm:-right-5"
            >
              <p className="font-display text-sm italic leading-snug text-ink">
                “Book the flights”
              </p>
              <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold-deep">
                Dream 01
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12, rotate: 8 }}
              animate={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-6 -left-2 rounded-2xl bg-ink px-4 py-3 shadow-lift sm:-left-5"
            >
              <p className="font-display text-xl font-semibold leading-none text-gold">
                18
              </p>
              <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white/60">
                goals done
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mb-12 max-w-2xl"
        >
          <span className="eyebrow">Why DreamyScape</span>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            Small steps, kept somewhere you'll actually see them.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={i}
              variants={fadeUp}
              className="card p-7 transition duration-200 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-tint text-gold-deep">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-7 text-ink-soft">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page pb-24">
        <div className="rounded-[2rem] border border-line bg-surface/70 px-6 py-12 sm:px-10 sm:py-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="mb-10 flex flex-wrap items-end justify-between gap-4"
          >
            <h2 className="max-w-md font-display text-3xl font-semibold sm:text-4xl">
              Three steps, in any order you like.
            </h2>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-bold text-gold-deep hover:text-caramel"
            >
              How it works
              <HiOutlineArrowRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-7">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                variants={fadeUp}
              >
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl font-semibold text-gold">
                    0{i + 1}
                  </span>
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="container-page pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center sm:px-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <span className="blob top-[-8rem] left-[15%] h-72 w-72 bg-gold/40" />
            <span className="blob right-[12%] bottom-[-9rem] h-72 w-72 bg-caramel/40" />
          </div>

          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-white sm:text-4xl">
            Your dreams are worth writing down.
          </h2>
          <p className="mx-auto mt-4 mb-9 max-w-xl text-white/70">
            Start with one board and one goal. It takes under a minute — no
            account, no setup.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/vision-board" className="btn-primary">
              Build your vision board
              <HiOutlineArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/goals"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
            >
              Add a goal instead
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
