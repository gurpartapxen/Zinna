"use client";

import { FormEvent, useState } from "react";
import type {
  ProductImage,
  ProductVariant,
} from "@/models/product";
import type {
  AdminProduct,
  AdminProductCategory,
} from "@/types/adminProduct";

type AdminProductEditFormProps = {
  product: AdminProduct;
  onCancel: () => void;
  onSaved: (product: AdminProduct) => void;
};

const categories: AdminProductCategory[] = [
  "latestDrip",
  "hoodies",
  "sweatshirts",
  "oversizedShirts",
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export function AdminProductEditForm({
  product,
  onCancel,
  onSaved,
}: AdminProductEditFormProps) {
  const [name, setName] = useState(product.name);
  const [category, setCategory] =
    useState<AdminProductCategory>(product.category);
  const [description, setDescription] = useState(
    product.description,
  );

  // MongoDB stores money in cents.
  // The admin enters normal dollar values.
  const [price, setPrice] = useState(
    (product.price.amount / 100).toFixed(2),
  );

  const [originalPrice, setOriginalPrice] = useState(
    (product.originalPrice.amount / 100).toFixed(2),
  );

  const [tags, setTags] = useState(product.tags.join(", "));
  const [variants, setVariants] = useState<ProductVariant[]>(
    product.variants,
  );

  const [isFeatured, setIsFeatured] = useState(
    product.isFeatured,
  );

  const [isActive, setIsActive] = useState(product.isActive);

  const [imageAlt, setImageAlt] = useState(
    product.images[0]?.alt ?? product.name,
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateVariant(
    index: number,
    changes: Partial<ProductVariant>,
  ) {
    setVariants((currentVariants) =>
      currentVariants.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, ...changes }
          : variant,
      ),
    );
  }

  function addVariant() {
    setVariants((currentVariants) => [
      ...currentVariants,
      {
        size: "M",
        color: "",
        sku: "",
        stock: 0,
        reservedStock: 0,
      },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length === 1) {
      setErrorMessage(
        "A product must have at least one variant.",
      );
      return;
    }

    setVariants((currentVariants) =>
      currentVariants.filter(
        (_, variantIndex) => variantIndex !== index,
      ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");

    let uploadedPublicId = "";

    try {
      const priceInCents = Math.round(Number(price) * 100);
      const originalPriceInCents = Math.round(
        Number(originalPrice) * 100,
      );

      if (
        !Number.isFinite(priceInCents) ||
        !Number.isFinite(originalPriceInCents)
      ) {
        throw new Error("Prices must be valid numbers.");
      }

      let newImage: ProductImage | undefined;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);

        const uploadResponse = await fetch(
          "/api/uploads/productImage",
          {
            method: "POST",
            credentials: "include",
            body: imageFormData,
          },
        );

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.message ?? "Image upload failed",
          );
        }

        uploadedPublicId = uploadData.publicId;

        newImage = {
          src: uploadData.secureUrl,
          publicId: uploadData.publicId,
          alt: imageAlt,
        };
      }

      const updateData = {
        name,
        category,
        description,

        price: {
          amount: priceInCents,
          currency: product.price.currency,
        },

        originalPrice: {
          amount: originalPriceInCents,
          currency: product.originalPrice.currency,
        },

        variants,

        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        isFeatured,
        isActive,

        ...(newImage ? { images: [newImage] } : {}),
      };

      const response = await fetch(
        `/api/products?catalogId=${product.catalogId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "Unable to update product",
        );
      }

      const oldPublicId = product.images[0]?.publicId;

      // Delete the old image only after MongoDB was updated.
      if (
        newImage &&
        typeof oldPublicId === "string" &&
        oldPublicId.length > 0
      ) {
        await fetch(
          `/api/uploads/productImage?publicId=${encodeURIComponent(
            oldPublicId,
          )}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
      }

      onSaved(data.product);
    } catch (error) {
      // If the new image was uploaded but product update failed,
      // delete the new image to prevent an orphaned asset.
      if (uploadedPublicId) {
        await fetch(
          `/api/uploads/productImage?publicId=${encodeURIComponent(
            uploadedPublicId,
          )}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        ).catch(() => {
          console.error("Unable to clean up uploaded image");
        });
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update product",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border p-5">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Product name"
        required
        className="w-full border px-3 py-2"
      />

      <select
        value={category}
        onChange={(event) =>
          setCategory(
            event.target.value as AdminProductCategory,
          )
        }
        className="w-full border px-3 py-2"
      >
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <textarea
        value={description}
        onChange={(event) =>
          setDescription(event.target.value)
        }
        placeholder="Product description"
        required
        className="min-h-28 w-full border px-3 py-2"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) =>
            setPrice(event.target.value)
          }
          placeholder="Price"
          required
          className="border px-3 py-2"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          value={originalPrice}
          onChange={(event) =>
            setOriginalPrice(event.target.value)
          }
          placeholder="Original price"
          required
          className="border px-3 py-2"
        />
      </div>

      <input
        value={tags}
        onChange={(event) => setTags(event.target.value)}
        placeholder="Tags separated by commas"
        className="w-full border px-3 py-2"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Variants and stock</h3>

          <button
            type="button"
            onClick={addVariant}
            className="border px-3 py-2 text-sm"
          >
            Add variant
          </button>
        </div>

        {variants.map((variant, index) => (
          <div
            key={`${variant.sku}-${index}`}
            className="grid gap-3 border p-3 sm:grid-cols-5"
          >
            <select
              value={variant.size}
              onChange={(event) =>
                updateVariant(index, {
                  size: event.target
                    .value as ProductVariant["size"],
                })
              }
              className="border px-2 py-2"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <input
              value={variant.color}
              onChange={(event) =>
                updateVariant(index, {
                  color: event.target.value,
                })
              }
              placeholder="Color"
              required
              className="border px-2 py-2"
            />

            <input
              value={variant.sku}
              onChange={(event) =>
                updateVariant(index, {
                  sku: event.target.value,
                })
              }
              placeholder="SKU"
              required
              className="border px-2 py-2"
            />

            <input
              type="number"
              min="0"
              value={variant.stock}
              onChange={(event) =>
                updateVariant(index, {
                  stock: Number(event.target.value),
                })
              }
              placeholder="Stock"
              required
              className="border px-2 py-2"
            />

            <button
              type="button"
              onClick={() => removeVariant(index)}
              className="border border-red-600 px-2 py-2 text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) =>
          setImageFile(event.target.files?.[0] ?? null)
        }
      />

      <input
        value={imageAlt}
        onChange={(event) =>
          setImageAlt(event.target.value)
        }
        placeholder="Image alt text"
        required
        className="w-full border px-3 py-2"
      />

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(event) =>
            setIsFeatured(event.target.checked)
          }
        />
        Featured product
      </label>

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) =>
            setIsActive(event.target.checked)
          }
        />
        Active product
      </label>

      {errorMessage && (
        <p className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}