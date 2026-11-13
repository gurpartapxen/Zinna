"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchPanel({ open, onClose }: SearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close search"
        className="fixed inset-x-0 bottom-0 top-16 z-[55] bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-16 z-[70] w-full max-w-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="searchPanelEnter rounded-xl border bg-background/95 p-3 shadow-2xl backdrop-blur">
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-4 size-5 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-12 border-0 bg-transparent pl-12 pr-12 shadow-none focus-visible:ring-0"
            />

            <button
              type="button"
              aria-label="Close search"
              onClick={onClose}
              className="absolute right-3 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}