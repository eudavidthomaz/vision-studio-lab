import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Star, Pin, Image as ImageIcon } from "lucide-react";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const getImageUrl = (item: ContentLibraryItem) => {
    if (item.content?.imagem_url) return item.content.imagem_url;
    if (item.content?.image_url) return item.content.image_url;
    if (item.content?.slides?.[0]?.imagem_url) return item.content.slides[0].imagem_url;
    return null;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
      {items.map((item) => {
        const imageUrl = getImageUrl(item);
        const isSelected = selectedIds.has(item.id);

        return (
          <Card
            key={item.id}
            className={cn(
              "relative overflow-hidden transition-shadow",
              !isMobile && "group hover:shadow-lg",
              isSelected && "ring-2 ring-primary"
            )}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(item.id)}
                className="bg-background shadow-md"
              />
            </div>

            {/* Pin Button */}
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 bg-background/80 backdrop-blur-sm shadow-md"
                onClick={() => onTogglePin(item.id, item.is_pinned || false)}
              >
                <Pin className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", item.is_pinned && "fill-primary text-primary")} />
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
                <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30" />
              )}
            </div>

            {/* Mobile: always-visible info bar */}
            {isMobile ? (
              <div className="p-2">
                <h3 className="font-medium text-xs line-clamp-2 mb-1.5">{item.title}</h3>
                <div className="flex items-center justify-between gap-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 truncate max-w-[60%]">
                    {item.pilar}
                  </Badge>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onToggleFavorite(item.id, item.is_favorite || false)}
                    >
                      <Star className={cn("h-3 w-3", item.is_favorite && "fill-yellow-400 text-yellow-400")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onView(item)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop: hover overlay */
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h3 className="text-background font-semibold text-sm line-clamp-2 mb-2">
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
                      className="h-8 w-8 text-background hover:text-background hover:bg-background/20"
                      onClick={() => onToggleFavorite(item.id, item.is_favorite || false)}
                    >
                      <Star className={cn("h-4 w-4", item.is_favorite && "fill-yellow-400 text-yellow-400")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-background hover:text-background hover:bg-background/20"
                      onClick={() => onView(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Favorite indicator (always visible, non-mobile only since mobile has it in bar) */}
            {!isMobile && item.is_favorite && (
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
