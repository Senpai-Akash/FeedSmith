"use client";

import Navbar from "./Navbar";
import Hero from "./Hero";
import ProblemSection from "./ProblemSection";
import FeedBuilderPreview from "./FeedBuilderPreview";
import FeedProfile from "./FeedProfile";
import FeedComparison from "./FeedComparison";
import TransformationSection from "./TransformationSection";
import FeatureSection from "./FeatureSection";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <FeedBuilderPreview />
        <FeedProfile />
        <FeedComparison />
        <TransformationSection />
        <FeatureSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
