import { motion } from "framer-motion";
import styles from "./TakeControlSection.module.css";

export default function TakeControlSection() {
  // Preference data
  const preferences = [
    { label: "AI", intensity: 85 },
    { label: "Programming", intensity: 78 },
    { label: "Cybersecurity", intensity: 62 },
    { label: "Design", intensity: 55 },
    { label: "Gaming", intensity: 40 },
    { label: "Science", intensity: 48 },
    { label: "Technology", intensity: 70 },
  ];

  return (
    <section
      id="take-control"
      className="min-h-screen border-t border-white/10 px-6 py-32"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          03 / Take control
        </p>
        <h2 className="mt-8 max-w-4xl text-5xl font-medium leading-tight tracking-[-0.04em] md:text-7xl">
          Stop adapting to<br />
          the algorithm.
        </h2>
        <p className="mt-6 max-w-3xl text-lg text-white/70">
          Tell it what you actually want.
        </p>

        {/* Preference signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
        >
          {preferences.map((pref, idx) => (
            <div key={idx} className="relative rounded border border-white/20 p-3 text-sm text-white/80">
              <span className="block mb-2 text-white/90">{pref.label}</span>
              <div className="h-2 w-full bg-white/5 rounded">
                <div
                  className="h-full rounded bg-violet-500"
                  style={{ width: `${pref.intensity}%` }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}