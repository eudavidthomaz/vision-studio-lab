import { useState } from "react";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { CarouselDots } from "./CarouselDots";
import { cn } from "@/lib/utils";

interface MobileCardCarouselProps {
  children: React.ReactNode[];
}

export const MobileCardCarousel = ({ children }: MobileCardCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, children.length - 1));
  };

  const handleSwipeRight = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const { handlers, swipeOffset, isSwiping } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
  });

  return (
    <div className="md:hidden">
      <div className="overflow-hidden" {...handlers}>
        <div
          className={cn(
            "flex transition-transform duration-300 ease-out",
            isSwiping && "transition-none"
          )}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${swipeOffset}px))`,
          }}
        >
          {children.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              {child}
            </div>
          ))}
        </div>
      </div>
      <CarouselDots total={children.length} current={currentIndex} />
    </div>
  );
};