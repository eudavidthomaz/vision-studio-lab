import { cn } from "@/lib/utils";

interface CarouselDotsProps {
  total: number;
  current: number;
}

export const CarouselDots = ({ total, current }: CarouselDotsProps) => {
  return (
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === current 
              ? "w-8 bg-primary" 
              : "w-2 bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
};