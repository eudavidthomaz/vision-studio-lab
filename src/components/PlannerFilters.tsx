import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface PlannerFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  totalResults: number;
}

export interface FilterState {
  type: string;
  pillar: string;
  hasImage: string;
  day: string;
}

const contentTypes = ["Post", "Story", "Reel", "Carrossel"];
const pillars = ["Edificar", "Alcançar", "Pertencer", "Servir", "Convite", "Comunidade", "Cobertura"];
const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function PlannerFilters({ onFilterChange, totalResults }: PlannerFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    pillar: "all",
    hasImage: "all",
    day: "all",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      type: "all",
      pillar: "all",
      hasImage: "all",
      day: "all",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "all");

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Filtros</h3>
          {hasActiveFilters && totalResults >= 0 && (
            <Badge variant="secondary" className="animate-in fade-in">
              {totalResults} {totalResults === 1 ? "resultado" : "resultados"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8"
          >
            {isExpanded ? "Ocultar" : "Expandir"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={filters.type} onValueChange={(v) => updateFilter("type", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {contentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pillar Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilar</label>
            <Select value={filters.pillar} onValueChange={(v) => updateFilter("pillar", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os pilares" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {pillars.map((pillar) => (
                  <SelectItem key={pillar} value={pillar}>
                    {pillar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Imagem</label>
            <Select value={filters.hasImage} onValueChange={(v) => updateFilter("hasImage", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="with">Com imagem</SelectItem>
                <SelectItem value="without">Sem imagem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dia</label>
            <Select value={filters.day} onValueChange={(v) => updateFilter("day", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os dias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {days.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
