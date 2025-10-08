import { useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const { onSwipeLeft, onSwipeRight, threshold = 100 } = options;
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    touchEndX.current = e.touches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    
    const diff = touchEndX.current - touchStartX.current;
    
    if (Math.abs(diff) > threshold) {
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      if (diff < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diff > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
    
    setSwipeOffset(0);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    swipeOffset,
    isSwiping,
  };
}
