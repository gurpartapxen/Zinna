"use client";

import { FormEvent, useState } from "react";

const categories = [
    "latestDrip",
    "hoodies",
    "sweatshirts",
    "oversizedShirts",
] as const;

export function AdminProductForm() {
    const [form, setForm] = useState({
        catalogId: "",
        name: "",
        category: "latestDrip",
        description: "",
        price: "",
        originalPrice: "",
        imageAlt: "",
        color: "",
        sku: "",
        stock: "0",
        tags: "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function updateField(
        field: keyof typeof form,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!imageFile) {
            setMessage("Please select a product image.");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        const uploadedPublicId = "";

        try {
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

            const productResponse = await fetch("/api/products", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    catalogId: Number(form.catalogId),
                    name: form.name,
                    category: form.category,
                    description: form.description,
                    price: {
                        amount: Number(form.price),
                        currency: "USD",
                    },
                    originalPrice: {
                        amount: Number(form.originalPrice),
                        currency: "USD",
                    },
                    images: [
                        {
                            src: uploadData.secureUrl,
                            publicId: uploadData.publicId,
                            alt: form.imageAlt,
                        },
                    ],
                    variants: [
                        {
                            size: "M",
                            color: form.color,
                            sku: form.sku,
                            stock: Number(form.stock),
                        },
                    ],
                    tags: form.tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    isFeatured: false,
                    isActive: true,
                }),
            });

            const productData = await productResponse.json();

            if (!productResponse.ok) {
                throw new Error(
                    productData.message ?? "Product creation failed",
                );
            }

            setMessage("Product created successfully.");
            setImageFile(null);
        } catch (error) {
            if (uploadedPublicId) {
                await fetch(
                    `/api/uploads/productImage?publicId=${encodeURIComponent(
                        uploadedPublicId,
                    )}`,
                    {
                        method: "DELETE",
                        credentials: "include",
                    },
                );
            }
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="mt-12 max-w-2xl border p-6">
            <h2 className="text-2xl font-semibold">
                Add product
            </h2>

            <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
            >
                <input
                    type="number"
                    placeholder="Catalog ID"
                    value={form.catalogId}
                    onChange={(event) =>
                        updateField("catalogId", event.target.value)
                    }
                    required
                    className="w-full border px-3 py-2"
                />

                <input
                    placeholder="Product name"
                    value={form.name}
                    onChange={(event) =>
                        updateField("name", event.target.value)
                    }
                    required
                    className="w-full border px-3 py-2"
                />

                <select
                    value={form.category}
                    onChange={(event) =>
                        updateField("category", event.target.value)
                    }
                    className="w-full border px-3 py-2"
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(event) =>
                        updateField("description", event.target.value)
                    }
                    required
                    className="min-h-28 w-full border px-3 py-2"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <input
                        type="number"
                        placeholder="Price"
                        value={form.price}
                        onChange={(event) =>
                            updateField("price", event.target.value)
                        }
                        required
                        className="border px-3 py-2"
                    />

                    <input
                        type="number"
                        placeholder="Original price"
                        value={form.originalPrice}
                        onChange={(event) =>
                            updateField(
                                "originalPrice",
                                event.target.value,
                            )
                        }
                        required
                        className="border px-3 py-2"
                    />
                </div>

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                        setImageFile(event.target.files?.[0] ?? null)
                    }
                    required
                />

                <input
                    placeholder="Image alt text"
                    value={form.imageAlt}
                    onChange={(event) =>
                        updateField("imageAlt", event.target.value)
                    }
                    required
                    className="w-full border px-3 py-2"
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <input
                        placeholder="Color"
                        value={form.color}
                        onChange={(event) =>
                            updateField("color", event.target.value)
                        }
                        required
                        className="border px-3 py-2"
                    />

                    <input
                        placeholder="SKU"
                        value={form.sku}
                        onChange={(event) =>
                            updateField("sku", event.target.value)
                        }
                        required
                        className="border px-3 py-2"
                    />

                    <input
                        type="number"
                        placeholder="Stock"
                        value={form.stock}
                        onChange={(event) =>
                            updateField("stock", event.target.value)
                        }
                        required
                        className="border px-3 py-2"
                    />
                </div>

                <input
                    placeholder="Tags separated by commas"
                    value={form.tags}
                    onChange={(event) =>
                        updateField("tags", event.target.value)
                    }
                    className="w-full border px-3 py-2"
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black px-5 py-3 text-white disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create product"}
                </button>

                {message && <p className="text-sm">{message}</p>}
            </form>
        </section>
    );
}