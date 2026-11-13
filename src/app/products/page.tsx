import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ProductTabs } from "@/components/productTabs";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export default async function ProductsPage() {
  await connectToDatabase();

  const databaseProducts = await ProductModel.find({
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  const products = databaseProducts.map((product) => ({
    id: product.catalogId,
    title: product.name,
    category: product.category,
    imageSrc: product.images[0]?.src ?? "/images/moody.png",
    imageAlt: product.images[0]?.alt ?? product.name,
    price: formatPrice(
      product.price.amount,
      product.price.currency,
    ),
    originalPrice: formatPrice(
      product.originalPrice.amount,
      product.originalPrice.currency,
    ),
  }));

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background px-4 py-4 sm:px-6 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <ProductTabs products={products} />
        </div>
      </main>

      <Footer />
    </>
  );
}