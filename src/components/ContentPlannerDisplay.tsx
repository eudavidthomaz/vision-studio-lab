import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileText, Image as ImageIcon, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PlannerPost {
  day: string;
  type: string;
  title?: string;
  text: string;
  pillar?: string;
  verse?: string;
  hashtags?: string[];
  cta?: string;
  image?: string;
}

interface ContentPlannerDisplayProps {
  content: PlannerPost[];
}

const daysOfWeek = [
  { key: 'domingo', label: 'Domingo' },
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca', label: 'Terça' },
  { key: 'quarta', label: 'Quarta' },
  { key: 'quinta', label: 'Quinta' },
  { key: 'sexta', label: 'Sexta' },
  { key: 'sabado', label: 'Sábado' },
];

const contentTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  post: { icon: FileText, color: 'bg-blue-500/10 text-blue-700 border-blue-200', label: '📝 Post' },
  story: { icon: ImageIcon, color: 'bg-purple-500/10 text-purple-700 border-purple-200', label: '📸 Story' },
  reel: { icon: Video, color: 'bg-pink-500/10 text-pink-700 border-pink-200', label: '🎥 Reel' },
  video: { icon: Video, color: 'bg-red-500/10 text-red-700 border-red-200', label: '🎬 Vídeo' },
};

const pillarColors: Record<string, string> = {
  'Edificação': 'bg-green-500/10 text-green-700 border-green-200',
  'Evangelismo': 'bg-orange-500/10 text-orange-700 border-orange-200',
  'Ensino': 'bg-blue-500/10 text-blue-700 border-blue-200',
  'Testemunho': 'bg-purple-500/10 text-purple-700 border-purple-200',
  'Comunidade': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  'Oração': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
};

export default function ContentPlannerDisplay({ content }: ContentPlannerDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Organizar posts por dia da semana
  const postsByDay = daysOfWeek.reduce((acc, day) => {
    acc[day.key] = content.filter(
      post => post.day?.toLowerCase().includes(day.key) || 
              post.day?.toLowerCase() === day.label.toLowerCase()
    );
    return acc;
  }, {} as Record<string, PlannerPost[]>);

  const handleCopy = async (post: PlannerPost, index: number) => {
    const textToCopy = `${post.text}

${post.verse ? `📖 ${post.verse}\n\n` : ''}${post.hashtags?.length ? post.hashtags.join(' ') : ''}${post.cta ? `\n\n👉 ${post.cta}` : ''}`;

    await navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    toast.success('Conteúdo copiado!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Planejamento de Conteúdo
          </h2>
          <p className="text-muted-foreground mt-1">
            {content.length} {content.length === 1 ? 'post planejado' : 'posts planejados'} para a semana
          </p>
        </div>
      </div>

      <Tabs defaultValue="domingo" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          {daysOfWeek.map(day => (
            <TabsTrigger key={day.key} value={day.key} className="text-xs sm:text-sm">
              {day.label}
              {postsByDay[day.key].length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {postsByDay[day.key].length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {daysOfWeek.map(day => (
          <TabsContent key={day.key} value={day.key} className="space-y-4 animate-fade-in">
            {postsByDay[day.key].length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Nenhum conteúdo planejado para {day.label}</p>
                </CardContent>
              </Card>
            ) : (
              postsByDay[day.key].map((post, index) => {
                const globalIndex = content.findIndex(p => p === post);
                const typeConfig = contentTypeConfig[post.type?.toLowerCase()] || contentTypeConfig.post;
                const TypeIcon = typeConfig.icon;

                return (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2 flex-1">
                          <Badge className={typeConfig.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {post.type}
                          </Badge>
                          {post.pillar && (
                            <Badge className={pillarColors[post.pillar] || 'bg-gray-500/10 text-gray-700 border-gray-200'}>
                              {post.pillar}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(post, globalIndex)}
                          className="shrink-0"
                        >
                          {copiedIndex === globalIndex ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                      {post.title && (
                        <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Texto principal */}
                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {post.text}
                        </p>
                      </div>

                      {/* Versículo */}
                      {post.verse && (
                        <div className="flex items-start gap-2 text-sm border-l-4 border-primary pl-4 py-2">
                          <span className="text-lg">📖</span>
                          <p className="text-muted-foreground italic">{post.verse}</p>
                        </div>
                      )}

                      {/* Hashtags */}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {post.hashtags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      {post.cta && (
                        <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <span>👉</span>
                            <span>{post.cta}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
