import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Star, Pin, Image as ImageIcon } from "lucide-react";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { cn } from "@/lib/utils";

interface ContentGalleryViewProps {
  items: ContentLibraryItem[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onView: (item: ContentLibraryItem) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTogglePin: (id: string, current: boolean) => void;
}

const ContentGalleryView = memo(function ContentGalleryView({
  items,
  selectedIds,
  onToggleSelection,
  onView,
  onToggleFavorite,
  onTogglePin,
}: ContentGalleryViewProps) {
  const getImageUrl = (item: ContentLibraryItem) => {
    // Try to get image from content
    if (item.content?.imagem_url) return item.content.imagem_url;
    if (item.content?.image_url) return item.content.image_url;
    if (item.content?.slides?.[0]?.imagem_url) return item.content.slides[0].imagem_url;
    return null;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => {
        const imageUrl = getImageUrl(item);
        const isSelected = selectedIds.has(item.id);

        return (
          <Card
            key={item.id}
            className={cn(
              "relative overflow-hidden group hover:shadow-lg transition-shadow",
              isSelected && "ring-2 ring-primary"
            )}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(item.id)}
                className="bg-white shadow-md"
              />
            </div>

            {/* Pin Button */}
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-md"
                onClick={() => onTogglePin(item.id, item.is_pinned || false)}
              >
                <Pin className={`h-4 w-4 ${item.is_pinned ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </div>

            {/* Image */}
            <div 
              className="aspect-square bg-muted flex items-center justify-center cursor-pointer"
              onClick={() => onView(item)}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              )}
            </div>

            {/* Overlay with info (visible on hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                {item.title}
              </h3>
              
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-xs">
                  {item.pilar}
                </Badge>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                    onClick={() => onToggleFavorite(item.id, item.is_favorite || false)}
                  >
                    <Star className={`h-4 w-4 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                    onClick={() => onView(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Favorite indicator (always visible) */}
            {item.is_favorite && (
              <div className="absolute bottom-2 left-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
});

export default ContentGalleryView;
