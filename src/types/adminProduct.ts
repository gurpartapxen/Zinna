import type {
  ProductImage,
  ProductVariant,
} from "@/models/product";

export type AdminProductCategory =
  | "latestDrip"
  | "hoodies"
  | "sweatshirts"
  | "oversizedShirts";

export type AdminProduct = {
  catalogId: number;
  name: string;
  category: AdminProductCategory;
  description: string;

  price: {
    amount: number;
    currency: string;
  };

  originalPrice: {
    amount: number;
    currency: string;
  };

  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
};