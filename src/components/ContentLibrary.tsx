import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SimpleContentCard, ContentItem } from "./SimpleContentCard";
import { ContentDetailModal } from "./ContentDetailModal";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ContentLibraryProps {
  limit?: number | null;
  showSearch?: boolean;
  compact?: boolean;
  showPagination?: boolean;
}

export function ContentLibrary({
  limit = null,
  showSearch = true,
  compact = false,
  showPagination = false,
}: ContentLibraryProps) {
  const [loading, setLoading] = useState(true);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterAndSortContent();
  }, [allContent, searchTerm, typeFilter, sortBy]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado",
        });
        return;
      }

      const content: ContentItem[] = [];

      // Buscar weekly packs
      const { data: packs } = await supabase
        .from("weekly_packs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (packs) {
        packs.forEach((pack) => {
          const packData = pack.pack as any;
          if (packData?.posts && Array.isArray(packData.posts)) {
            // Pack completo
            content.push({
              id: `pack-${pack.id}`,
              type: "pack",
              title: `Pack Completo - ${packData.posts.length} posts`,
              copy: packData.posts[0]?.copy || "Pack de conteúdo",
              hashtags: packData.posts[0]?.hashtags || [],
              pilar: packData.posts[0]?.pilar || "",
              createdAt: new Date(pack.created_at),
              fullData: { posts: packData.posts, packId: pack.id },
            });

            // Posts individuais do pack
            packData.posts.forEach((post: any, idx: number) => {
              content.push({
                id: `pack-${pack.id}-post-${idx}`,
                type: "post",
                title: `Post ${idx + 1} do Pack`,
                copy: post.copy || "",
                hashtags: post.hashtags || [],
                pilar: post.pilar || "",
                createdAt: new Date(pack.created_at),
                fullData: post,
              });
            });
          }
        });
      }

      // Buscar challenges
      const { data: challenges } = await supabase
        .from("ideon_challenges")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (challenges) {
        challenges.forEach((challenge) => {
          const challengeData = challenge.challenge as any;
          content.push({
            id: `challenge-${challenge.id}`,
            type: "challenge",
            title: challengeData?.title || "Desafio Ide.On",
            copy: challengeData?.description || "",
            hashtags: challengeData?.hashtags || [],
            pilar: challengeData?.pilar || "",
            createdAt: new Date(challenge.created_at),
            fullData: challengeData,
          });
        });
      }

      // Buscar content planners
      const { data: planners } = await supabase
        .from("content_planners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (planners) {
        planners.forEach((planner) => {
          const plannerData = planner.content as any;
          if (plannerData && typeof plannerData === "object") {
            Object.values(plannerData).forEach((dayContent: any) => {
              if (Array.isArray(dayContent)) {
                dayContent.forEach((item: any, idx: number) => {
                  content.push({
                    id: `planner-${planner.id}-${idx}`,
                    type: "post",
                    title: item.copy?.slice(0, 50) || "Post do Planner",
                    copy: item.copy || "",
                    hashtags: item.hashtags || [],
                    pilar: item.pilar || "",
                    createdAt: new Date(planner.created_at),
                    fullData: item,
                  });
                });
              }
            });
          }
        });
      }

      setAllContent(content);
    } catch (error) {
      console.error("Erro ao carregar conteúdo:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar biblioteca de conteúdo",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortContent = () => {
    let filtered = [...allContent];

    // Filtro de busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.copy.toLowerCase().includes(search) ||
          item.hashtags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Filtro de tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "az":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredContent(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      const [type, tableId] = id.split("-");

      if (type === "pack") {
        await supabase.from("weekly_packs").delete().eq("id", tableId);
      } else if (type === "challenge") {
        await supabase.from("ideon_challenges").delete().eq("id", tableId);
      } else if (type === "planner") {
        await supabase.from("content_planners").delete().eq("id", tableId.split("-")[0]);
      }

      toast({
        title: "🗑️ Deletado",
        description: "Conteúdo removido com sucesso",
      });

      loadContent();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao deletar conteúdo",
      });
    }
  };

  const displayedContent = limit
    ? filteredContent.slice(0, limit)
    : showPagination
    ? filteredContent.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : filteredContent;

  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, conteúdo ou hashtags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full">
              <TabsList className="w-full grid grid-cols-5 gap-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-4">Todos</TabsTrigger>
                <TabsTrigger value="post" className="text-xs sm:text-sm px-2 sm:px-4">Posts</TabsTrigger>
                <TabsTrigger value="foto" className="text-xs sm:text-sm px-2 sm:px-4">Fotos</TabsTrigger>
                <TabsTrigger value="video" className="text-xs sm:text-sm px-2 sm:px-4">Vídeos</TabsTrigger>
                <TabsTrigger value="pack" className="text-xs sm:text-sm px-2 sm:px-4">Packs</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-auto min-w-[160px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recente</SelectItem>
                <SelectItem value="oldest">Mais antigo</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || typeFilter !== "all"
              ? "Nenhum conteúdo encontrado com os filtros aplicados"
              : "Você ainda não criou nenhum conteúdo"}
          </p>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-3 sm:gap-4 ${
              compact
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {displayedContent.map((item) => (
              <SimpleContentCard
                key={item.id}
                item={item}
                onView={setSelectedItem}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <ContentDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </div>
  );
}
