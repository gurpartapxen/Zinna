"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ProductVariant } from "@/models/product";

type BuyNowButtonProps = {
  catalogId: number;
  variants: ProductVariant[];
};

export function BuyNowButton({
  catalogId,
  variants,
}: BuyNowButtonProps) {
  const router = useRouter();

  const [selectedSku, setSelectedSku] = useState<string | null>(
    null,
  );

  const [message, setMessage] = useState("");

  const selectedVariant = variants.find(
    (variant) => variant.sku === selectedSku,
  );

  function handleBuyNow() {
    if (!selectedVariant) {
      setMessage("Please select a size first.");
      return;
    }

    if (selectedVariant.stock <= 0) {
      setMessage("This size is currently out of stock.");
      return;
    }

    const checkoutParams = new URLSearchParams({
      catalogId: String(catalogId),
      sku: selectedVariant.sku,
      size: selectedVariant.size,
    });

    router.push(`/checkout?${checkoutParams.toString()}`);
  }

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.14em]">
        Select size
      </h2>

      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <button
            key={variant.sku}
            type="button"
            disabled={variant.stock <= 0}
            onClick={() => {
              setSelectedSku(variant.sku);
              setMessage("");
            }}
            className={`flex size-12 items-center justify-center border text-sm transition-colors ${
              selectedSku === variant.sku
                ? "border-black bg-black text-white"
                : "border-border hover:bg-black hover:text-white"
            } ${
              variant.stock <= 0
                ? "cursor-not-allowed opacity-40"
                : ""
            }`}
          >
            {variant.size}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        className="group relative mt-8 inline-flex h-11 w-fit items-center justify-center overflow-hidden bg-black px-7 text-xs font-medium uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-[#152631]"
      >
        <span className="transition-transform duration-300 group-hover:-translate-y-12">
          Buy now
        </span>

        <span
          aria-hidden="true"
          className="absolute translate-y-12 transition-transform duration-300 group-hover:translate-y-0"
        >
          Buy now
        </span>
      </button>

      {message && (
        <p className="mt-3 text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
}