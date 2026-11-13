import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SlideButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function SlideButton({
  href,
  children,
  className,
}: SlideButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex h-11 items-center justify-center overflow-hidden bg-foreground px-7 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors duration-300 hover:bg-[#152631] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="transition-transform duration-300 group-hover:-translate-y-12">
        {children}
      </span>

      <span
        aria-hidden="true"
        className="absolute translate-y-12 transition-transform duration-300 group-hover:translate-y-0"
      >
        {children}
      </span>
    </Link>
  );
}