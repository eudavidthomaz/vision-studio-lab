import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  const filteredTemplates = selectedType === "all" 
    ? templates 
    : templates.filter(t => t.content_type === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Galeria de Templates
          </DialogTitle>
          <DialogDescription>
            Escolha um template para começar rapidamente
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("all")}
          >
            Todos
          </Button>
          <Button
            variant={selectedType === "post" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("post")}
          >
            Posts
          </Button>
          <Button
            variant={selectedType === "story" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("story")}
          >
            Stories
          </Button>
          <Button
            variant={selectedType === "reel" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("reel")}
          >
            Reels
          </Button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {selectedType === "all" 
                ? "Ainda não há templates disponíveis. Crie conteúdo incrível e salve como template!"
                : `Nenhum template de ${selectedType} disponível no momento.`}
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Criar Novo Conteúdo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Badge className={typeColors[template.content_type] || "bg-gray-500/20"}>
                      {template.content_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.pillar}</Badge>
                    <Button
                      size="sm"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      Usar Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
