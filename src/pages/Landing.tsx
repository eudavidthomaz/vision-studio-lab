import { useNavigate } from "react-router-dom";
import { LandingHero } from "@/components/landing/LandingHero";
import { InteractiveDemoSection } from "@/components/landing/InteractiveDemoSection";
import { VisualShowcase } from "@/components/landing/VisualShowcase";
import { ProcessStoryTelling } from "@/components/landing/ProcessStoryTelling";
import { CapabilitiesGrid } from "@/components/landing/CapabilitiesGrid";
import { ImpactSection } from "@/components/landing/ImpactSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Landing = () => {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <LandingHero onCTA={handleCTA} />
      <InteractiveDemoSection />
      <VisualShowcase />
      <ProcessStoryTelling />
      <CapabilitiesGrid />
      <ImpactSection />
      <TestimonialsSection />
      <FinalCTA onCTA={handleCTA} />
      <LandingFooter />
    </div>
  );
};

export default Landing;
