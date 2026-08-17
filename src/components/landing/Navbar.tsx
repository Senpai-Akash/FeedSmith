"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Minimal sticky navigation bar with scroll‑aware background.
 * Uses a transparent background initially and a blurred translucent one after scrolling.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <AnimatePresence>
        <motion.nav
          initial={false}
          animate={scrolled ? "scrolled" : "top"}
          variants={{
            top: {
              backgroundColor: "rgba(0,0,0,0)",
              backdropFilter: "blur(0px)",
              borderBottom: "none",
            },
            scrolled: {
              backgroundColor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            },
          }}
          className="flex items-center justify-between px-6 py-4 transition-colors"
        >
          <Link href="#" className="flex items-center gap-2 text-xl font-semibold text-white">
            {/* Simple custom mark */}
            <span className="relative inline-block h-2 w-2 rounded-full bg-indigo-500 after:absolute after:-inset-1 after:rounded-full after:border-2 after:border-indigo-500/30" />
            FeedSmith
          </Link>
          <nav className="flex items-center gap-6 text-sm text-white/80">
            <Link href="#how-it-works">How it works</Link>
            <Link href="#features">Features</Link>
            <Link href="#faq">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="text-sm text-white/70 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="#"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Build My Feed
            </Link>
          </div>
        </motion.nav>
      </AnimatePresence>
    </header>
  );
}
