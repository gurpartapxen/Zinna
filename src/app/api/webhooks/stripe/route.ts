import mongoose from "mongoose";
import Stripe from "stripe";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { sendOrderConfirmationEmail } from "@/lib/orderEmail";
import { getStripeClient } from "@/lib/stripe";
import { OrderModel } from "@/models/order";
import { ProductModel } from "@/models/product";

export const runtime = "nodejs";

function getPaymentIntentId(
  session: Stripe.Checkout.Session,
) {
  const paymentIntent = session.payment_intent;

  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }

  return paymentIntent?.id ?? null;
}

function getRefundPaymentIntentId(refund: Stripe.Refund) {
  const paymentIntent = refund.payment_intent;

  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }

  return paymentIntent?.id ?? null;
}

async function syncRefundStatus(refund: Stripe.Refund) {
  await connectToDatabase();

  const paymentIntentId = getRefundPaymentIntentId(refund);

  const order = paymentIntentId
    ? await OrderModel.findOne({
      $or: [
        {
          stripeRefundId: refund.id,
        },
        {
          stripePaymentIntentId: paymentIntentId,
        },
      ],
    })
    : await OrderModel.findOne({
      stripeRefundId: refund.id,
    });

  if (!order) {
    console.warn(
      `Order not found for Stripe refund ${refund.id}`,
    );
    return;
  }

  order.stripeRefundId = refund.id;

  if (refund.status === "succeeded") {
    order.refundStatus = "succeeded";
    order.paymentStatus = "refunded";
    order.refundedAt = new Date();
  } else if (refund.status === "failed") {
    order.refundStatus = "failed";
    order.refundFailureReason =
      refund.failure_reason ?? "Refund failed in Stripe";
  } else if (refund.status === "canceled") {
    order.refundStatus = "cancelled";
    order.refundFailureReason =
      refund.failure_reason ?? "Refund was cancelled in Stripe";
  } else if (refund.status === "requires_action") {
    order.refundStatus = "requiresAction";
  } else {
    order.refundStatus = "pending";
  }

  await order.save();
}

async function confirmReservedOrder(
  session: Stripe.Checkout.Session,
) {
  await connectToDatabase();

  const paymentIntentId = getPaymentIntentId(session);

  if (!paymentIntentId) {
    throw new Error(
      `PaymentIntent is missing for Stripe session ${session.id}`,
    );
  }

  const databaseSession = await mongoose.startSession();

  try {
    await databaseSession.withTransaction(async () => {
      const order = await OrderModel.findOne({
        stripeSessionId: session.id,
      }).session(databaseSession);

      if (!order) {
        throw new Error(
          `Order not found for Stripe session ${session.id}`,
        );
      }

      if (
        order.paymentStatus === "paid" &&
        order.inventoryStatus === "sold"
      ) {
        return;
      }

      if (order.inventoryStatus !== "reserved") {
        throw new Error(
          `Order ${order.orderNumber} has no active inventory reservation`,
        );
      }

      for (const item of order.items) {
        const productUpdate = await ProductModel.updateOne(
          {
            _id: item.productId,
            variants: {
              $elemMatch: {
                sku: item.sku,
                size: item.size,
                stock: {
                  $gte: item.quantity,
                },
                reservedStock: {
                  $gte: item.quantity,
                },
              },
            },
          },
          {
            $inc: {
              "variants.$.stock": -item.quantity,
              "variants.$.reservedStock": -item.quantity,
            },
          },
          {
            session: databaseSession,
          },
        );

        if (productUpdate.modifiedCount !== 1) {
          throw new Error(
            `Unable to complete stock sale for ${item.productName}`,
          );
        }
      }

      order.paymentStatus = "paid";
      order.inventoryStatus = "sold";
      order.stripePaymentIntentId = paymentIntentId;

      await order.save({
        session: databaseSession,
      });
    });
  } finally {
    await databaseSession.endSession();
  }
}

async function releaseReservedOrder(
  session: Stripe.Checkout.Session,
) {
  await connectToDatabase();

  const databaseSession = await mongoose.startSession();

  try {
    await databaseSession.withTransaction(async () => {
      const order = await OrderModel.findOne({
        stripeSessionId: session.id,
      }).session(databaseSession);

      if (!order || order.inventoryStatus !== "reserved") {
        return;
      }

      for (const item of order.items) {
        const productUpdate = await ProductModel.updateOne(
          {
            _id: item.productId,
            variants: {
              $elemMatch: {
                sku: item.sku,
                size: item.size,
                reservedStock: {
                  $gte: item.quantity,
                },
              },
            },
          },
          {
            $inc: {
              "variants.$.reservedStock": -item.quantity,
            },
          },
          {
            session: databaseSession,
          },
        );

        if (productUpdate.modifiedCount !== 1) {
          throw new Error(
            `Unable to release stock for ${item.productName}`,
          );
        }
      }

      order.inventoryStatus = "released";

      if (order.paymentStatus === "pending") {
        order.paymentStatus = "failed";
      }

      await order.save({
        session: databaseSession,
      });
    });
  } finally {
    await databaseSession.endSession();
  }
}

async function sendConfirmationEmailIfNeeded(
  session: Stripe.Checkout.Session,
) {
  await connectToDatabase();

  const order = await OrderModel.findOne({
    stripeSessionId: session.id,
    paymentStatus: "paid",
    confirmationEmailSentAt: {
      $exists: false,
    },
  });

  if (!order) {
    return;
  }

  await sendOrderConfirmationEmail(order);

  await OrderModel.updateOne(
    {
      _id: order._id,
      confirmationEmailSentAt: {
        $exists: false,
      },
    },
    {
      $set: {
        confirmationEmailSentAt: new Date(),
      },
    },
  );
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      {
        message: "Webhook configuration is missing",
      },
      {
        status: 400,
      },
    );
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch {
    return NextResponse.json(
      {
        message: "Invalid webhook signature",
      },
      {
        status: 400,
      },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.payment_status === "paid") {
          await confirmReservedOrder(session);
          await sendConfirmationEmailIfNeeded(session);
        }

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;

        await confirmReservedOrder(session);
        await sendConfirmationEmailIfNeeded(session);

        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object;

        await releaseReservedOrder(session);

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;

        await releaseReservedOrder(session);

        break;
      }

      case "refund.created":
      case "refund.updated":
      case "refund.failed": {
        const refund = event.data.object;

        await syncRefundStatus(refund);

        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      {
        message: "Webhook processing failed",
      },
      {
        status: 500,
      },
    );
  }
}