import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useContentFeed, NormalizedContent } from "@/hooks/useContentFeed";
import { ContentFeedFilters } from "@/components/content-feed/ContentFeedFilters";
import { ContentFeedCard } from "@/components/content-feed/ContentFeedCard";
import { ContentFeedModal } from "@/components/content-feed/ContentFeedModal";
import { EmptyFeedState } from "@/components/content-feed/EmptyFeedState";
import { ShareContentDialog } from "@/components/ShareContentDialog";

const MeusConteudos = () => {
  const navigate = useNavigate();
  const {
    contents,
    loading,
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    formatFilter,
    setFormatFilter,
    pilarFilter,
    setPilarFilter,
    sortBy,
    setSortBy,
    deleteContent,
    refreshContents,
  } = useContentFeed();

  const [selectedContent, setSelectedContent] = useState<NormalizedContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [contentToShare, setContentToShare] = useState<NormalizedContent | null>(null);

  const handleViewContent = (content: NormalizedContent) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleShare = (content: NormalizedContent) => {
    // Remove prefixo (ai-, pack-, challenge-) do ID para obter UUID puro
    const cleanId = content.id.replace(/^(ai|pack|challenge)-/, '');
    
    setContentToShare({
      ...content,
      id: cleanId
    });
    setShareDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este conteúdo?")) {
      await deleteContent(id);
    }
  };

  // Mapear contentType para o ShareContentDialog
  const getContentTypeForShare = (source: string): 'pack' | 'challenge' | 'planner' | 'generated' => {
    return 'generated';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="flex-shrink-0 mt-1"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
                ✨ Meus Conteúdos Gerados
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Todo o conteúdo criado com IA e packs semanais em um só lugar
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={refreshContents}
              className="flex-shrink-0 mt-1"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtros */}
          <ContentFeedFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            formatFilter={formatFilter}
            setFormatFilter={setFormatFilter}
            pilarFilter={pilarFilter}
            setPilarFilter={setPilarFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalCount={contents.length}
          />
        </div>

        {/* Grid de conteúdos */}
        {contents.length === 0 ? (
          <EmptyFeedState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {contents.map((content) => (
              <ContentFeedCard
                key={content.id}
                content={content}
                onView={handleViewContent}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <ContentFeedModal
          content={selectedContent}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />

        {/* Share Dialog */}
        {contentToShare && (
          <ShareContentDialog 
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            content={{ id: contentToShare.id }}
            contentType={getContentTypeForShare(contentToShare.source)}
          />
        )}
      </div>
    </div>
  );
};

export default MeusConteudos;
