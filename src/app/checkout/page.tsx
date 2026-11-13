import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/features/checkoutForm";
import { connectToDatabase } from "@/lib/mongodb";
import {
  ProductModel,
  type ProductVariant,
} from "@/models/product";

type CheckoutPageProps = {
  searchParams: Promise<{
    catalogId?: string;
    sku?: string;
    size?: string;
  }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const params = await searchParams;

  const catalogId = Number(params.catalogId);
  const sku = params.sku;
  const size = params.size;

  if (!Number.isInteger(catalogId) || !sku || !size) {
    redirect("/products");
  }

  await connectToDatabase();

  const product = await ProductModel.findOne({
    catalogId,
    isActive: true,
  }).lean();

  if (!product) {
    redirect("/products");
  }

  const variant = product.variants.find(
  (productVariant: ProductVariant) =>
    productVariant.sku === sku &&
    productVariant.size === size,
);

  if (!variant || variant.stock <= 0) {
    redirect(`/products/${catalogId}`);
  }

  const image = product.images[0];

  return (
    <CheckoutForm
      product={{
        catalogId: product.catalogId,
        name: product.name,
        amount: product.price.amount,
        currency: product.price.currency,
        imageSrc: image?.src ?? "/images/moody.png",
        imageAlt: image?.alt ?? product.name,
        sku: variant.sku,
        size: variant.size,
      }}
    />
  );
}