"use client";

import dynamic from "next/dynamic";
import NavBar from "@/components/landing/NavBar";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

const MoltenMetal = dynamic(
  () => import("@/components/moltenmetal/MoltenMetal"),
  {
    ssr: false,
  }
);

/**
 * Orbital interest label visualization.
 * Positions each label using JavaScript‑driven trigonometry so the text never rotates.
 * The parent container (orbit-system) may have a subtle mouse‑parallax tilt applied.
 */
function OrbitVisualization() {
  // Define each interest with its orbit radius (px) and orbit period (seconds).
  const interests = [
    // Outer orbit
    { label: "Programming", radius: 120, period: 36, ring: "outer", initialAngle: 0 },
    // Middle orbit
    { label: "AI", radius: 95, period: 38, ring: "middle", initialAngle: Math.PI / 2 },
    { label: "Cats", radius: 95, period: 34, ring: "middle", initialAngle: (3 * Math.PI) / 2 },
    // Inner orbit
    { label: "Cybersecurity", radius: 70, period: 42, ring: "inner", initialAngle: Math.PI },
  ];

  // Create a ref for each label element to update its transform directly.
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let animationFrame: number;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - start) / 1000; // seconds
      interests.forEach((it, i) => {
        const angularSpeed = (2 * Math.PI) / it.period; // rad/s
        const angle = it.initialAngle + angularSpeed * elapsed;
        const x = Math.cos(angle) * it.radius;
        const y = Math.sin(angle) * it.radius;
        const el = labelRefs.current[i];
        if (el) {
          // Position relative to the centre (left:50%, top:50%).
          el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        }
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <>
      {interests.map((it, idx) => (
        <div
          key={idx}
          className="orbit-label"
          ref={el => { labelRefs.current[idx] = el; }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            color: "rgba(205, 195, 230, 0.72)",
            textShadow: "0 0 10px rgba(150, 100, 255, 0.22)",
            opacity: 0.75,
            fontSize: "0.875rem",
            pointerEvents: "none",
          } as React.CSSProperties}
        >
          {it.label}
        </div>
      ))}
    </>
  );
}

