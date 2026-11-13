"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { SearchPanel } from "@/components/searchPanel";
import { BrandLogo } from "@/components/brandLogo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type NavigationItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  items?: NavigationItem[];
};

const defaultNavigationItems: NavigationItem[] = [
  {
    label: "New arrivals",
    href: "#latestDrip",
  },
  {
    label: "Women",
    href: "/women",
  },
  {
    label: "Men",
    href: "/men",
  },
  {
    label: "Collections",
    href: "/products",
  },
];

export function Navbar({ items = defaultNavigationItems }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return (
    <header className="sticky top-0 z-[60] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="relative flex h-20 w-full items-center justify-center">
        <Sheet
          open={isMenuOpen}
          onOpenChange={(open) => {
            setIsMenuOpen(open);

            if (open) {
              setIsSearchOpen(false);
            }
          }}
        >
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="absolute top-4 left-4 rounded-full"
              >
                {isMenuOpen ? (
                  <X className="size-6" aria-hidden="true" />
                ) : (
                  <Menu className="size-6" aria-hidden="true" />
                )}
              </Button>
            }
          />

          <SheetContent
            side="top"
            className="top-16 h-auto max-h-[calc(100vh-4rem)] w-full max-w-none rounded-none border-b"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Zinna navigation menu</SheetTitle>
            </SheetHeader>

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <nav
                aria-label="Main navigation"
                className="flex flex-col items-start gap-2"
              >
                {items.map((item) => (
                  <SheetClose
                    key={item.href}
                    nativeButton={false}
                    render={
                      <Link
                        href={item.href}
                        className="text-2xl font-medium transition-colors hover:text-muted-foreground sm:text-3xl"
                      >
                        {item.label}
                      </Link>
                    }
                  />
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Search"
          className="absolute top-4 right-4"
          onClick={() => {
            setIsMenuOpen(false);
            setIsSearchOpen(true);
          }}
        >
          <Search className="size-6" aria-hidden="true" />
        </Button>

        <BrandLogo />
      </div>
      <SearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}