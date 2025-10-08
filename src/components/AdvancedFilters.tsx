import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface AdvancedFilterState {
  type: string;
  pillar: string;
  hasImage: string;
  day: string;
  status: string;
  favorite: string;
  archived: string;
  searchTerm: string;
  tags: string[];
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: AdvancedFilterState) => void;
  totalResults: number;
}

export default function AdvancedFilters({
  onFilterChange,
  totalResults,
}: AdvancedFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilterState>({
    type: "all",
    pillar: "all",
    hasImage: "all",
    day: "all",
    status: "all",
    favorite: "all",
    archived: "no",
    searchTerm: "",
    tags: [],
  });

  const updateFilter = <K extends keyof AdvancedFilterState>(
    key: K,
    value: AdvancedFilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: AdvancedFilterState = {
      type: "all",
      pillar: "all",
      hasImage: "all",
      day: "all",
      status: "all",
      favorite: "all",
      archived: "no",
      searchTerm: "",
      tags: [],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.pillar !== "all" ||
    filters.hasImage !== "all" ||
    filters.day !== "all" ||
    filters.status !== "all" ||
    filters.favorite !== "all" ||
    filters.archived !== "no" ||
    filters.searchTerm !== "" ||
    filters.tags.length > 0;

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Filtros Avançados
              </Button>
            </CollapsibleTrigger>
            {totalResults > 0 && (
              <Badge
                variant="secondary"
                className="animate-scale-in"
              >
                {totalResults} resultado{totalResults !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4">
          {/* Search Bar */}
          <div className="space-y-2">
            <Label>Buscar no conteúdo</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite para buscar..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => updateFilter("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Post">Post</SelectItem>
                  <SelectItem value="Story">Story</SelectItem>
                  <SelectItem value="Reel">Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pilar</Label>
              <Select
                value={filters.pillar}
                onValueChange={(value) => updateFilter("pillar", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Edificar">Edificar</SelectItem>
                  <SelectItem value="Alcançar">Alcançar</SelectItem>
                  <SelectItem value="Pertencer">Pertencer</SelectItem>
                  <SelectItem value="Servir">Servir</SelectItem>
                  <SelectItem value="Convite">Convite</SelectItem>
                  <SelectItem value="Comunidade">Comunidade</SelectItem>
                  <SelectItem value="Cobertura">Cobertura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Imagem</Label>
              <Select
                value={filters.hasImage}
                onValueChange={(value) => updateFilter("hasImage", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="with">Com imagem</SelectItem>
                  <SelectItem value="without">Sem imagem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dia</Label>
              <Select
                value={filters.day}
                onValueChange={(value) => updateFilter("day", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Segunda">Segunda</SelectItem>
                  <SelectItem value="Terça">Terça</SelectItem>
                  <SelectItem value="Quarta">Quarta</SelectItem>
                  <SelectItem value="Quinta">Quinta</SelectItem>
                  <SelectItem value="Sexta">Sexta</SelectItem>
                  <SelectItem value="Sábado">Sábado</SelectItem>
                  <SelectItem value="Domingo">Domingo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Favoritos</Label>
              <Select
                value={filters.favorite}
                onValueChange={(value) => updateFilter("favorite", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="yes">Apenas favoritos</SelectItem>
                  <SelectItem value="no">Não favoritos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Arquivados</Label>
              <Select
                value={filters.archived}
                onValueChange={(value) => updateFilter("archived", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Ocultar</SelectItem>
                  <SelectItem value="yes">Apenas arquivados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
