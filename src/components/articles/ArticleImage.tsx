
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Image, ImageOff } from "lucide-react";

interface ArticleImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | number;
}

export default function ArticleImage({ src, alt, className, aspectRatio = "wide" }: ArticleImageProps) {
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

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <div className={cn("relative overflow-hidden bg-thriphti-ivory/30", getAspectRatioClass(), className)}>
      {!src || imageError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-thriphti-ivory/50 p-4">
          <ImageOff size={48} className="text-thriphti-green/30 mb-2" />
          <span className="text-sm text-thriphti-charcoal/70 text-center">{alt || "Article image unavailable"}</span>
        </div>
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
