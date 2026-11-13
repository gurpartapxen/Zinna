"use client";

import { DripCard } from "@/components/dripCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ProductCategory } from "@/data/productCatalog";

export type ProductListItem = {
  id: number;
  title: string;
  category: ProductCategory;
  imageSrc: string;
  imageAlt: string;
  price: string;
  originalPrice: string;
};

type ProductTabsProps = {
  products: ProductListItem[];
};

const categories: {
  label: string;
  value: "all" | ProductCategory;
}[] = [
  { label: "All", value: "all" },
  { label: "Latest Drip", value: "latestDrip" },
  { label: "Hoodies", value: "hoodies" },
  { label: "Sweatshirts", value: "sweatshirts" },
  { label: "Oversized Shirts", value: "oversizedShirts" },
];

function ProductGrid({
  products,
}: {
  products: ProductListItem[];
}) {
  if (products.length === 0) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <DripCard
          key={product.id}
          title={product.title}
          imageSrc={product.imageSrc}
          imageAlt={product.imageAlt}
          price={product.price}
          originalPrice={product.originalPrice}
          href={`/products/${product.id}`}
          priority={index < 3}
          showDetails
          showHoverDetails
        />
      ))}
    </div>
  );
}

export function ProductTabs({ products }: ProductTabsProps) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-5 gap-0 overflow-hidden rounded-none border-b bg-transparent p-0 sm:flex sm:justify-start sm:gap-1 sm:overflow-visible">
        {categories.map((category) => (
          <TabsTrigger
            key={category.value}
            value={category.value}
            className="min-w-0 w-full rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-[10px] leading-tight tracking-[0.04em] whitespace-normal sm:w-auto sm:shrink-0 sm:px-2 sm:pb-4 sm:pt-2 sm:text-sm sm:tracking-[0.12em] sm:whitespace-nowrap">
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="mt-12">
        <ProductGrid products={products} />
      </TabsContent>

      <TabsContent value="latestDrip" className="mt-12">
        <ProductGrid
          products={products.filter(
            (product) => product.category === "latestDrip",
          )}
        />
      </TabsContent>

      <TabsContent value="hoodies" className="mt-12">
        <ProductGrid
          products={products.filter(
            (product) => product.category === "hoodies",
          )}
        />
      </TabsContent>

      <TabsContent value="sweatshirts" className="mt-12">
        <ProductGrid
          products={products.filter(
            (product) => product.category === "sweatshirts",
          )}
        />
      </TabsContent>

      <TabsContent value="oversizedShirts" className="mt-12">
        <ProductGrid
          products={products.filter(
            (product) => product.category === "oversizedShirts",
          )}
        />
      </TabsContent>
    </Tabs>
  );
}