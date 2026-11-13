import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
    href?: string;
    showTagline?: boolean;
    className?: string;
};

export function BrandLogo({
    href = "/",
    showTagline = false,
    className,
}: BrandLogoProps) {
    return (
        <Link
            href={href}
            className={cn(
                "inline-flex flex-col leading-none",
                "transition-opacity hover:opacity-80",
                className,
            )}
        >
            <span className="font-[family-name:var(--font-arizonia)] text-3xl font-normal leading-none tracking-normal sm:text-3xl">
                ZINNA
            </span>

            {showTagline && (
                <span className="mt-1 text-[0.65rem] tracking-[0.18em] text-muted-foreground">
                    MODERN ESSENTIALS
                </span>
            )}
        </Link>
    );
}