import {
  Schema,
  models,
  model,
  type InferSchemaType,
} from "mongoose";

const productVariantSchema = new Schema(
  {
    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

export type ProductVariant = InferSchemaType<
  typeof productVariantSchema
>;

const productImageSchema = new Schema(
  {
    src: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      trim: true,
    },

    alt: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

export type ProductImage = InferSchemaType<
  typeof productImageSchema
>;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    catalogId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "latestDrip",
        "hoodies",
        "sweatshirts",
        "oversizedShirts",
      ],
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        required: true,
        default: "USD",
        uppercase: true,
      },
    },

    originalPrice: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        required: true,
        default: "USD",
        uppercase: true,
      },
    },

    images: {
      type: [productImageSchema],
      required: true,
      validate: {
        validator: (images: unknown[]) => images.length > 0,
        message: "A product must have at least one image",
      },
    },

    variants: {
      type: [productVariantSchema],
      required: true,
      validate: {
        validator: (variants: unknown[]) => variants.length > 0,
        message: "A product must have at least one variant",
      },
    },

    tags: {
      type: [String],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel =
  models.Product || model("Product", productSchema);