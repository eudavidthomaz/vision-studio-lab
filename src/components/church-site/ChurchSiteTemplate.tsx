import React, { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeSwitch from "@/components/ui/theme-switch";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { StaticGridPattern } from "@/components/ui/static-grid-pattern";
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

// Grid pattern component — animated for public, static for preview
function GridPattern({ isPreview, className }: { isPreview: boolean; className: string }) {
  if (isPreview) {
    return (
      <StaticGridPattern
        numSquares={20}
        maxOpacity={0.08}
        className={className}
      />
    );
  }
  return (
    <AnimatedGridPattern
      numSquares={20}
      maxOpacity={0.08}
      duration={4}
      className={className}
    />
  );
}

// Tab content wrapper — animated for public, plain div for preview
function TabContentWrapper({
  isPreview,
  tabKey,
  children,
}: {
  isPreview: boolean;
  tabKey: string;
  children: React.ReactNode;
}) {
  if (isPreview) {
    return <div className="relative">{children}</div>;
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div key={tabKey} {...tabContent} className="relative">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function ChurchSiteTemplateInner({ config, isPreview = false }: ChurchSiteTemplateProps) {
  const [activeTab, setActiveTab] = useState("inicio");
  const [siteTheme, setSiteTheme] = useState<"light" | "dark">(config.themeConfig.defaultMode);

  const { sectionsVisibility, themeConfig } = config;

  const gridClass = cn(
    "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
    "fill-church-primary/10 stroke-church-primary/10"
  );

  return (
    <div
      style={{
        '--church-primary': config.branding.primaryColor || '#8B5CF6',
        '--church-secondary': config.branding.secondaryColor || '#6366F1',
      } as React.CSSProperties}
      className={cn(
        "min-h-screen bg-background overflow-x-hidden",
        siteTheme === "dark" ? "bio-theme-dark" : "bio-theme-light",
        isPreview && "pointer-events-auto isolate"
      )}
    >
      {/* Theme Toggle */}
      {themeConfig.allowToggle && (
        <div className={cn(
          "top-4 right-4 z-[60]",
          isPreview ? "absolute" : "fixed"
        )}>
          <ThemeSwitch
            theme={siteTheme}
            setTheme={setSiteTheme}
            ariaLabel="Alternar tema do site"
          />
        </div>
      )}

      {/* Hero Section */}
      {sectionsVisibility.hero && <HeroSection config={config} isPreview={isPreview} />}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          {TAB_KEYS.map((key) => (
            <TabsTrigger key={key} value={key} />
          ))}
        </TabsList>

        <div className={cn(
          "top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/20",
          isPreview ? "relative" : "sticky"
        )}>
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
          <TabContentWrapper isPreview={isPreview} tabKey="inicio">
            <GridPattern isPreview={isPreview} className={gridClass} />
            {sectionsVisibility.firstTime && <FirstTimeSection config={config} />}
            {sectionsVisibility.schedule && <ScheduleSection config={config} />}
          </TabContentWrapper>
        </TabsContent>

        {/* Tab 2 - Sobre */}
        <TabsContent value="sobre" className="mt-0 outline-none">
          <TabContentWrapper isPreview={isPreview} tabKey="sobre">
            <GridPattern isPreview={isPreview} className={gridClass} />
            {sectionsVisibility.about && <AboutSection config={config} />}
            {sectionsVisibility.ministries && <MinistriesSection config={config} />}
          </TabContentWrapper>
        </TabsContent>

        {/* Tab 3 - Mídia */}
        <TabsContent value="midia" className="mt-0 outline-none">
          <TabContentWrapper isPreview={isPreview} tabKey="midia">
            <GridPattern isPreview={isPreview} className={gridClass} />
            {sectionsVisibility.media && <MediaSection config={config} />}
            {sectionsVisibility.events && <EventsSection config={config} />}
          </TabContentWrapper>
        </TabsContent>

        {/* Tab 4 - Contato */}
        <TabsContent value="contato" className="mt-0 outline-none">
          <TabContentWrapper isPreview={isPreview} tabKey="contato">
            <GridPattern isPreview={isPreview} className={gridClass} />
            {sectionsVisibility.prayer && <PrayerSection config={config} />}
            {sectionsVisibility.contact && <ContactSection config={config} />}
            {sectionsVisibility.giving && <GivingSection config={config} />}
          </TabContentWrapper>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <FooterSection config={config} isPreview={isPreview} />
    </div>
  );
}

export const ChurchSiteTemplate = React.memo(ChurchSiteTemplateInner, (prev, next) => {
  return prev.isPreview === next.isPreview &&
    JSON.stringify(prev.config) === JSON.stringify(next.config);
});

export default ChurchSiteTemplate;
