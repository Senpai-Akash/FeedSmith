import { motion } from "framer-motion";
import styles from "./SignalSection.module.css";

export default function SignalSection() {
  return (
    <section
      id="the-signal"
      className="min-h-screen border-t border-white/10 px-6 py-32"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400 mb-4">
          02 / THE SIGNAL
        </p>
        <h2 className="text-5xl md:text-6xl font-bold leading-tight">
          <span className="block text-white">Every interaction</span>
          <span className="block text-white">teaches the algorithm</span>
          <span className="block text-gray-400">something.</span>
        </h2>
      </div>
    </section>
  );
}