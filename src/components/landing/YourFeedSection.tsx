import { motion } from "framer-motion";
import styles from "./YourFeedSection.module.css";

export default function YourFeedSection() {
  // Preference data for radial visualization
  const items = [
    { label: "AI", percent: 82, angle: -60 },
    { label: "Programming", percent: 71, angle: -10 },
    { label: "Cybersecurity", percent: 64, angle: 30 },
    { label: "Design", percent: 48, angle: 80 },
    { label: "Gaming", percent: 32, angle: 130 },
  ];

  return (
    <section
      id="build-feed"
      className="min-h-screen border-t border-white/10 px-6 py-32 bg-black/30 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          04 / Build your feed
        </p>
        <h2 className="mt-8 max-w-4xl text-5xl font-medium leading-tight tracking-[-0.04em] md:text-7xl">
          Your interests.<br />
          Your signal.<br />
          Your feed.
        </h2>

        {/* Radial preference visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="relative mt-16 h-[300px] w-full max-w-[300px] mx-auto"
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {/* Concentric circles */}
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
            {/* Labels positioned around */}
            {items.map((item, i) => (
              <g key={i} transform={`rotate(${item.angle} 50 50)`}>
                <line
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="20"
                  stroke="rgba(150,100,255,0.2)"
                  strokeWidth="0.3"
                />
                <text
                  x="50"
                  y="15"
                  fill="rgba(205,195,230,0.8)"
                  fontSize="3"
                  textAnchor="middle"
                  className="select-none"
                >
                  {item.label} {item.percent}%
                </text>
              </g>
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  );
}