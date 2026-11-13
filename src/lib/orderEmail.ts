import { getResendClient } from "@/lib/resend";
import type { Order } from "@/models/order";

function escapeHtml(value: string) {
    const replacements: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };

    return value.replace(
        /[&<>"']/g,
        (character) => replacements[character] ?? character,
    );
}

function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount / 100);
}

export async function sendOrderConfirmationEmail(order: Order) {
    const { resend, fromEmail } = getResendClient();

    const customer = order.customer;
    const totals = order.totals;

    if (!customer || !totals) {
        throw new Error("Order customer or totals data is missing");
    }

    const customerName = escapeHtml(customer.name);

    const itemRows = order.items
        .map(
            (item) => `
        <tr>
          <td style="padding: 8px 0;">
            ${escapeHtml(item.productName)}
            <br />
            <small>Size: ${escapeHtml(item.size)}</small>
          </td>
          <td style="padding: 8px 0; text-align: right;">
            ${item.quantity} ×
            ${formatPrice(item.unitPrice, totals.currency)}
          </td>
        </tr>
      `,
        )
        .join("");

    const { error } = await resend.emails.send(
        {
            from: fromEmail,
            to: [customer.email],
            subject: `Zinna order ${order.orderNumber} confirmed`,
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Thank you for your order, ${customerName}.</h1>

          <p>
            Your payment was successful and we are preparing your order.
          </p>

          <p>
            <strong>Order number:</strong> ${order.orderNumber}
          </p>

          <table style="width: 100%; border-collapse: collapse;">
            ${itemRows}
          </table>

          <hr />

          <p style="text-align: right;">
            <strong>
              Total:
              ${formatPrice(
                totals.total,
                totals.currency,
            )}
            </strong>
          </p>

          <p>
            We will send another update when your order is shipped.
          </p>

          <p>— The Zinna Team</p>
        </div>
      `,
        },
        {
            idempotencyKey: `order-confirmation-${order.orderNumber}`,
        },
    );

    if (error) {
        throw new Error("Order confirmation email could not be sent");
    }
}

type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export async function sendFulfillmentUpdateEmail(
  order: Order,
  status: FulfillmentStatus,
  trackingNumber?: string,
) {
  const { resend, fromEmail } = getResendClient();

  const customer = order.customer;

  if (!customer?.email) {
    throw new Error("Customer email is missing");
  }

  const customerName = escapeHtml(customer.name ?? "there");

  const statusMessages: Record<FulfillmentStatus, string> = {
    unfulfilled: "Your order is waiting to be processed.",
    processing: "Your order is now being prepared.",
    shipped: "Your order has been shipped.",
    delivered: "Your order has been delivered.",
    cancelled: "Your order has been cancelled.",
  };

  const trackingMessage = trackingNumber
    ? `<p><strong>Tracking number:</strong> ${escapeHtml(
        trackingNumber,
      )}</p>`
    : "";

  const { error } = await resend.emails.send(
    {
      from: fromEmail,
      to: [customer.email],
      subject: `Update for Zinna order ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>Hello ${customerName},</h1>

          <p>${statusMessages[status]}</p>

          <p>
            <strong>Order number:</strong>
            ${order.orderNumber}
          </p>

          ${trackingMessage}

          <p>— The Zinna Team</p>
        </div>
      `,
    },
    {
      idempotencyKey: `fulfillment-${order.orderNumber}-${status}-${trackingNumber ?? "none"}`,
    },
  );

  if (error) {
    throw new Error(
      "Fulfillment update email could not be sent",
    );
  }
}

export async function sendOrderLookupCodeEmail({
  email,
  orderNumber,
  code,
}: {
  email: string;
  orderNumber: string;
  code: string;
}) {
  const { resend, fromEmail } = getResendClient();

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: `Your Zinna order lookup code`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Your verification code</h1>

        <p>
          Use the code below to view the status of order
          <strong>${escapeHtml(orderNumber)}</strong>.
        </p>

        <p
          style="
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            margin: 24px 0;
          "
        >
          ${code}
        </p>

        <p>This code expires in 10 minutes.</p>

        <p>
          If you did not request this code, you can safely ignore this email.
        </p>

        <p>— The Zinna Team</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(
      "Order lookup verification email could not be sent",
    );
  }
}