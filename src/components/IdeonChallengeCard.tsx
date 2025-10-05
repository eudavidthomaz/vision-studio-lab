import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Camera, Lightbulb, Target, Video } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface IdeonChallengeProps {
  challenge: {
    roteiro?: string;
    dicas_de_foto?: string[];
    o_que_captar?: string[];
    como_captar?: string[];
    proposito?: string;
  };
}

const IdeonChallengeCard = ({ challenge }: IdeonChallengeProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Video className="h-6 w-6" />
            Desafio Ide.On
          </CardTitle>
          <CardDescription className="text-gray-400">
            Um novo desafio criativo para compartilhar sua fé
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Roteiro do Desafio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 whitespace-pre-wrap mb-4">{challenge.roteiro}</p>
          <Button
            onClick={() => copyToClipboard(challenge.roteiro || '', 'roteiro')}
            variant="outline"
            size="sm"
          >
            {copiedSection === 'roteiro' ? (
              <><Check className="h-4 w-4 mr-2" /> Copiado</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" /> Copiar Roteiro</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Dicas de Fotografia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {challenge.dicas_de_foto?.map((dica, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-gray-300">{dica}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            O Que Captar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {challenge.o_que_captar?.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">{index + 1}.</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Como Captar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {challenge.como_captar?.map((instrucao, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">→</span>
                <span className="text-gray-300">{instrucao}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Propósito do Desafio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 whitespace-pre-wrap">{challenge.proposito}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdeonChallengeCard;
