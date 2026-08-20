import React from "react";
import GooeyNav from "./GooeyNav";

/**
 * Replaces the classic text navigation with the animated GooeyNav.
 * The navigation items mirror the previous menu for a seamless transition.
 */
export default function NavBar() {
  const items = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-md border-b border-gray-200 shadow-sm rounded-3xl w-7.5xl mx-auto">
      {/* Flex container for the brand and navigation */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Brand/logo – replace with an actual logo component or image as needed */}
        <div className="text-xl font-semibold text-gray-800">FeedSmith</div>

        {/* Gooey navigation – wrapped to allow centering within the auto‑sized header */}
        <div className="relative" style={{ textAlign: "center" }}>
          <GooeyNav
            items={items}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>
      </div>
    </header>
  );
}
