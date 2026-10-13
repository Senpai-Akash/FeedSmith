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
    <header className="header-nav mx-auto w-full max-w-7xl">
      <div className="flex items-center justify-between w-full">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white hover:text-violet-300 transition"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-xs text-white shadow-md shadow-violet-500/20">
            ⚡
          </span>
          <span>FeedSmith</span>
        </Link>

        <div className="relative hidden md:block" style={{ textAlign: "center" }}>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/build/profile"
            className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/25 hover:text-white sm:inline-flex"
          >
            Dashboard
          </Link>
          <Link
            href="/build"
            className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02]"
          >
            Start Training →
          </Link>
        </div>
      </div>
    </header>
  );
}
