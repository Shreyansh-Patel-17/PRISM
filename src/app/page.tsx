"use client";

import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function LandingPage() {
  return (
    <LayoutWrapper>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-grow text-center px-6 z-10 relative">
        <HeroSection />
      </section>

      {/* Feature Section */}
      <section className="py-12 z-10 relative">
        <div className="flex flex-wrap justify-center gap-8">
          <FeatureCard title="Resume Upload" description="Easily upload your resume for analysis." />
          <FeatureCard title="Mock Interviews" description="Practice with AI-driven questions." />
          <FeatureCard title="Instant Feedback" description="Get real-time feedback on your answers." />
        </div>
      </section>
    </LayoutWrapper>
  );
}
