import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, AudioLines, X } from "lucide-react";
import { ContentSource, ContentFormat, ContentPilar } from "@/hooks/useContentFeed";

interface ContentFeedFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sourceFilter: ContentSource | "all";
  setSourceFilter: (value: ContentSource | "all") => void;
  formatFilter: ContentFormat;
  setFormatFilter: (value: ContentFormat) => void;
  pilarFilter: ContentPilar;
  setPilarFilter: (value: ContentPilar) => void;
  sortBy: "recent" | "oldest" | "title";
  setSortBy: (value: "recent" | "oldest" | "title") => void;
  totalCount: number;
}

export function ContentFeedFilters({
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
  totalCount,
}: ContentFeedFiltersProps) {
  const hasActiveFilters = searchTerm || sourceFilter !== "all" || formatFilter !== "all" || pilarFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSourceFilter("all");
    setFormatFilter("all");
    setPilarFilter("all");
  };

  return (
    <div className="space-y-4 min-w-0 overflow-x-clip">
      {/* Busca */}
      <div className="relative min-w-0">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          placeholder="Buscar por título, versículo, hashtags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 shrink-0"
            onClick={() => setSearchTerm("")}
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtros de Fonte */}
      <Tabs value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)}>
        <TabsList className="grid w-full min-w-0 grid-cols-2 sm:grid-cols-3 gap-2">
          <TabsTrigger value="all" className="truncate text-xs sm:text-sm px-2 sm:px-3">
            Todos ({totalCount})
          </TabsTrigger>
          <TabsTrigger value="ai-creator" className="gap-2 truncate text-xs sm:text-sm px-2 sm:px-3">
            <Sparkles className="h-4 w-4 shrink-0" />
            IA Criativa
          </TabsTrigger>
          <TabsTrigger value="week-pack" className="gap-2 truncate text-xs sm:text-sm px-2 sm:px-3">
            <AudioLines className="h-4 w-4 shrink-0" />
            Pack Semanal
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filtros Avançados */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
        <Select value={formatFilter} onValueChange={(v) => setFormatFilter(v as ContentFormat)}>
          <SelectTrigger className="flex-1 min-w-0">
            <SelectValue placeholder="Formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os formatos</SelectItem>
            <SelectItem value="carrossel">📸 Carrossel</SelectItem>
            <SelectItem value="reel">🎬 Reel</SelectItem>
            <SelectItem value="post">📝 Post</SelectItem>
            <SelectItem value="story">📱 Story</SelectItem>
          </SelectContent>
        </Select>

        <Select value={pilarFilter} onValueChange={(v) => setPilarFilter(v as ContentPilar)}>
          <SelectTrigger className="flex-1 min-w-0">
            <SelectValue placeholder="Pilar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pilares</SelectItem>
            <SelectItem value="ALCANÇAR">🎯 ALCANÇAR</SelectItem>
            <SelectItem value="EDIFICAR">🏗️ EDIFICAR</SelectItem>
            <SelectItem value="ENVIAR">🚀 ENVIAR</SelectItem>
            <SelectItem value="EXALTAR">🙌 EXALTAR</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="flex-1 min-w-0">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="title">A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground min-w-0">
          <span className="truncate">Filtros ativos</span>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 shrink-0">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
