"use client";

import Navbar from "./Navbar";
import Hero from "./Hero";
import ProblemSection from "./ProblemSection";
import HowItWorks from "./HowItWorks";
import FeedProfilePreview from "./FeedProfilePreview";
import FeedAnalyzerPreview from "./FeedAnalyzerPreview";
import PhilosophySection from "./PhilosophySection";
import PlatformsSection from "./PlatformsSection";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeedProfilePreview />
        <FeedAnalyzerPreview />
        <PhilosophySection />
        <PlatformsSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
