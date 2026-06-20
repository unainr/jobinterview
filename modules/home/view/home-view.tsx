import RevealHero from "./ui/components/reveal-hero";
import FeaturesSection from "./ui/components/features-section";
import HowItWorks from "./ui/components/how-it-works";
import CtaSection from "./ui/components/cta-section";

export const HomeView = () => {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
      <RevealHero />
      <FeaturesSection />
      <HowItWorks />
      <CtaSection />
    </div>
  );
};
