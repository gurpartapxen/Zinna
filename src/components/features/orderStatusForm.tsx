"use client";

import { useState, type FormEvent } from "react";

type OrderItem = {
  productName: string;
  quantity: number;
};

type OrderResult = {
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  items: OrderItem[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  order?: OrderResult;
};

type LookupStep = "details" | "code";

function formatStatus(status: string) {
  return status.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => {
    return letter.toUpperCase();
  });
}

export function OrderStatusForm() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<LookupStep>("details");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function requestCode() {
    setIsLoading(true);
    setMessage("");
    setOrder(null);

    try {
      const response = await fetch(
        "/api/orders/lookup/requestCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            orderNumber,
          }),
        },
      );

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message ?? "Unable to send a verification code.",
        );
        return;
      }

      setStep("code");
      setMessage(
        data.message ??
          "A verification code has been sent to your email.",
      );
    } catch {
      setMessage("Unable to send a verification code right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode() {
    setIsLoading(true);
    setMessage("");
    setOrder(null);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          orderNumber,
          code,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.order) {
        setMessage(
          data.message ?? "Unable to verify the code.",
        );
        return;
      }

      setOrder(data.order);
      setMessage("");
    } catch {
      setMessage("Unable to check your order right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDetailsSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    await requestCode();
  }

  async function handleCodeSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    await verifyCode();
  }

  function returnToDetails() {
    setStep("details");
    setCode("");
    setMessage("");
    setOrder(null);
  }

  return (
    <div className="mx-auto max-w-xl">
      {step === "details" ? (
        <form
          onSubmit={handleDetailsSubmit}
          className="space-y-5 border border-border p-6 sm:p-8"
        >
          <div>
            <label
              htmlFor="orderEmail"
              className="mb-2 block text-sm uppercase tracking-[0.12em]"
            >
              Email address
            </label>

            <input
              id="orderEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="h-12 w-full border border-border bg-transparent px-4 text-sm outline-none transition-colors focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="orderNumber"
              className="mb-2 block text-sm uppercase tracking-[0.12em]"
            >
              Order number
            </label>

            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(event) =>
                setOrderNumber(event.target.value.toUpperCase())
              }
              placeholder="ZIN-ABC123"
              required
              className="h-12 w-full border border-border bg-transparent px-4 text-sm uppercase outline-none transition-colors focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full bg-black text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Sending code..." : "Send verification code"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleCodeSubmit}
          className="space-y-5 border border-border p-6 sm:p-8"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.12em]">
              Verify your email
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter the six-digit code sent to {email}.
            </p>
          </div>

          <div>
            <label
              htmlFor="verificationCode"
              className="mb-2 block text-sm uppercase tracking-[0.12em]"
            >
              Verification code
            </label>

            <input
              id="verificationCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6),
                )
              }
              placeholder="123456"
              maxLength={6}
              required
              className="h-12 w-full border border-border bg-transparent px-4 text-center text-lg tracking-[0.4em] outline-none transition-colors focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="h-12 w-full bg-black text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "View order"}
          </button>

          <div className="flex items-center justify-between gap-4 text-sm">
            <button
              type="button"
              onClick={returnToDetails}
              className="underline underline-offset-4"
            >
              Change details
            </button>

            <button
              type="button"
              onClick={requestCode}
              disabled={isLoading}
              className="underline underline-offset-4 disabled:opacity-50"
            >
              Send another code
            </button>
          </div>
        </form>
      )}

      {message && (
        <p
          role="alert"
          className="mt-6 text-center text-sm text-red-600"
        >
          {message}
        </p>
      )}

      {order && (
        <div className="mt-8 border border-border p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-3 border-b border-border pb-5 sm:flex-row">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Order number
              </p>

              <p className="mt-1 font-medium">
                {order.orderNumber}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Placed on
              </p>

              <p className="mt-1 text-sm">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(new Date(order.createdAt))}
              </p>
            </div>
          </div>

          <div className="grid gap-5 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Payment
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatStatus(order.paymentStatus)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Delivery
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatStatus(order.fulfillmentStatus)}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Items
            </p>

            <div className="mt-4 space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productName}-${index}`}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span>{item.productName}</span>

                  <span className="text-muted-foreground">
                    x {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {order.trackingNumber && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Tracking number
              </p>

              <p className="mt-1 text-sm font-medium">
                {order.trackingNumber}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}