import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface CarrosselViewProps {
  estrutura?: {
    cards?: Array<{
      numero: number;
      titulo: string;
      texto: string;
    }>;
  };
  conteudo?: {
    legenda?: string;
    hashtags?: string[];
  };
  dica_producao?: {
    formato?: string;
    cores?: string;
    fonte?: string;
    horario_postagem?: string;
  };
}

export function CarrosselView({ estrutura, conteudo, dica_producao }: CarrosselViewProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let fullText = "";
    
    if (estrutura?.cards) {
      fullText += "📱 CARDS DO CARROSSEL:\n\n";
      estrutura.cards.forEach(card => {
        fullText += `Card ${card.numero}: ${card.titulo}\n${card.texto}\n\n`;
      });
    }
    
    if (conteudo?.legenda) {
      fullText += "\n📝 LEGENDA:\n" + conteudo.legenda + "\n\n";
    }
    
    if (conteudo?.hashtags) {
      fullText += "\n🏷️ HASHTAGS:\n" + conteudo.hashtags.join(" ") + "\n";
    }
    
    navigator.clipboard.writeText(fullText);
    toast.success("Conteúdo completo copiado!");
  };

  return (
    <div className="space-y-6">
      {/* Estrutura Visual - Cards do Carrossel */}
      {estrutura?.cards && estrutura.cards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Estrutura Visual - {estrutura.cards.length} Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {estrutura.cards.map((card) => (
                  <CarouselItem key={card.numero}>
                    <Card className="border-2">
                      <CardHeader className="bg-primary/5">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Card {card.numero}: {card.titulo}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `${card.titulo}\n\n${card.texto}`,
                              `Card ${card.numero}`
                            )}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p className="text-sm whitespace-pre-line">{card.texto}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      {conteudo?.legenda && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Legenda para Instagram</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.legenda!, "Legenda")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{conteudo.legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {conteudo?.hashtags && conteudo.hashtags.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hashtags Sugeridas</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.hashtags!.join(" "), "Hashtags")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {conteudo.hashtags.map((tag, i) => (
                <span key={i} className="text-sm text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas de Produção */}
      {dica_producao && (
        <Card>
          <CardHeader>
            <CardTitle>Dicas de Produção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dica_producao.formato && (
              <div>
                <strong className="text-sm">Formato:</strong>
                <p className="text-sm text-muted-foreground">{dica_producao.formato}</p>
              </div>
            )}
            {dica_producao.cores && (
              <div>
                <strong className="text-sm">Cores:</strong>
                <p className="text-sm text-muted-foreground">{dica_producao.cores}</p>
              </div>
            )}
            {dica_producao.fonte && (
              <div>
                <strong className="text-sm">Fonte:</strong>
                <p className="text-sm text-muted-foreground">{dica_producao.fonte}</p>
              </div>
            )}
            {dica_producao.horario_postagem && (
              <div>
                <strong className="text-sm">Horário de Postagem:</strong>
                <p className="text-sm text-muted-foreground">{dica_producao.horario_postagem}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botão Copiar Tudo */}
      <div className="flex justify-center">
        <Button onClick={copyAll} variant="outline" size="lg">
          <Copy className="h-4 w-4 mr-2" />
          Copiar Tudo
        </Button>
      </div>
    </div>
  );
}
