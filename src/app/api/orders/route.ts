import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { OrderModel } from "@/models/order";
import { z } from "zod";
import { sendFulfillmentUpdateEmail } from "@/lib/orderEmail";
import { getStripeClient } from "@/lib/stripe";

const orderUpdateSchema = z.object({
  fulfillmentStatus: z.enum([
    "unfulfilled",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),  

  trackingNumber: z
    .string()
    .trim()
    .max(100)
    .optional(),
});

const refundRequestSchema = z.object({
  orderNumber: z.string().trim().min(6).max(40),
});

export const runtime = "nodejs";

export async function GET() {
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

    await connectToDatabase();

    const orders = await OrderModel.find()
      .select(
        "orderNumber customer.name customer.email totals paymentStatus fulfillmentStatus refundStatus trackingNumber createdAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Admin order loading error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load orders",
      },
      { status: 500 },
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
        {
          status: 401,
        },
      );
    }

    const body: unknown = await request.json().catch(() => null);

    const result = refundRequestSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: "A valid order number is required",
        },
        {
          status: 400,
        },
      );
    }

    await connectToDatabase();

    const order = await OrderModel.findOne({
      orderNumber: result.data.orderNumber,
    });

    if (!order) {
      return Response.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    if (order.paymentStatus !== "paid") {
      return Response.json(
        {
          success: false,
          message: "Only paid orders can be refunded",
        },
        {
          status: 400,
        },
      );
    }

    if (!order.stripePaymentIntentId) {
      return Response.json(
        {
          success: false,
          message:
            "This order does not have a Stripe payment reference",
        },
        {
          status: 400,
        },
      );
    }

    if (order.refundStatus !== "none") {
      return Response.json(
        {
          success: false,
          message:
            "A refund is already pending or completed for this order",
        },
        {
          status: 409,
        },
      );
    }

    const stripe = getStripeClient();

    const refund = await stripe.refunds.create(
      {
        payment_intent: order.stripePaymentIntentId,
      },
      {
        idempotencyKey: `zinna-refund-${order._id.toString()}`,
      },
    );

    await OrderModel.updateOne(
      {
        _id: order._id,
        refundStatus: "none",
      },
      {
        $set: {
          refundStatus: "pending",
          stripeRefundId: refund.id,
          refundRequestedAt: new Date(),
        },
      },
    );

    return Response.json({
      success: true,
      message:
        "Refund requested. Stripe will confirm its final status by webhook.",
      refundId: refund.id,
    });
  } catch (error) {
    console.error("Admin refund request failed:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to request the refund",
      },
      {
        status: 500,
      },
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
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return Response.json(
        {
          success: false,
          message: "Order number is required",
        },
        { status: 400 },
      );
    }

    const updateData = orderUpdateSchema.parse(
      await request.json(),
    );

    await connectToDatabase();

    const existingOrder = await OrderModel.findOne({
      orderNumber,
    });

    if (!existingOrder) {
      return Response.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    const previousStatus = existingOrder.fulfillmentStatus;

    const updatedOrder = await OrderModel.findOneAndUpdate(
      { orderNumber },
      { $set: updateData },
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .select(
        "orderNumber customer.name customer.email totals paymentStatus fulfillmentStatus refundStatus trackingNumber createdAt",
      )
      .lean();

    if (!updatedOrder) {
      return Response.json(
        {
          success: false,
          message: "Order update failed",
        },
        { status: 500 },
      );
    }

    const notificationStatuses = [
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const SendNotification =
      previousStatus !== updateData.fulfillmentStatus &&
      notificationStatuses.includes(
        updateData.fulfillmentStatus,
      );

    let notificationSent = false;

    if (SendNotification) {
      try {
        await sendFulfillmentUpdateEmail(
          existingOrder,
          updateData.fulfillmentStatus,
          updateData.trackingNumber ??
          existingOrder.trackingNumber,
        );

        notificationSent = true;
      } catch (emailError) {
        console.error(
          "Fulfillment notification failed:",
          emailError,
        );
      }
    }

    return Response.json({
      success: true,
      order: updatedOrder,
      notificationSent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          message: "Invalid order update data",
          errors: error.flatten(),
        },
        { status: 400 },
      );
    }

    console.error("Admin order update error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to update order",
      },
      { status: 500 },
    );
  }
}