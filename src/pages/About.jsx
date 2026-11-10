import { motion } from "framer-motion";
import {
  HiOutlinePencilSquare,
  HiOutlineFlag,
  HiOutlineChartBar,
  HiOutlineTrophy,
} from "react-icons/hi2";

const steps = [
  {
    icon: HiOutlinePencilSquare,
    title: "Write down a dream",
    body: "Add it to your vision board so it stays somewhere you'll actually see it.",
  },
  {
    icon: HiOutlineFlag,
    title: "Turn it into goals",
    body: "Break the dream into concrete goals you can start and finish.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Track your progress",
    body: "Your dashboard adds everything up so you can see how far you've come.",
  },
  {
    icon: HiOutlineTrophy,
    title: "Celebrate the finish",
    body: "Completed goals move to Achievements — a record of what you followed through on.",
  },
];

const Fade = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const About = () => {
  return (
    <div className="container-page py-20 max-w-4xl">
      <Fade>
        <span className="eyebrow">About</span>
        <h1 className="mt-6 font-display text-4xl md:text-5xl font-semibold mb-8">
          Dreams get lost. DreamyScape helps them stick around.
        </h1>
        <p className="text-lg leading-8 text-ink-soft">
          Most goal trackers are built for work — sprints, tickets, deadlines.
          DreamyScape is built for the personal stuff: the trip you keep
          meaning to plan, the certification you keep meaning to start, the
          version of your life you're quietly working toward. Add a dream to
          your vision board, break it into goals, and check them off as you
          go.
        </p>
      </Fade>

      <div className="mt-16 grid sm:grid-cols-2 gap-6">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <Fade key={title} delay={i * 0.08}>
            <div className="card p-6 h-full">
              <div className="h-10 w-10 rounded-lg bg-violet-tint flex items-center justify-center text-violet mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-ink-soft text-sm">{body}</p>
            </div>
          </Fade>
        ))}
      </div>

      <Fade delay={0.2}>
        <div className="mt-16 card p-8 bg-violet-tint border-none">
          <p className="text-ink-soft">
            DreamyScape is a personal project built to explore React, React
            Router, Tailwind CSS, and Firebase Auth. Your goals and dreams are
            saved in your browser under your account, so they stay private to
            you.
          </p>
        </div>
      </Fade>
    </div>
  );
};

export default About;