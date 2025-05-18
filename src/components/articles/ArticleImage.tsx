
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface ArticleImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | number;
  tags?: string[];
}

export default function ArticleImage({ src, alt, className, aspectRatio = "wide", tags = [] }: ArticleImageProps) {
  const [imageError, setImageError] = useState(false);

  // Calculate aspect ratio based on the provided value
  const getAspectRatioClass = () => {
    if (typeof aspectRatio === "number") {
      return `aspect-[${aspectRatio}]`;
    }
    
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "wide":
      default:
        return "aspect-[16/9]";
    }
  };

  // Determine which placeholder to use based on article tags
  const getFallbackContent = () => {
    const isGuide = tags.includes("guide") || tags.includes("Guide");
    
    if (isGuide) {
      // Use guide-specific placeholder image
      return (
        <img 
          src="/images/guide-image.png" 
          alt={alt} 
          className="object-cover w-full h-full opacity-90"
        />
      );
    }
    
    // Default fallback for non-guide articles
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-thriphti-ivory/50 p-4">
        <ImageOff size={48} className="text-thriphti-green/30 mb-2" />
        <span className="text-sm text-thriphti-charcoal/70 text-center">{alt || "Article image unavailable"}</span>
      </div>
    );
  };

  return (
    <div className={cn("relative overflow-hidden bg-thriphti-ivory/30", getAspectRatioClass(), className)}>
      {!src || imageError ? (
        getFallbackContent()
      ) : (
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full transition-opacity"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}
