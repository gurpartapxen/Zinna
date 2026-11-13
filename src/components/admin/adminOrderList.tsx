"use client";

import { FormEvent, useEffect, useState } from "react";

type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type RefundStatus =
  | "none"
  | "pending"
  | "requiresAction"
  | "succeeded"
  | "failed"
  | "cancelled";

type AdminOrder = {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  totals: {
    total: number;
    currency: string;
  };
  paymentStatus: string;
  fulfillmentStatus: FulfillmentStatus;
  refundStatus: RefundStatus;
  trackingNumber?: string;
  createdAt: string;
};

const fulfillmentStatuses: FulfillmentStatus[] = [
  "unfulfilled",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatTotal(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

type AdminOrderRowProps = {
  order: AdminOrder;
  onSaved: (order: AdminOrder) => void;
};

function AdminOrderRow({
  order,
  onSaved,
}: AdminOrderRowProps) {
  const [status, setStatus] = useState(
    order.fulfillmentStatus,
  );

  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber ?? "",
  );

  const [isSaving, setIsSaving] = useState(false);

  const [isRefunding, setIsRefunding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");

    const response = await fetch(
      `/api/orders?orderNumber=${encodeURIComponent(
        order.orderNumber,
      )}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fulfillmentStatus: status,
          trackingNumber,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(
        data.message ?? "Unable to update order",
      );
      setIsSaving(false);
      return;
    }

    onSaved(data.order);
    setIsSaving(false);
  }

  async function handleRefund() {
    const confirmed = window.confirm(
      `Refund the full payment for order ${order.orderNumber}? This action cannot be undone from Zinna.`,
    );

    if (!confirmed) {
      return;
    }

    setIsRefunding(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ?? "Unable to request the refund",
        );
        return;
      }

      onSaved({
        ...order,
        refundStatus: "pending",
      });
    } catch {
      setErrorMessage("Unable to request the refund");
    } finally {
      setIsRefunding(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border p-5"
    >
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="font-medium">
            Order {order.orderNumber}
          </p>

          <p className="text-sm text-muted-foreground">
            {order.customer.name} · {order.customer.email}
          </p>

          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="text-right">
          <p className="font-medium">
            {formatTotal(
              order.totals.total,
              order.totals.currency,
            )}
          </p>

          <p className="text-sm">
            Payment: {order.paymentStatus}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as FulfillmentStatus,
            )
          }
          className="border px-3 py-2"
        >
          {fulfillmentStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          value={trackingNumber}
          onChange={(event) =>
            setTrackingNumber(event.target.value)
          }
          placeholder="Tracking number"
          className="border px-3 py-2"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Update order"}
      </button>
      {order.paymentStatus === "paid" &&
        order.refundStatus === "none" && (
          <button
            type="button"
            onClick={handleRefund}
            disabled={isRefunding}
            className="ml-3 border border-red-600 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRefunding ? "Requesting refund..." : "Refund payment"}
          </button>
        )}

      {order.refundStatus !== "none" && (
        <p className="text-sm text-muted-foreground">
          Refund: {order.refundStatus}
        </p>
      )}
    </form>
  );
}

export function AdminOrderList() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      const response = await fetch("/api/orders", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ?? "Unable to load orders",
        );
        setIsLoading(false);
        return;
      }

      setOrders(data.orders);
      setIsLoading(false);
    }

    loadOrders();
  }, []);

  function handleSaved(updatedOrder: AdminOrder) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.orderNumber === updatedOrder.orderNumber
          ? updatedOrder
          : order,
      ),
    );
  }

  if (isLoading) {
    return <p className="mt-10">Loading orders...</p>;
  }

  if (errorMessage) {
    return (
      <p className="mt-10 text-red-600">
        {errorMessage}
      </p>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold">Orders</h2>

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((order) => (
            <AdminOrderRow
              key={order.orderNumber}
              order={order}
              onSaved={handleSaved}
            />
          ))
        )}
      </div>
    </section>
  );
}