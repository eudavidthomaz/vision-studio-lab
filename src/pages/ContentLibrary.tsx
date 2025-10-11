import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContentLibrary, ContentLibraryItem } from "@/hooks/useContentLibrary";
import { UnifiedContentModal } from "@/components/UnifiedContentModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Search, 
  Grid3x3, 
  List, 
  RefreshCw, 
  Trash2, 
  Eye,
  Calendar,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ContentLibrary() {
  const navigate = useNavigate();
  const { items, loading, filters, setFilters, deleteContent, refresh } = useContentLibrary();
  const [selectedContent, setSelectedContent] = useState<ContentLibraryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir "${title}"?`)) {
      await deleteContent(id);
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'carrossel': '🎠 Carrossel',
      'reel': '🎬 Reels',
      'stories': '📱 Stories',
      'post': '📝 Post',
      'devocional': '📖 Devocional',
      'estudo': '📚 Estudo',
      'esboco': '📋 Esboço',
      'desafio_semanal': '💪 Desafio',
      'roteiro_video': '🎥 Roteiro'
    };
    return labels[type] || type;
  };

  const getPilarColor = (pilar: string) => {
    const colors: Record<string, string> = {
      'ALCANÇAR': 'bg-blue-500',
      'EDIFICAR': 'bg-green-500',
      'ENVIAR': 'bg-purple-500',
      'EXALTAR': 'bg-yellow-500'
    };
    return colors[pilar] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Biblioteca de Conteúdo
              </h1>
              <p className="text-muted-foreground mt-1">
                Todos os seus conteúdos unificados em um só lugar
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={refresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou prompt..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Tipo */}
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="carrossel">Carrossel</SelectItem>
                <SelectItem value="reel">Reels</SelectItem>
                <SelectItem value="stories">Stories</SelectItem>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="devocional">Devocional</SelectItem>
                <SelectItem value="estudo">Estudo Bíblico</SelectItem>
                <SelectItem value="esboco">Esboço</SelectItem>
              </SelectContent>
            </Select>

            {/* Fonte */}
            <Select
              value={filters.source}
              onValueChange={(value) => setFilters({ ...filters, source: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fontes</SelectItem>
                <SelectItem value="ai-creator">IA Creator</SelectItem>
                <SelectItem value="audio-pack">Pack Semanal</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            {/* Pilar */}
            <Select
              value={filters.pilar}
              onValueChange={(value) => setFilters({ ...filters, pilar: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pilares</SelectItem>
                <SelectItem value="ALCANÇAR">ALCANÇAR</SelectItem>
                <SelectItem value="EDIFICAR">EDIFICAR</SelectItem>
                <SelectItem value="ENVIAR">ENVIAR</SelectItem>
                <SelectItem value="EXALTAR">EXALTAR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contador */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados'}
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {filters.search || filters.type !== 'all' || filters.source !== 'all' || filters.pilar !== 'all'
                    ? 'Tente ajustar os filtros'
                    : 'Comece criando seu primeiro conteúdo!'}
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Criar Conteúdo
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {getContentTypeLabel(item.content_type)}
                    </Badge>
                    <Badge className={`${getPilarColor(item.pilar)} text-white text-xs`}>
                      {item.pilar}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {item.prompt_original && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {item.prompt_original}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedContent(item)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id, item.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <UnifiedContentModal
          content={selectedContent}
          open={!!selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      </div>
    </div>
  );
}
