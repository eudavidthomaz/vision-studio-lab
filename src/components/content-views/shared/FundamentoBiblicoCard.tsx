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
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Book className="w-5 h-5 text-blue-600" />
          Fundamento Bíblico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Versículos */}
        {fundamento.versiculos && fundamento.versiculos.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Versículos Base:</h4>
            <div className="space-y-2">
              {fundamento.versiculos.map((v, i) => (
                <div 
                  key={i} 
                  className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                >
                  <p className="text-sm italic text-blue-900 dark:text-blue-100">
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
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {fundamento.contexto}
            </p>
          </div>
        )}
        
        {/* Princípio */}
        {(fundamento.principio_atemporal || fundamento.principio) && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-sm mb-2 text-amber-800 dark:text-amber-200">
              💡 Princípio Atemporal:
            </h4>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {fundamento.principio_atemporal || fundamento.principio}
            </p>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}
