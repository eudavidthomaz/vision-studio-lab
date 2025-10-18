import { useState, useEffect, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContentLibrary, ContentLibraryItem } from "@/hooks/useContentLibrary";
import { UnifiedContentModal } from "@/components/UnifiedContentModal";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
                className="text-base truncate break-words cursor-pointer hover:text-primary"
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
          <p className="text-sm text-muted-foreground line-clamp-2 break-words mb-4">
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
    <div className="min-h-screen bg-background overflow-x-clip">
      {/* Header fixo no topo */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto px-4 py-3 max-w-7xl">
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
          <div className="mb-4">
            {/* Linha 1: Botão Voltar + Título */}
            <div className="flex items-start gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="flex-shrink-0 h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                  <span className="truncate">Biblioteca de Conteúdo</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {sermonId 
                    ? '✨ Conteúdos gerados do seu sermão'
                    : 'Todos os seus conteúdos unificados em um só lugar'}
                </p>
              </div>
            </div>

            {/* Linha 2: Botões de ação */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGlobalTagDialogOpen(true)}
                className="w-full sm:w-auto h-9"
              >
                <TagsIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Gerenciar Tags</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <ViewSwitcher
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={refresh}
                  className="h-9 w-9"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Barra compacta com contador + botão de filtros */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {displayedItems.length} {displayedItems.length === 1 ? 'conteúdo' : 'conteúdos'}
            </p>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Search className="h-4 w-4" />
                  Filtros
                  {(filters.search || filters.type !== 'all' || filters.source !== 'all' || filters.pilar !== 'all') && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {[filters.search, filters.type !== 'all', filters.source !== 'all', filters.pilar !== 'all'].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Digite para buscar..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Tipo de Conteúdo</label>
                    <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Todos os tipos" />
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
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Fonte</label>
                    <Select value={filters.source} onValueChange={(value) => setFilters({ ...filters, source: value })}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Todas as fontes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as fontes</SelectItem>
                        <SelectItem value="ai-creator">IA Creator</SelectItem>
                        <SelectItem value="audio-pack">Pack Semanal</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Pilar</label>
                    <Select value={filters.pilar} onValueChange={(value) => setFilters({ ...filters, pilar: value })}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Todos os pilares" />
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

                  {(filters.search || filters.type !== 'all' || filters.source !== 'all' || filters.pilar !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ search: '', type: 'all', source: 'all', pilar: 'all', status: 'all' })}
                      className="w-full h-9"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Ações adicionais */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {displayedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="h-9"
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
                className="h-9"
              >
                Ver Todos
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <div className="mx-auto px-4 py-6 max-w-7xl">

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
