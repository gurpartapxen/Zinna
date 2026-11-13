import Image from "next/image";
import { cn } from "@/lib/utils";

type HeroImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

export function HeroImage({
  src,
  alt,
  priority = false,
  className,
  imageClassName,
}: HeroImageProps) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 45vw, 30vw"
        className={cn(
          "object-contain object-bottom",
          imageClassName,
        )}
      />
    </div>
  );
}