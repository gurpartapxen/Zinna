"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { Move } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DripCardProps = {
  title: string;
  imageSrc: string;
  imageAlt: string;
  price?: string;
  originalPrice?: string;
  showDetails?: boolean;
  showHoverDetails?: boolean;
  href?: string;
  priority?: boolean;
  className?: string;
};

export function DripCard({
  title,
  imageSrc,
  imageAlt,
  price,
  originalPrice,
  showDetails = true,
  showHoverDetails = false,
  href = "#",
  priority = false,
  className,
}: DripCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({
    x: 0,
    y: 0,
  });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-none border-0 bg-transparent shadow-none",
        "transition-transform duration-500 hover:scale-[1.01]",
        className,
      )}
    >
      <CardContent className="p-0">
        <Link href={href} aria-label={`View ${title}`} className="block">
          <div
            className={cn(
              "relative aspect-[4/5] overflow-hidden bg-muted",
              showHoverDetails && "cursor-none",
            )}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 35vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />

            {showHoverDetails && (
              <>
                <div className="pointer-events-none absolute inset-0 z-10 bg-black/30 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />

                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <h3 className="text-white font-medium uppercase tracking-[0.14em]">
                    {title}
                  </h3>

                  {price && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-sm text-white/60 font-medium">{price}</span>

                      {originalPrice && (
                        <span className="text-sm text-white/60 line-through">
                          {originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {isHovering && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute z-30 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-black shadow-lg md:flex"
                    style={{
                      left: cursorPosition.x,
                      top: cursorPosition.y,
                    }}
                  >
                    <Move className="size-4" />
                    Shop
                  </div>
                )}
              </>
            )}
          </div>

          {showDetails && (
            <div className="pt-4">
              <h3 className="text-sm font-medium uppercase tracking-[0.15em]">
                {title}
              </h3>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm font-medium">{price}</span>

                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {originalPrice}
                  </span>
                )}
              </div>
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}