import { connectToDatabase } from "@/lib/mongodb";
import { getCloudinaryClient } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/requireAdmin";
import { z } from "zod";
import {
  ProductModel,
  type ProductImage,
} from "@/models/product";

export const runtime = "nodejs";


const productInputSchema = z.object({
  catalogId: z.number().int().positive(),

  name: z.string().trim().min(2),

  category: z.enum([
    "latestDrip",
    "hoodies",
    "sweatshirts",
    "oversizedShirts",
  ]),

  description: z.string().trim().min(10),

  price: z.object({
    amount: z.number().nonnegative(),
    currency: z.string().length(3).default("USD"),
  }),

  originalPrice: z.object({
    amount: z.number().nonnegative(),
    currency: z.string().length(3).default("USD"),
  }),

  images: z
    .array(
      z.object({
        src: z.string().url(),
        publicId: z.string().trim().optional(),
        alt: z.string().trim().min(2),
      }),
    )
    .min(1),

  variants: z
    .array(
      z.object({
        size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
        color: z.string().trim().min(2),
        sku: z.string().trim().min(2),
        stock: z.number().int().nonnegative(),
      }),
    )
    .min(1),

  tags: z.array(z.string().trim()).default([]),

  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const productUpdateSchema = productInputSchema
  .omit({
    catalogId: true,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export async function GET() {
  try {
    await connectToDatabase();

    const products = await ProductModel.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      products,
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Unable to load products",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const productData = productInputSchema.parse(body);

    await connectToDatabase();

    const product = await ProductModel.create(productData);

    return Response.json(
      {
        success: true,
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          message: "Invalid product data",
          errors: error.flatten(),
        },
        { status: 400 },
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return Response.json(
        {
          success: false,
          message: "A product with this catalogId already exists",
        },
        { status: 409 },
      );
    }

    console.error("Product creation error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to create product",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const catalogId = searchParams.get("catalogId");
    const numericCatalogId = Number(catalogId);

    if (!catalogId || !Number.isInteger(numericCatalogId)) {
      return Response.json(
        {
          success: false,
          message: "A valid catalogId is required",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const product = await ProductModel.findOne({
      catalogId: numericCatalogId,
    });

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    const publicIds: string[] = [];

    for (const image of product.images as ProductImage[]) {
      if (
        typeof image.publicId === "string" &&
        image.publicId.trim().length > 0
      ) {
        publicIds.push(image.publicId);
      }
    }

    if (publicIds.length > 0) {
      const cloudinary = getCloudinaryClient();

      await Promise.all(
        publicIds.map((publicId: string) =>
          cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          }),
        ),
      );
    }

    await ProductModel.deleteOne({
      catalogId: numericCatalogId,
    });

    return Response.json({
      success: true,
      message: "Product and Cloudinary images deleted",
    });
  } catch (error) {
    console.error("Product deletion error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to delete product",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const catalogId = searchParams.get("catalogId");
    const numericCatalogId = Number(catalogId);

    if (!catalogId || !Number.isInteger(numericCatalogId)) {
      return Response.json(
        {
          success: false,
          message: "A valid catalogId is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const updateData = productUpdateSchema.parse(body);

    await connectToDatabase();

    const product = await ProductModel.findOneAndUpdate(
      { catalogId: numericCatalogId },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          message: "Invalid product update data",
          errors: error.flatten(),
        },
        { status: 400 },
      );
    }

    console.error("Product update error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to update product",
      },
      { status: 500 },
    );
  }
}