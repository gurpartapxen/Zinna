import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import {
  getClientIdentifier,
  getRateLimitHeaders,
  orderLookupRateLimit,
} from "@/lib/rateLimit";
import { connectToDatabase } from "@/lib/mongodb";
import { sendOrderLookupCodeEmail } from "@/lib/orderEmail";
import { OrderLookupCodeModel } from "@/models/orderLookUpCode";
import { OrderModel } from "@/models/order";

export const runtime = "nodejs";

const lookupRequestSchema = z.object({
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
});

const codeLifetimeInMinutes = 10;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const result = lookupRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email and order number.",
        },
        { status: 400 },
      );
    }

    const { email, orderNumber } = result.data;

    const rateLimitResult = await orderLookupRateLimit.limit(
      getClientIdentifier(request),
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        },
      );
    }

    await connectToDatabase();

    const order = await OrderModel.findOne({
      orderNumber,
      "customer.email": email,
    }).select("_id");

    // Do not reveal whether an order exists.
    if (!order) {
      return NextResponse.json({
        success: true,
        message:
          "If the details match an order, a verification code has been sent.",
      });
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = await bcrypt.hash(code, 12);

    const expiresAt = new Date(
      Date.now() + codeLifetimeInMinutes * 60 * 1000,
    );

    await OrderLookupCodeModel.findOneAndUpdate(
      {
        email,
        orderNumber,
      },
      {
        $set: {
          codeHash,
          expiresAt,
          attempts: 0,
          usedAt: null,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );

    await sendOrderLookupCodeEmail({
      email,
      orderNumber,
      code,
    });

    return NextResponse.json({
      success: true,
      message:
        "If the details match an order, a verification code has been sent.",
    });
  } catch (error) {
    console.error("Order lookup code request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send the verification code right now.",
      },
      { status: 500 },
    );
  }
}