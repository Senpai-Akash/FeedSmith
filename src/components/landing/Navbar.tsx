"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
// No longer needed; using simple motion variants directly

/**
 * Refined sticky navbar. It starts transparent and gains a subtle dark overlay
 * once the page is scrolled. The design is deliberately minimal – the brand
 * mark is a tiny accent‑coloured dot, and navigation links are plain text that
 * become highlighted on hover.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.nav
        initial="top"
        animate={scrolled ? "scrolled" : "top"}
        variants={{
          top: { backgroundColor: "transparent" },
          scrolled: {
            backgroundColor: "rgba(0,0,0,0.6)",
            transition: { duration: 0.3 },
          },
        }}
        className="flex items-center justify-between px-8 py-4"
      >
        {/* Brand */}
        <Link href="#" className="flex items-center gap-2 text-lg font-medium text-gray-200">
          <span className="h-2 w-2 rounded-full bg-accent" />
          FeedSmith
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8 text-sm text-gray-300">
          <Link href="#how-it-works" className="hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="#"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition"
          >
            Build My Feed
          </Link>
        </div>
      </motion.nav>
    </header>
  );
}
