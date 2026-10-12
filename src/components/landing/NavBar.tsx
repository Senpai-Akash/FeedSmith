import React from "react";
import Link from "next/link";
import GooeyNav from "./GooeyNav";

/**
 * Main application navigation bar with high-contrast branding and active routes.
 */
export default function NavBar() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Build Signal", href: "/build" },
    { label: "Daily Mission", href: "/build/profile" },
    { label: "Share Plan", href: "/build/plan" },
  ];

  return (
    <header className="header-nav border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3.5 max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white hover:text-violet-300 transition"
        >
          FeedSmith
        </Link>

        <div className="relative" style={{ textAlign: "center" }}>
          <GooeyNav
            items={items}
            particleCount={12}
            particleDistances={[80, 10]}
            particleR={80}
            initialActiveIndex={0}
            animationTime={500}
            timeVariance={250}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/build"
            className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500"
          >
            Start Training →
          </Link>
        </div>
      </div>
    </header>
  );
}
