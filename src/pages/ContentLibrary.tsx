import { useState, useEffect, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContentLibrary, ContentLibraryItem } from "@/hooks/useContentLibrary";
import { UnifiedContentModal } from "@/components/UnifiedContentModal";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import BulkActionsBar from "@/components/BulkActionsBar";
import ViewSwitcher, { ViewMode } from "@/components/ViewSwitcher";
import ContentListView from "@/components/ContentListView";
import ContentGalleryView from "@/components/ContentGalleryView";
import TagManagerDialog from "@/components/TagManagerDialog";
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Trash2, 
  Eye,
  Calendar,
  Star,
  Pin,
  Tags as TagsIcon,
  Copy,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Memoized content card component for grid view
const ContentItemCard = memo(({ 
  item, 
  onView, 
  onDelete, 
  onDuplicate, 
  isSelected, 
  onToggleSelection,
  onToggleFavorite,
  onTogglePin 
}: {
  item: ContentLibraryItem;
  onView: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isSelected: boolean;
  onToggleSelection: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  
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

  const handleSaveTitle = async () => {
    if (editedTitle.trim() && editedTitle !== item.title) {
      try {
        await supabase
          .from('content_library')
          .update({ title: editedTitle.trim() })
          .eq('id', item.id);
        toast.success('Título atualizado');
      } catch (error) {
        console.error('Error updating title:', error);
        toast.error('Erro ao atualizar título');
      }
    }
    setIsEditingTitle(false);
  };

  return (
    <Card className={cn(
      "relative hover:shadow-lg transition-shadow",
      isSelected && "ring-2 ring-primary"
    )}>
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelection}
        />
      </div>

      {/* Pin & Favorite buttons */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onTogglePin}
        >
          <Pin className={cn("h-4 w-4", item.is_pinned && "fill-primary text-primary")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleFavorite}
        >
          <Star className={cn("h-4 w-4", item.is_favorite && "fill-yellow-400 text-yellow-400")} />
        </Button>
      </div>

      <CardHeader className="pt-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="h-8"
              />
            ) : (
              <CardTitle 
                className="text-base truncate cursor-pointer hover:text-primary"
                onDoubleClick={() => setIsEditingTitle(true)}
              >
                {item.title}
              </CardTitle>
            )}
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
            onClick={onView}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onDuplicate}
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ContentItemCard.displayName = 'ContentItemCard';

export default function ContentLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    items, 
    loading, 
    hasMore, 
    filters, 
    setFilters, 
    deleteContent, 
    loadMore, 
    refresh,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    selectedCount,
    bulkDelete,
    bulkUpdateTags,
    bulkToggleFavorite,
    duplicateContent,
    exportToPDF,
    exportToTXT,
    exportToJSON,
    getAllTags,
    renameTag,
    deleteTag,
    togglePin,
    updateContent,
  } = useContentLibrary();
  
  const [selectedContent, setSelectedContent] = useState<ContentLibraryItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [globalTagDialogOpen, setGlobalTagDialogOpen] = useState(false);
  const sermonId = searchParams.get('sermon_id');
  
  // Infinite scroll observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Trigger load more when in view
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);
  
  // Filter by sermon_id if present in URL
  const displayedItems = sermonId 
    ? items.filter(item => item.sermon_id === sermonId)
    : items;

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir "${title}"?`)) {
      await deleteContent(id);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir ${selectedCount} conteúdos?`)) {
      await bulkDelete(Array.from(selectedIds));
    }
  };

  const handleExport = (format: 'pdf' | 'txt' | 'json') => {
    const ids = Array.from(selectedIds);
    if (format === 'pdf') exportToPDF(ids);
    else if (format === 'txt') exportToTXT(ids);
    else if (format === 'json') exportToJSON(ids);
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    await updateContent(id, { is_favorite: !current });
    refresh();
  };

  const handleTogglePin = async (id: string, current: boolean) => {
    const pinnedCount = items.filter(i => i.is_pinned).length;
    
    if (!current && pinnedCount >= 3) {
      toast.error('Máximo de 3 conteúdos fixados');
      return;
    }
    
    await togglePin(id);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateContent(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedCount}
          onExport={handleExport}
          onDelete={handleBulkDelete}
          onEditTags={() => setTagDialogOpen(true)}
          onToggleFavorite={() => bulkToggleFavorite(Array.from(selectedIds))}
          onDuplicate={() => {
            const ids = Array.from(selectedIds);
            ids.forEach(id => duplicateContent(id));
          }}
          onClearSelection={clearSelection}
        />

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
                {sermonId 
                  ? '✨ Conteúdos gerados do seu sermão'
                  : 'Todos os seus conteúdos unificados em um só lugar'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGlobalTagDialogOpen(true)}
              >
                <TagsIcon className="h-4 w-4 mr-2" />
                Gerenciar Tags
              </Button>
              
              <ViewSwitcher
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              
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

          {/* Contador e ações */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {displayedItems.length} {displayedItems.length === 1 ? 'conteúdo' : 'conteúdos'}
              </p>
              
              {displayedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                >
                  Selecionar Todos
                </Button>
              )}
            </div>
            
            {sermonId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/biblioteca')}
              >
                Ver Todos os Conteúdos
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        {loading && displayedItems.length === 0 ? (
          <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
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
        ) : displayedItems.length === 0 ? (
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
          <>
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedItems.map((item) => (
                  <ContentItemCard
                    key={item.id}
                    item={item}
                    onView={() => setSelectedContent(item)}
                    onDelete={() => handleDelete(item.id, item.title)}
                    onDuplicate={() => handleDuplicate(item.id)}
                    isSelected={selectedIds.has(item.id)}
                    onToggleSelection={() => toggleSelection(item.id)}
                    onToggleFavorite={() => handleToggleFavorite(item.id, item.is_favorite || false)}
                    onTogglePin={() => handleTogglePin(item.id, item.is_pinned || false)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <ContentListView
                items={displayedItems}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
                onView={(item) => setSelectedContent(item)}
                onDelete={(id) => {
                  const item = items.find(i => i.id === id);
                  if (item) handleDelete(id, item.title);
                }}
                onDuplicate={handleDuplicate}
                onToggleFavorite={handleToggleFavorite}
                onTogglePin={handleTogglePin}
              />
            )}

            {viewMode === 'gallery' && (
              <ContentGalleryView
                items={displayedItems}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
                onView={(item) => setSelectedContent(item)}
                onToggleFavorite={handleToggleFavorite}
                onTogglePin={handleTogglePin}
              />
            )}
            
            {/* Infinite scroll trigger */}
            {hasMore && !loading && (
              <div ref={loadMoreRef} className="py-8 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Carregando mais...</p>
              </div>
            )}
            
            {!hasMore && displayedItems.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                ✨ Todos os conteúdos foram carregados
              </p>
            )}
          </>
        )}

        {/* Modals */}
        <UnifiedContentModal
          content={selectedContent}
          open={!!selectedContent}
          onClose={() => setSelectedContent(null)}
        />

        <TagManagerDialog
          open={tagDialogOpen}
          onOpenChange={setTagDialogOpen}
          mode="content"
          onSave={(tags) => {
            bulkUpdateTags(Array.from(selectedIds), tags);
          }}
        />

        <TagManagerDialog
          open={globalTagDialogOpen}
          onOpenChange={setGlobalTagDialogOpen}
          mode="global"
          allTags={getAllTags}
          onRenameTag={renameTag}
          onDeleteTag={deleteTag}
        />
      </div>
    </div>
  );
}
