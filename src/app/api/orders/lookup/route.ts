import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getClientIdentifier,
  getRateLimitHeaders,
  orderLookupCodeRateLimit,
} from "@/lib/rateLimit";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderLookupCodeModel } from "@/models/orderLookUpCode";
import {
  OrderModel,
  type OrderItem,
} from "@/models/order";

export const runtime = "nodejs";

const maximumVerificationAttempts = 5;

const lookupSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),

  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(6)
    .max(40),

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
});

function invalidCodeResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "The verification code is invalid, expired, or already used.",
    },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  try {
    const rateLimitResult = await orderLookupCodeRateLimit.limit(
      getClientIdentifier(request),
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many verification attempts. Please try again later.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const result = lookupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter a valid email, order number, and six-digit code.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const verification =
      await OrderLookupCodeModel.findOneAndUpdate(
        {
          email: result.data.email,
          orderNumber: result.data.orderNumber,
          expiresAt: {
            $gt: new Date(),
          },
          usedAt: null,
          attempts: {
            $lt: maximumVerificationAttempts,
          },
        },
        {
          $inc: {
            attempts: 1,
          },
        },
        {
          returnDocument: "after",
        },
      );

    if (!verification) {
      return invalidCodeResponse();
    }

    const codeMatches = await bcrypt.compare(
      result.data.code,
      verification.codeHash,
    );

    if (!codeMatches) {
      return invalidCodeResponse();
    }

    const usedCodeResult =
      await OrderLookupCodeModel.updateOne(
        {
          _id: verification._id,
          usedAt: null,
        },
        {
          $set: {
            usedAt: new Date(),
          },
        },
      );

    if (usedCodeResult.modifiedCount !== 1) {
      return invalidCodeResponse();
    }

    const order = await OrderModel.findOne({
      orderNumber: result.data.orderNumber,
      "customer.email": result.data.email,
    })
      .select(
        "orderNumber createdAt paymentStatus fulfillmentStatus items trackingNumber",
      )
      .lean();

    if (!order) {
      return invalidCodeResponse();
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        trackingNumber: order.trackingNumber ?? null,
        items: order.items.map((item: OrderItem) => ({
          productName: item.productName,
          quantity: item.quantity,
        })),
      },
    });
  } catch (error) {
    console.error("Order lookup verification failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to check the order right now.",
      },
      { status: 500 },
    );
  }
}