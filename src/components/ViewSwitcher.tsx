import { LayoutGrid, List, Images } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = 'cards' | 'list' | 'gallery';

interface ViewSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewSwitcher({ viewMode, onViewModeChange }: ViewSwitcherProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
      className="border rounded-md"
    >
      <ToggleGroupItem value="cards" aria-label="Visualização em cards">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="Visualização em lista">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="gallery" aria-label="Visualização em galeria">
        <Images className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
