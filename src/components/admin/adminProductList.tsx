"use client";
import { AdminProductEditForm } from "./adminProductEditForm";
import { useEffect, useState } from "react";
import type { AdminProduct } from "@/types/adminProduct";

export function AdminProductList() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [deletingCatalogId, setDeletingCatalogId] =
        useState<number | null>(null);
    const [editingCatalogId, setEditingCatalogId] =
        useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadProducts() {
            const response = await fetch("/api/products", {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.message ?? "Unable to load products");
                setIsLoading(false);
                return;
            }

            setProducts(data.products);
            setIsLoading(false);
        }

        loadProducts();
    }, []);

    if (isLoading) {
        return <p className="mt-10">Loading products...</p>;
    }

    if (errorMessage) {
        return <p className="mt-10 text-red-600">{errorMessage}</p>;
    }

    async function handleDelete(catalogId: number) {
        const confirmed = window.confirm(
            "This will permanently delete the product and its Cloudinary images. Continue?",
        );

        if (!confirmed) {
            return;
        }

        setDeletingCatalogId(catalogId);

        const response = await fetch(
            `/api/products?catalogId=${catalogId}`,
            {
                method: "DELETE",
                credentials: "include",
            },
        );

        const data = await response.json();

        if (!response.ok) {
            setErrorMessage(data.message ?? "Unable to delete product");
            setDeletingCatalogId(null);
            return;
        }

        setProducts((currentProducts) =>
            currentProducts.filter(
                (product) => product.catalogId !== catalogId,
            ),
        );

        setDeletingCatalogId(null);
    }

    function handleSaved(updatedProduct: AdminProduct) {
        setProducts((currentProducts) =>
            currentProducts.map((product) =>
                product.catalogId === updatedProduct.catalogId
                    ? updatedProduct
                    : product,
            ),
        );

        setEditingCatalogId(null);
    }

    return (
        <section className="mt-12">
            <h2 className="text-2xl font-semibold">Products</h2>

            <div className="mt-6 space-y-3">
                {products.map((product) => editingCatalogId === product.catalogId ? (
                    <AdminProductEditForm
                        key={product.catalogId}
                        product={product}
                        onCancel={() => setEditingCatalogId(null)}
                        onSaved={handleSaved}
                    />
                ) : (

                    <div
                        key={product.catalogId}
                        className="flex items-center justify-between border p-4"
                    >
                        <div>
                            <p className="font-medium">{product.name}</p>

                            <p className="text-sm text-muted-foreground">
                                {product.category} · {product.catalogId}
                            </p>
                        </div>

                        <p>
                            {product.price.currency} {product.price.amount}
                        </p>
                        <button
                            type="button"
                            onClick={() => handleDelete(product.catalogId)}
                            disabled={deletingCatalogId === product.catalogId}
                            className="border border-red-600 px-3 py-2 text-sm text-red-600 disabled:opacity-50"
                        >
                            {deletingCatalogId === product.catalogId
                                ? "Deleting..."
                                : "Delete"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditingCatalogId(product.catalogId)}
                            className="border px-3 py-2 text-sm"
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}