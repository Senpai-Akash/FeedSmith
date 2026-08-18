"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 py-8 text-gray-400">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          {/* Simple logo placeholder */}
           <span className="h-2 w-2 rounded-full bg-accent" />
          FeedSmith
        </div>
        <nav className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="#how-it-works" className="hover:text-white">How it works</Link>
          <Link href="#features" className="hover:text-white">Features</Link>
          <Link href="#faq" className="hover:text-white">FAQ</Link>
          <Link href="#" className="hover:text-white">Privacy</Link>
          <Link href="https://github.com" className="hover:text-white">GitHub</Link>
        </nav>
        <p className="mt-4 text-xs">© {new Date().getFullYear()} FeedSmith. All rights reserved.</p>
      </div>
    </footer>
  );
}
