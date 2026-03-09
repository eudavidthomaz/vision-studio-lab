import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HandHeart, ArrowRight, Copy, Check } from "lucide-react";
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
  const { giving, contact } = config;
  const [copied, setCopied] = React.useState(false);

  if (!giving.showSection) return null;

  const handleCopyPix = async () => {
    if (giving.pixKey) {
      try {
        await navigator.clipboard.writeText(giving.pixKey);
        setCopied(true);
        toast.success("Chave PIX copiada!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Não foi possível copiar");
      }
    }
  };

  return (
    <section className="container mx-auto px-4 pb-16 md:pb-24">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <motion.div variants={fadeIn}>
          <div className="flex justify-center mb-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <HandHeart className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Dízimos e ofertas</h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            {giving.description || "Sua generosidade coopera com a missão, o cuidado com pessoas e o avanço da obra de Deus."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {giving.pixKey && (
              <Button variant="solid" onClick={handleCopyPix} className="min-h-[48px]">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar PIX
                  </>
                )}
              </Button>
            )}
            {contact.whatsapp && (
              <Button variant="outline" asChild className="min-h-[48px]">
                <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                  Contribuir <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default GivingSection;
