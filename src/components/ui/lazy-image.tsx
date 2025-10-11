import { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export const LazyImage = memo(({ 
  src, 
  alt, 
  className, 
  placeholderClassName,
  ...props 
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <span className="text-xs">Erro ao carregar</span>
      </div>
    );
  }

  if (isLoading || !imageSrc) {
    return (
      <div 
        className={cn(
          "animate-pulse bg-muted",
          placeholderClassName || className
        )}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn("transition-opacity duration-300", className)}
      {...props}
    />
  );
});

LazyImage.displayName = "LazyImage";
