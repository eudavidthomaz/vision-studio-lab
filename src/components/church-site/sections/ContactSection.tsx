import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { MessageCircle, Instagram, Mail, MapPin } from "lucide-react";
import type { ChurchSiteConfig } from "@/types/churchSite";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

interface ContactSectionProps {
  config: ChurchSiteConfig;
}

export function ContactSection({ config }: ContactSectionProps) {
  // Anchor for "Quero visitar" scroll target
  const { contact, socialLinks, sectionTitles } = config;
  const titles = sectionTitles?.contact;

  const contactItems = [
    { icon: MessageCircle, label: "WhatsApp", href: contact.whatsapp, glow: "primary" as const },
    { icon: Instagram, label: "Instagram", href: socialLinks.instagram, glow: "red" as const },
    { icon: Mail, label: "E-mail", href: contact.email ? `mailto:${contact.email}` : null, glow: "blue" as const },
    { icon: MapPin, label: "Como chegar", href: contact.mapsUrl, glow: "cyan" as const },
  ].filter(item => item.href);

  if (contactItems.length === 0) return null;

  return (
    <section className="container mx-auto px-4 pb-12 md:pb-16">
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={fadeIn} className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {titles?.title || "Fale com a gente"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {titles?.subtitle || "Estamos aqui para ajudar você."}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {contactItems.map((item) => (
            <motion.div key={item.label} variants={fadeIn}>
              <a href={item.href!} target="_blank" rel="noopener noreferrer" className="block">
                <GlassCard glowColor={item.glow} className="p-5 sm:p-6 text-center cursor-pointer hover:scale-[1.02] transition-transform">
                  <div className="relative z-[10] flex flex-col items-center gap-3">
                    <div className="p-3 rounded-xl bg-church-primary/10">
                      <item.icon className="w-5 h-5 text-church-primary" />
                    </div>
                    <span className="text-foreground text-xs sm:text-sm font-medium">{item.label}</span>
                  </div>
                </GlassCard>
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default ContactSection;
