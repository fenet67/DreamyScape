import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiOutlineFlag, HiOutlineSparkles, HiOutlineTrophy } from "react-icons/hi2";
import heroImage from "../assets/hero.png";

const features = [
  {
    icon: HiOutlineFlag,
    title: "Track goals",
    body: "Break big ambitions into goals you can actually check off, one at a time.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Visualize dreams",
    body: "Pin the things you're working toward to a board so they stay in view.",
  },
  {
    icon: HiOutlineTrophy,
    title: "Celebrate progress",
    body: "Every finished goal lands in your achievements — proof you followed through.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative container-page pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-14 items-center">
        <span className="blob w-72 h-72 bg-violet top-[-4rem] left-[-6rem]" />
        <span className="blob w-64 h-64 bg-sky bottom-[-3rem] right-[10%]" />

        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <span className="eyebrow">
            <HiOutlineSparkles size={14} /> Personal goal &amp; vision tracker
          </span>

          <h1 className="mt-6 font-display text-5xl md:text-6xl font-semibold leading-[1.05] text-ink">
            Turn dreams
            <br />
            into <span className="gradient-text">reality</span>.
          </h1>

          <p className="mt-6 text-lg text-ink-soft max-w-md">
            DreamyScape helps you write down what you're working toward,
            break it into goals, and watch your progress add up.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/goals" className="btn-primary">
              Start your journey
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              See dashboard
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="card p-5 rotate-2 max-w-sm mx-auto">
            <img
              src={heroImage}
              alt="Illustration representing personal dreams and goals"
              className="w-full rounded-2xl"
            />
          </div>
        </motion.div>
      </section>

      {/* Why DreamyScape */}
      <section className="container-page py-20">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="text-3xl md:text-4xl font-semibold text-center mb-14"
        >
          Why DreamyScape?
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              custom={i}
              variants={fadeUp}
              className="card p-7"
            >
              <div className="h-11 w-11 rounded-xl bg-violet-tint flex items-center justify-center text-violet mb-5">
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-xl mb-2">{title}</h3>
              <p className="text-ink-soft">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container-page pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center"
        >
          <span className="blob w-72 h-72 bg-violet top-[-6rem] left-1/4 opacity-40" />
          <span className="blob w-72 h-72 bg-sky bottom-[-6rem] right-1/4 opacity-30" />

          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            Your dreams are worth writing down.
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Start a vision board in under a minute — no account, no setup.
          </p>
          <Link to="/vision-board" className="btn-primary">
            Build your vision board
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;