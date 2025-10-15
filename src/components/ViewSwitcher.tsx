import { LayoutGrid, List, Images } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "cards" | "list" | "gallery";

interface ViewSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewSwitcher({ viewMode, onViewModeChange }: ViewSwitcherProps) {
  return (
    <div className="w-full sm:w-auto overflow-x-auto">
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value) onViewModeChange(value as ViewMode);
        }}
        aria-label="Mudar modo de visualização"
        className="inline-flex border rounded-md bg-background"
      >
        <ToggleGroupItem
          value="cards"
          aria-label="Cards"
          title="Cards"
          className="
            h-10 w-10 sm:h-9 sm:w-9 
            data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          "
        >
          <LayoutGrid className="h-5 w-5 sm:h-4 sm:w-4" />
          <span className="sr-only">Cards</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="list"
          aria-label="Lista"
          title="Lista"
          className="
            h-10 w-10 sm:h-9 sm:w-9 
            data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          "
        >
          <List className="h-5 w-5 sm:h-4 sm:w-4" />
          <span className="sr-only">Lista</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="gallery"
          aria-label="Galeria"
          title="Galeria"
          className="
            h-10 w-10 sm:h-9 sm:w-9 
            data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          "
        >
          <Images className="h-5 w-5 sm:h-4 sm:w-4" />
          <span className="sr-only">Galeria</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
