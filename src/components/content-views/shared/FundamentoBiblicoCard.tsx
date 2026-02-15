import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "lucide-react";
import { safeString } from "@/lib/normalizeContentData";

interface FundamentoBiblicoCardProps {
  fundamento: {
    versiculos: string[];
    contexto: string;
    principio_atemporal?: string;
    principio?: string;
  };
}

export function FundamentoBiblicoCard({
  fundamento
}: FundamentoBiblicoCardProps) {
  if (!fundamento) return null;
  
  return (
    <Card className="bg-card border border-border rounded-xl">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-foreground">
          <div className="p-1 sm:p-1.5 bg-blue-500/20 rounded-lg flex-shrink-0">
            <Book className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          Fundamento Bíblico
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        
        {/* Versículos */}
        {fundamento.versiculos && fundamento.versiculos.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Versículos Base:</h4>
            <div className="space-y-2">
              {fundamento.versiculos.map((v, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-xl bg-muted/50 border-l-4 border-blue-500"
                >
                  <p className="text-sm italic text-foreground leading-relaxed">
                    {safeString(v)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Contexto */}
        {fundamento.contexto && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Contexto Histórico:</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {fundamento.contexto}
            </p>
          </div>
        )}
        
        {/* Princípio */}
        {(fundamento.principio_atemporal || fundamento.principio) && (
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <h4 className="font-semibold text-sm mb-2 text-primary flex items-center gap-2">
              <span>💡</span>
              Princípio Atemporal
            </h4>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {fundamento.principio_atemporal || fundamento.principio}
            </p>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}
