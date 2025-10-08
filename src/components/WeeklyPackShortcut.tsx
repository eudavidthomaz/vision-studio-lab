import { Mic, ArrowRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface WeeklyPackShortcutProps {
  onClick: () => void;
}

export const WeeklyPackShortcut = ({ onClick }: WeeklyPackShortcutProps) => {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform duration-300">
            <Mic className="w-6 h-6 text-primary-foreground" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              Gerar Pack Semanal
            </h3>
            <p className="text-sm text-muted-foreground">
              Transforme seu sermão em 7 posts automaticamente
            </p>
            
            <div className="flex items-center gap-2 text-sm text-primary font-medium pt-1">
              <span>Começar agora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
