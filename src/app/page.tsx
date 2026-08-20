"use client";

import dynamic from "next/dynamic";
import NavBar from "@/components/landing/NavBar";
import { motion } from "framer-motion";

const MoltenMetal = dynamic(
  () => import("@/components/moltenmetal/MoltenMetal"),
  {
    ssr: false,
  }
);

export default function Home() {
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

              <div className="absolute inset-0 rounded-full border border-white/10" />

              <div className="absolute inset-[12%] rounded-full border border-white/10" />

              <div className="absolute inset-[25%] rounded-full border border-white/10" />

              <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-md">

                <div className="text-center">
                  <div className="text-xs uppercase tracking-[0.25em] text-white/40">
                    Feed
                  </div>

                  <div className="mt-2 text-xl font-medium">
                    Intentional
                  </div>
                </div>

              </div>

              <div className="absolute left-[18%] top-[20%] text-sm text-white/70">
                AI
              </div>

              <div className="absolute right-[15%] top-[30%] text-sm text-white/60">
                Programming
              </div>

              <div className="absolute bottom-[22%] left-[20%] text-sm text-white/50">
                Cybersecurity
              </div>

              <div className="absolute bottom-[18%] right-[25%] text-sm text-white/60">
                Cats
              </div>

            </motion.div>

          </div>

        </section>

        {/* Beginning of next section */}
        <section
          id="how-it-works"
          className="min-h-screen border-t border-white/10 px-6 py-32"
        >
          <div className="mx-auto max-w-7xl">

            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              02 / The signal
            </p>

            <h2 className="mt-8 max-w-4xl text-5xl font-medium leading-tight tracking-[-0.04em] md:text-7xl">
              Every interaction
              <br />
              teaches the algorithm
              <span className="text-white/35"> something.</span>
            </h2>

          </div>
        </section>

      </div>
    </main>
  );
}