export default function Home() {
  const orbitSystemRef = useRef<HTMLDivElement>(null);

  // Apply a subtle parallax tilt based on mouse movement.
  useEffect(() => {
    const container = orbitSystemRef.current;
    if (!container) return;
    const handle = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
      const rotateX = y * 4; // up to ~4deg
      const rotateY = -x * 4;
      container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    const rafHandle = (e: MouseEvent) => requestAnimationFrame(() => handle(e));
    window.addEventListener("mousemove", rafHandle);
    return () => {
      window.removeEventListener("mousemove", rafHandle);
      if (container) container.style.transform = "";
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08050f] text-white">

      {/* Background */}
      <MoltenMetal
        color1="#16002F"
        color2="#5A189A"
        color3="#E8D7FF"
        speed={0.35}
        scale={4}
        detail={3}
        glow={1.6}
        coreSize={0.1}
        swirl={1}
        fold={-0.18}
        blackPoint={0.08}
        brightness={1.25}
        colorMode="molten"
        grain={true}
        grainIntensity={0.05}
        mouseInteraction={true}
        mouseStrength={0.18}
        opacity={0.75}
      />

      {/* Content layer */}
      <div className="relative z-10">

       {/* Navbar */}
       <NavBar />

        {/* Hero */}
        <section className="flex min-h-[calc(100vh-80px)] items-center px-6 bg-transparent ">

          <div className="mx-auto grid w-full max-w-7xl items-center gap-16 py-24 lg:grid-cols-[1.05fr_0.95fr]">

            <div className="max-w-3xl">

              <p className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-white/50">
                Personal algorithm / 01
              </p>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.065em]"
              >
                Your feed
                <br />
                should know
                <br />
                <span className="text-white/45">
                  what you want.
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                  ease: "easeOut",
                }}
                className="mt-10 max-w-xl text-lg leading-relaxed text-white/60"
              >
                Tell FeedSmith what matters to you.
                We turn those preferences into a
                clearer, more intentional feed.
              </motion.p>

              <motion.a
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                }}
                href="#start"
                className="mt-10 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:scale-[1.03]"
              >
                Build my feed
                <span className="ml-2">→</span>
              </motion.a>

            </div>

            {/* Algorithm visual */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 1,
                delay: 0.2,
              }}
              className="relative hidden aspect-square lg:block"
            >

               {/* Orbital system – rings, central element, and orbiting labels */}
               <div className="orbit-system" ref={orbitSystemRef}>
                 {/* Concentric rings – remain static */}
                 <div className="absolute inset-0 rounded-full border border-white/10" />
                 <div className="absolute inset-[12%] rounded-full border border-white/10" />
                 <div className="absolute inset-[25%] rounded-full border border-white/10" />

                 {/* Central element */}
                 <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-md">
                   <div className="text-center">
                     <div className="text-xs uppercase tracking-[0.25em] text-white/40">Feed</div>
                     <div className="mt-2 text-xl font-medium">Intentional</div>
                   </div>
                 </div>

                 {/* Orbital interest labels */}
                  <OrbitVisualization />
               </div>

            </motion.div>

          </div>

        </section>

        {/* SECTION 02 — THE SIGNAL */}
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

        {/* SECTION 03 — TAKE CONTROL */}
        <section
          id="take-control"
          className="min-h-screen border-t border-white/10 px-6 py-32"
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">03 / Take control</p>
            <h2 className="mt-8 max-w-4xl text-5xl font-medium leading-tight tracking-[-0.04em] md:text-7xl">
              Stop adapting to<br />
              the algorithm.
            </h2>
            <p className="mt-6 max-w-3xl text-lg text-white/70">Tell it what you actually want.</p>

            {/* Preference signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
            >
              {[
                { label: "AI", intensity: 85 },
                { label: "Programming", intensity: 78 },
                { label: "Cybersecurity", intensity: 62 },
                { label: "Design", intensity: 55 },
                { label: "Gaming", intensity: 40 },
                { label: "Science", intensity: 48 },
                { label: "Technology", intensity: 70 },
              ].map((pref, idx) => (
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

        {/* SECTION 04 — BUILD YOUR FEED */}
        <section
          id="build-feed"
          className="min-h-screen border-t border-white/10 px-6 py-32 bg-black/30 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">04 / Build your feed</p>
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
                {[
                  { label: "AI", percent: 82, angle: -60 },
                  { label: "Programming", percent: 71, angle: -10 },
                  { label: "Cybersecurity", percent: 64, angle: 30 },
                  { label: "Design", percent: 48, angle: 80 },
                  { label: "Gaming", percent: 32, angle: 130 },
                ].map((item, i) => (
                  <g key={i} transform={`rotate(${item.angle} 50 50)`}>
                    <line x1="50" y1="50" x2="50" y2="20" stroke="rgba(150,100,255,0.2)" strokeWidth="0.3" />
                    <text x="50" y="15" fill="rgba(205,195,230,0.8)" fontSize="3" textAnchor="middle" className="select-none">
                      {item.label} {item.percent}%
                    </text>
                  </g>
                ))}
              </svg>
            </motion.div>
          </div>
        </section>

        {/* SECTION 05 — HOW IT WORKS */}
        <section
          id="how-it-works"
          className="min-h-screen border-t border-white/10 px-6 py-32"
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">05 / How it works</p>
            <h2 className="mt-8 max-w-4xl text-5xl font-medium leading-tight tracking-[-0.04em] md:text-7xl">How it works</h2>
            <ol className="mt-12 space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
              {[
                { step: "01", title: "Tell us what matters." },
                { step: "02", title: "Shape your signal." },
                { step: "03", title: "Get a feed that reflects you." },
              ].map((item, idx) => (
                <li key={idx} className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: idx * 0.2 }}
                  >
                    <span className="text-4xl font-light text-white/50">{item.step}</span>
                    <p className="mt-4 text-xl text-white/80">{item.title}</p>
                  </motion.div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* SECTION 06 — THE DIFFERENCE */}
        <section
          id="the-difference"
          className="min-h-screen border-t border-white/10 px-6 py-48 bg-black/20"
        >
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-6xl font-medium tracking-[-0.05em] text-white/90">
              The algorithm isn&#39;t the problem.
            </h2>
            <p className="mt-6 text-4xl font-medium text-violet-400" style={{ textShadow: "0 0 8px rgba(150,100,255,0.3)" }}>
              Not having a say in it is.
            </p>
          </div>
        </section>

        {/* SECTION 07 — FINAL CTA */}
        <section
          id="final-cta"
          className="min-h-screen border-t border-white/10 px-6 py-32 bg-black/40"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-5xl font-medium text-white/90">Build a feed that feels like yours.</h2>
            <p className="mt-6 text-lg text-white/70">Your attention is yours. Your feed should be too.</p>
            <motion.a
              href="#start"
              className="mt-10 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:scale-[1.03]"
              whileHover={{ scale: 1.03 }}
            >
              Build my feed
              <span className="ml-2">→</span>
            </motion.a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 px-6 py-8 text-sm text-white/60">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="font-medium">FeedSmith</p>
              <p className="text-xs">An intentional approach to your algorithm.</p>
            </div>
            <div className="flex space-x-6 text-center">
              <a href="#" className="hover:text-white/80">Product</a>
              <a href="#" className="hover:text-white/80">About</a>
              <a href="#" className="hover:text-white/80">Contact</a>
            </div>
          </div>
          <p className="mt-6 text-center text-xs">© 2026 FeedSmith</p>
        </footer>

       </div>
      {/* Global styles for orbital visualization */}
      <style jsx global>{`
        .orbit-system {
          position: absolute;
          inset: 0;
          perspective: 800px;
          transform-style: preserve-3d;
          transition: transform 0.2s ease-out;
        }
        /* Subtle concentric rings – keep existing thin borders */
        .orbit-ring {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 50%;
        }
        /* Reduce motion for users */
        @media (prefers-reduced-motion: reduce) {
          .orbit-system {
            transition: none;
          }
        }
      `}</style>
     </main>
   );
 }