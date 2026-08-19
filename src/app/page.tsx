"use client";

import NavBar from "../components/landing/NavBar";
import HeroSection from "../components/landing/HeroSection";
import NextSection from "../components/landing/NextSection";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <HeroSection />
      <NextSection />
    </main>
  );
}
