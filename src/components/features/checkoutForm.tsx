"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

export type CheckoutProduct = {
  catalogId: number;
  name: string;
  amount: number;
  currency: string;
  imageSrc: string;
  imageAlt: string;
  sku: string;
  size: string;
};

type CheckoutFormProps = {
  product: CheckoutProduct;
};

type CheckoutFormState = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type CheckoutResponse = {
  checkoutUrl?: string;
  message?: string;
};

const inputClassName =
  "mt-2 w-full rounded-lg border border-neutral-700 bg-[#1c1c1e] px-3 py-3 text-sm outline-none transition-colors focus:border-white sm:px-4 sm:py-3";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export function CheckoutForm({ product }: CheckoutFormProps) {
  const checkoutRequestId = useRef<string | null>(null);

  const [formData, setFormData] = useState<CheckoutFormState>({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const fieldName = event.target.name as keyof CheckoutFormState;

    const fieldValue =
      fieldName === "country"
        ? event.target.value.toUpperCase()
        : event.target.value;

    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: fieldValue,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    const requestId =
      checkoutRequestId.current ?? crypto.randomUUID();

    checkoutRequestId.current = requestId;

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutRequestId: requestId,
          items: [
            {
              catalogId: product.catalogId,
              sku: product.sku,
              size: product.size,
              quantity: 1,
            },
          ],
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
          },
          shippingAddress: {
            line1: formData.line1,
            line2: formData.line2 || undefined,
            city: formData.city,
            state: formData.state || undefined,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        }),
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(
          result.message ?? "Unable to start checkout",
        );
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
      setIsSubmitting(false);
    }
  }

  const price = formatPrice(
    product.amount,
    product.currency,
  );

  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-[#111112] text-white">
      <div className="grid w-full lg:h-dvh lg:grid-cols-2">
        <aside className="w-full bg-[#0b0b0c] px-4 py-6 sm:px-12 lg:h-dvh lg:overflow-y-auto lg:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-xl">
            <p className="font-[family-name:var(--font-arizonia)] text-5xl">
              Zinna
            </p>

            <div className="mt-8 flex items-center gap-3 sm:mt-12 sm:gap-5">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-800 sm:size-20">
                <Image
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-medium sm:text-lg">
                  {product.name}
                </h1>

                <p className="mt-1 text-sm text-neutral-400">
                  Size: {product.size}
                </p>

                <p className="mt-1 text-base sm:text-lg">
                  {price}
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-3 border-t border-neutral-800 pt-6 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>{price}</span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>{price}</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="w-full bg-[#151516] px-4 py-6 sm:px-12 lg:h-dvh lg:overflow-y-auto lg:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-xl">
            <h2 className="text-2xl font-medium">
              Checkout
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block text-sm">
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>

                <label className="block text-sm">
                  Full name
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>
              </div>

              <label className="block text-sm">
                Phone number
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>

              <h3 className="pt-2 text-sm font-medium uppercase tracking-[0.12em]">
                Shipping address
              </h3>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block text-sm">
                  Address
                  <input
                    required
                    name="line1"
                    value={formData.line1}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>

                <label className="block text-sm">
                  Apartment, suite, etc.
                  <input
                    name="line2"
                    value={formData.line2}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-sm">
                  City
                  <input
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>

                <label className="block text-sm">
                  State
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>

                <label className="block text-sm">
                  Postal code
                  <input
                    required
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </label>

                <label className="block text-sm">
                  Country
                  <input
                    required
                    maxLength={2}
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`${inputClassName} uppercase`}
                  />
                </label>
              </div>

              {errorMessage && (
                <p className="text-sm text-red-400">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-white px-6 py-3 font-medium text-black transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Preparing payment..."
                  : `Pay ${price}`}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}