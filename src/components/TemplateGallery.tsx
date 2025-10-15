import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Template {
  id: string;
  name: string;
  description: string;
  content_type: string;
  pillar: string;
  template_data: any;
  thumbnail_url?: string;
}

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (templateData: any) => void;
  selectedDay?: string;
}

const typeColors: Record<string, string> = {
  post: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  story: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  reel: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

export default function TemplateGallery({ open, onOpenChange, onApplyTemplate, selectedDay }: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (template: Template) => {
    onApplyTemplate({
      ...template.template_data,
      tipo: template.content_type,
      pilar: template.pillar,
      dia_sugerido: selectedDay,
    });
    onOpenChange(false);
    toast({
      title: "✨ Template aplicado!",
      description: `"${template.name}" foi adicionado ao planner.`,
    });
  };

  const filteredTemplates =
    selectedType === "all" ? templates : templates.filter((t) => t.content_type === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Mobile-first container: fills width, uses safe viewport height, no horizontal overflow */}
      <DialogContent
        className="
          w-[min(100vw,90rem)] max-w-[98vw] sm:max-w-3xl md:max-w-5xl
          h-[min(92svh,92dvh)] p-0 overflow-hidden rounded-xl sm:rounded-2xl
        "
      >
        {/* Flex wrapper to create a sticky header + scrollable body layout */}
        <div className="flex h-full w-full min-w-0 flex-col overflow-x-clip">
          {/* Drag handle for mobile */}
          <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-muted" />

          {/* Header (sticky) */}
          <DialogHeader className="px-4 pb-3 pt-2 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Galeria de Templates
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Escolha um template para começar rapidamente
            </DialogDescription>

            {/* Filters - wrap on small, inline on larger screens */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
                className="h-8"
              >
                Todos
              </Button>
              <Button
                variant={selectedType === "post" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("post")}
                className="h-8"
              >
                Posts
              </Button>
              <Button
                variant={selectedType === "story" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("story")}
                className="h-8"
              >
                Stories
              </Button>
              <Button
                variant={selectedType === "reel" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("reel")}
                className="h-8"
              >
                Reels
              </Button>
            </div>
          </DialogHeader>

          {/* Scrollable content area */}
          <ScrollArea className="flex-1 min-w-0 touch-pan-y overscroll-contain scroll-smooth-ios">
            <div className="p-4 pb-[env(safe-area-inset-bottom)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 px-2">
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold">Nenhum template encontrado</h3>
                  <p className="mx-auto mb-4 max-w-md text-xs sm:text-sm text-muted-foreground">
                    {selectedType === "all"
                      ? "Ainda não há templates disponíveis. Crie conteúdo incrível e salve como template!"
                      : `Nenhum template de ${selectedType} disponível no momento.`}
                  </p>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Criar Novo Conteúdo
                  </Button>
                </div>
              ) : (
                <div
                  className="
                    grid grid-cols-1 gap-4
                    sm:grid-cols-2
                  "
                >
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="hover:border-primary transition-colors">
                      <CardHeader className="space-y-2">
                        {/* Optional thumbnail (kept responsive) */}
                        {template.thumbnail_url && (
                          <div className="overflow-hidden rounded-md">
                            <img
                              src={template.thumbnail_url}
                              alt={template.name}
                              loading="lazy"
                              className="h-auto w-full max-h-40 object-cover"
                            />
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base break-words">{template.name}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-3 break-words">
                              {template.description}
                            </CardDescription>
                          </div>
                          <Badge
                            className={
                              typeColors[template.content_type] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
                            }
                          >
                            {template.content_type}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex items-center justify-between gap-3">
                        <Badge variant="outline" className="truncate">
                          {template.pillar}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleApplyTemplate(template)}
                          className="shrink-0"
                          aria-label={`Usar template ${template.name}`}
                        >
                          Usar Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
