import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { HandHeart, Copy, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
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

interface GivingSectionProps {
  config: ChurchSiteConfig;
}

export function GivingSection({ config }: GivingSectionProps) {
  const { giving, contact, sectionTitles } = config;
  const [copied, setCopied] = React.useState(false);
  const titles = sectionTitles?.giving;

  if (!giving.showSection) return null;

  const handleCopyPix = async () => {
    if (!giving.pixKey) return;
    try {
      await navigator.clipboard.writeText(giving.pixKey);
      setCopied(true);
      toast.success("Chave PIX copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <section className="container mx-auto px-4 pb-16 md:pb-24">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-2xl mx-auto"
      >
        <motion.div variants={fadeIn} className="text-center">
          <div className="flex justify-center mb-5">
            <div className="p-3 rounded-xl bg-church-primary/10">
              <HandHeart className="w-7 h-7 text-church-primary" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {titles?.title || "Dízimos e ofertas"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            {giving.description || titles?.subtitle || "Sua generosidade coopera com a missão, o cuidado com pessoas e o avanço da obra de Deus."}
          </p>

          {giving.pixKey ? (
            <div className="space-y-4">
              <GlassCard glowColor="primary" className="p-4 sm:p-6 max-w-sm mx-auto">
                <div className="relative z-[10]">
                  <p className="text-xs text-muted-foreground mb-2">Chave PIX</p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="text-sm sm:text-base font-mono text-foreground break-all">
                      {giving.pixKey}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyPix}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </GlassCard>

              <Button variant="solid" onClick={handleCopyPix} className="min-h-[48px]">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar chave PIX
                  </>
                )}
              </Button>
            </div>
          ) : contact.whatsapp ? (
            <Button variant="solid" asChild className="min-h-[48px]">
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                Contribuir <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default GivingSection;
