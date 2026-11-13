import Image from "next/image";
import { notFound } from "next/navigation";

import { DripCard } from "@/components/dripCard";
import { Footer } from "@/components/footer";
import { connectToDatabase } from "@/lib/mongodb";
import { BuyNowButton } from "@/components/buyNowButton";
import {
  ProductModel
} from "@/models/product";
import { Navbar } from "@/components/navbar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function formatCategory(category: string) {
  return category.replace(/([A-Z])/g, " $1");
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  const catalogId = Number(id);

  if (Number.isNaN(catalogId)) {
    notFound();
  }

  await connectToDatabase();

  const product = await ProductModel.findOne({
    catalogId,
    isActive: true,
  }).lean();

  if (!product) {
    notFound();
  }

  const relatedProducts = await ProductModel.find({
    category: product.category,
    catalogId: { $ne: product.catalogId },
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const productImage = product.images[0];

  return (
    <>
    <Navbar />
      <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <Image
                src={productImage?.src ?? "/images/moody.png"}
                alt={productImage?.alt ?? product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-center">
              <p className="mb-4 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                {formatCategory(product.category)}
              </p>

              <h1 className="font-[family-name:var(--font-arizonia)] text-4xl leading-none tracking-[0.02em] sm:text-5xl">
                {product.name}
              </h1>

              <div className="mt-6 flex items-center gap-4">
                <span className="text-lg font-medium">
                  {formatPrice(
                    product.price.amount,
                    product.price.currency,
                  )}
                </span>

                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(
                    product.originalPrice.amount,
                    product.originalPrice.currency,
                  )}
                </span>
              </div>

              <p className="mt-8 max-w-lg leading-7 text-muted-foreground">
                {product.description}
              </p>



              <BuyNowButton
                catalogId={product.catalogId}
                variants={product.variants}
              />
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mt-20 border-t border-border pt-10">
              <h2 className="mb-8 font-[family-name:var(--font-arizonia)] text-5xl sm:text-6xl">
                You may also like
              </h2>

              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct) => {
                  const relatedImage = relatedProduct.images[0];

                  return (
                    <DripCard
                      key={relatedProduct.catalogId}
                      title={relatedProduct.name}
                      imageSrc={
                        relatedImage?.src ?? "/images/moody.png"
                      }
                      imageAlt={
                        relatedImage?.alt ?? relatedProduct.name
                      }
                      price={formatPrice(
                        relatedProduct.price.amount,
                        relatedProduct.price.currency,
                      )}
                      originalPrice={formatPrice(
                        relatedProduct.originalPrice.amount,
                        relatedProduct.originalPrice.currency,
                      )}
                      href={`/products/${relatedProduct.catalogId}`}
                      showDetails
                      showHoverDetails
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}