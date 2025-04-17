
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

export const OptimizedImage = ({
  src,
  alt,
  fallbackSrc = "/lovable-uploads/quill_icon.png",
  className,
  sizes = "100vw",
  priority = false,
  objectFit = "cover",
  ...props
}: OptimizedImageProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(!priority);
  }, [src, priority]);

  // Handle image loading
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setImgSrc(fallbackSrc);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"} 
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          `object-${objectFit}`,
          className
        )}
        {...props}
      />
    </div>
  );
};
