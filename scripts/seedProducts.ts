import mongoose from "mongoose";

import { products } from "../src/data/productCatalog";
import { connectToDatabase } from "../src/lib/mongodb";
import { ProductModel } from "../src/models/product";

function convertPriceToCents(price: string) {
  const numericPrice = Number(price.replace(/[^0-9.]/g, ""));

  return Math.round(numericPrice * 100);
}

function createDescription(category: string) {
  const descriptions = {
    latestDrip:
      "A signature Zinna piece designed for expressive everyday styling.",
    hoodies:
      "A relaxed hoodie made for comfort, layering, and everyday movement.",
    sweatshirts:
      "A comfortable sweatshirt combining expressive artwork with an easy fit.",
    oversizedShirts:
      "A breathable oversized shirt designed for relaxed everyday wear.",
  };

  return descriptions[category as keyof typeof descriptions];
}

async function seedProducts() {
  await connectToDatabase();

  for (const product of products) {
    await ProductModel.updateOne(
      {
        catalogId: product.id,
      },
      {
        $set: {
          catalogId: product.id,
          name: product.title,
          category: product.category,
          description: createDescription(product.category),

          price: {
            amount: convertPriceToCents(product.price),
            currency: "USD",
          },

          originalPrice: {
            amount: convertPriceToCents(product.originalPrice),
            currency: "USD",
          },

          images: [
            {
              src: product.imageSrc,
              alt: product.imageAlt,
            },
          ],

          variants: ["S", "M", "L", "XL"].map((size) => ({
            size,
            color: "Default",
            sku: `ZINNA-${product.id}-${size}`,
            stock: 10,
          })),

          tags: [product.category, "zinna", "clothing"],
          isFeatured: product.id <= 3,
          isActive: true,
        },
      },
      {
        upsert: true,
      },
    );
  }

  console.log(`Seeded ${products.length} products successfully`);

  await mongoose.disconnect();
}

seedProducts().catch(async (error) => {
  console.error("Product seeding failed:", error);

  await mongoose.disconnect();

  process.exit(1);
});