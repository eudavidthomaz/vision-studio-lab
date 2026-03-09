import React, { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeSwitch from "@/components/ui/theme-switch";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LimelightNav, type NavItem } from "@/components/ui/limelight-nav";
import { AnimatePresence, motion } from "framer-motion";
import { ChurchIcon, BookOpen, Play, MessageCircle } from "lucide-react";
import type { ChurchSiteConfig } from "@/types/churchSite";

// Section components
import { HeroSection } from "./sections/HeroSection";
import { FirstTimeSection } from "./sections/FirstTimeSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { AboutSection } from "./sections/AboutSection";
import { MinistriesSection } from "./sections/MinistriesSection";
import { MediaSection } from "./sections/MediaSection";
import { EventsSection } from "./sections/EventsSection";
import { PrayerSection } from "./sections/PrayerSection";
import { ContactSection } from "./sections/ContactSection";
import { GivingSection } from "./sections/GivingSection";
import { FooterSection } from "./sections/FooterSection";

const tabContent = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

const TAB_KEYS = ["inicio", "sobre", "midia", "contato"];

const navItems: NavItem[] = [
  { id: "inicio", icon: <ChurchIcon />, label: "Início" },
  { id: "sobre", icon: <BookOpen />, label: "Sobre" },
  { id: "midia", icon: <Play />, label: "Mídia" },
  { id: "contato", icon: <MessageCircle />, label: "Contato" },
];

interface ChurchSiteTemplateProps {
  config: ChurchSiteConfig;
  isPreview?: boolean;
}

export function ChurchSiteTemplate({ config, isPreview = false }: ChurchSiteTemplateProps) {
  const [activeTab, setActiveTab] = useState("inicio");
  const [siteTheme, setSiteTheme] = useState<"light" | "dark">(config.themeConfig.defaultMode);

  const { sectionsVisibility, themeConfig } = config;

  return (
    <div
      style={{
        '--church-primary': config.branding.primaryColor || 'hsl(263 70% 50%)',
        '--church-secondary': config.branding.secondaryColor || 'hsl(188 95% 40%)',
      } as React.CSSProperties}
      className={cn(
        "min-h-screen bg-background overflow-x-hidden",
        siteTheme === "dark" ? "bio-theme-dark" : "bio-theme-light",
        isPreview && "pointer-events-auto"
      )}
    >
      {/* Theme Toggle */}
      {themeConfig.allowToggle && (
        <div className="fixed top-4 right-4 z-[60]">
          <ThemeSwitch
            theme={siteTheme}
            setTheme={setSiteTheme}
            ariaLabel="Alternar tema do site"
          />
        </div>
      )}

      {/* Hero Section */}
      {sectionsVisibility.hero && <HeroSection config={config} />}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          {TAB_KEYS.map((key) => (
            <TabsTrigger key={key} value={key} />
          ))}
        </TabsList>

        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/20">
          <div className="container mx-auto px-4 flex justify-center py-3">
            <LimelightNav
              items={navItems}
              activeIndex={TAB_KEYS.indexOf(activeTab)}
              onTabChange={(index) => setActiveTab(TAB_KEYS[index])}
            />
          </div>
        </div>

        {/* Tab 1 - Início */}
        <TabsContent value="inicio" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            <motion.div key="inicio" {...tabContent} className="relative">
              <AnimatedGridPattern
                numSquares={20}
                maxOpacity={0.08}
                duration={4}
                className={cn(
                  "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                  "fill-primary/10 stroke-primary/10"
                )}
              />
              {sectionsVisibility.firstTime && <FirstTimeSection config={config} />}
              {sectionsVisibility.schedule && <ScheduleSection config={config} />}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Tab 2 - Sobre */}
        <TabsContent value="sobre" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            <motion.div key="sobre" {...tabContent} className="relative">
              <AnimatedGridPattern
                numSquares={20}
                maxOpacity={0.08}
                duration={4}
                className={cn(
                  "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                  "fill-primary/10 stroke-primary/10"
                )}
              />
              {sectionsVisibility.about && <AboutSection config={config} />}
              {sectionsVisibility.ministries && <MinistriesSection config={config} />}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Tab 3 - Mídia */}
        <TabsContent value="midia" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            <motion.div key="midia" {...tabContent} className="relative">
              <AnimatedGridPattern
                numSquares={20}
                maxOpacity={0.08}
                duration={4}
                className={cn(
                  "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                  "fill-primary/10 stroke-primary/10"
                )}
              />
              {sectionsVisibility.media && <MediaSection config={config} />}
              {sectionsVisibility.events && <EventsSection config={config} />}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Tab 4 - Contato */}
        <TabsContent value="contato" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            <motion.div key="contato" {...tabContent} className="relative">
              <AnimatedGridPattern
                numSquares={20}
                maxOpacity={0.08}
                duration={4}
                className={cn(
                  "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                  "fill-primary/10 stroke-primary/10"
                )}
              />
              {sectionsVisibility.prayer && <PrayerSection config={config} />}
              {sectionsVisibility.contact && <ContactSection config={config} />}
              {sectionsVisibility.giving && <GivingSection config={config} />}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <FooterSection config={config} />
    </div>
  );
}

export default ChurchSiteTemplate;
