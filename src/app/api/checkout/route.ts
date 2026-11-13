import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getStripeClient } from "@/lib/stripe";
import { OrderModel } from "@/models/order";
import {
    ProductModel,
    type ProductVariant,
} from "@/models/product";
import {
    checkoutRateLimit,
    getClientIdentifier,
    getRateLimitHeaders,
} from "@/lib/rateLimit";

export const runtime = "nodejs";

const reservationMinutes = 45;

const checkoutSchema = z.object({
    checkoutRequestId: z.string().uuid(),

    items: z
        .array(
            z.object({
                catalogId: z.number().int().positive(),
                sku: z.string().trim().min(1),
                size: z.string().trim().min(1),
                quantity: z.number().int().min(1).max(20),
            }),
        )
        .min(1)
        .max(50),

    customer: z.object({
        name: z.string().trim().min(2).max(100),
        email: z.string().trim().email(),
        phone: z.string().trim().max(30).optional(),
    }),

    shippingAddress: z.object({
        line1: z.string().trim().min(3).max(150),
        line2: z.string().trim().max(150).optional(),
        city: z.string().trim().min(2).max(80),
        state: z.string().trim().max(80).optional(),
        postalCode: z.string().trim().min(2).max(20),
        country: z
            .string()
            .trim()
            .length(2)
            .transform((value) => value.toUpperCase()),
    }),
});

type CheckoutOrderItem = {
    productId: mongoose.Types.ObjectId;
    productName: string;
    sku: string;
    size: string;
    quantity: number;
    unitPrice: number;
    image: string;
};

class CheckoutError extends Error { }

function createOrderNumber() {
    return `ZIN-${Date.now()}-${randomUUID()
        .slice(0, 8)
        .toUpperCase()}`;
}

async function releaseReservedOrder(
    orderId: mongoose.Types.ObjectId,
) {
    const databaseSession = await mongoose.startSession();

    try {
        await databaseSession.withTransaction(async () => {
            const order = await OrderModel.findById(orderId).session(
                databaseSession,
            );

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
                        `Unable to release reservation for ${item.productName}`,
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

export async function POST(request: Request) {
    let reservedOrderId: mongoose.Types.ObjectId | null = null;

    try {
        const rateLimitResult = await checkoutRateLimit.limit(
            getClientIdentifier(request),
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    message:
                        "Too many checkout attempts. Please try again shortly.",
                },
                {
                    status: 429,
                    headers: getRateLimitHeaders(rateLimitResult),
                },
            );
        }
        const body: unknown = await request.json();
        const parsedBody = checkoutSchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json(
                {
                    message:
                        parsedBody.error.issues[0]?.message ??
                        "Invalid checkout data",
                },
                { status: 400 },
            );
        }

        const {
            checkoutRequestId,
            items,
            customer,
            shippingAddress,
        } = parsedBody.data;

        const itemKeys = items.map(
            (item) => `${item.catalogId}-${item.sku}-${item.size}`,
        );

        if (new Set(itemKeys).size !== itemKeys.length) {
            return NextResponse.json(
                {
                    message: "Duplicate product variants are not allowed",
                },
                { status: 400 },
            );
        }

        const firstItem = items[0];

        if (!firstItem) {
            return NextResponse.json(
                { message: "At least one item is required" },
                { status: 400 },
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(
            /\/$/,
            "",
        );

        if (!appUrl) {
            return NextResponse.json(
                { message: "NEXT_PUBLIC_APP_URL is missing" },
                { status: 500 },
            );
        }

        await connectToDatabase();

        const existingOrder = await OrderModel.findOne({
            checkoutRequestId,
        })
            .select("orderNumber stripeSessionId")
            .lean();

        if (existingOrder) {
            if (!existingOrder.stripeSessionId) {
                return NextResponse.json(
                    {
                        message:
                            "This checkout attempt is already being processed. Please refresh and try again.",
                    },
                    {
                        status: 409,
                    },
                );
            }

            const stripe = getStripeClient();

            const existingSession =
                await stripe.checkout.sessions.retrieve(
                    existingOrder.stripeSessionId,
                );

            if (
                existingSession.status === "open" &&
                existingSession.url
            ) {
                return NextResponse.json({
                    checkoutUrl: existingSession.url,
                    orderNumber: existingOrder.orderNumber,
                });
            }

            return NextResponse.json(
                {
                    message:
                        "This checkout attempt has already been completed or expired.",
                },
                {
                    status: 409,
                },
            );
        }

        const reservationExpiresAt = new Date(
            Date.now() + reservationMinutes * 60 * 1000,
        );

        const databaseSession = await mongoose.startSession();

        let orderNumber = "";
        let currency = "";
        let orderItems: CheckoutOrderItem[] = [];

        try {
            await databaseSession.withTransaction(async () => {
                const reservedItems: CheckoutOrderItem[] = [];
                let orderCurrency: string | null = null;

                for (const requestedItem of items) {
                    const product = await ProductModel.findOne({
                        catalogId: requestedItem.catalogId,
                        isActive: true,
                    }).session(databaseSession);

                    if (!product) {
                        throw new CheckoutError(
                            "A selected product is no longer available",
                        );
                    }

                    const variant = product.variants.find(
                        (productVariant: ProductVariant) =>
                            productVariant.sku === requestedItem.sku &&
                            productVariant.size === requestedItem.size,
                    );

                    if (!variant) {
                        throw new CheckoutError(
                            "The selected product size is unavailable",
                        );
                    }

                    const reservedStock = variant.reservedStock ?? 0;
                    const availableStock = variant.stock - reservedStock;

                    if (availableStock < requestedItem.quantity) {
                        throw new CheckoutError(
                            `${product.name} is no longer available in that quantity`,
                        );
                    }

                    const primaryImage = product.images[0];

                    if (!primaryImage?.src) {
                        throw new CheckoutError(
                            `${product.name} is missing a product image`,
                        );
                    }

                    const productCurrency =
                        product.price.currency.toUpperCase();

                    if (
                        orderCurrency &&
                        productCurrency !== orderCurrency
                    ) {
                        throw new CheckoutError(
                            "Products must use the same currency",
                        );
                    }

                    orderCurrency = productCurrency;

                    variant.reservedStock =
                        reservedStock + requestedItem.quantity;

                    await product.save({
                        session: databaseSession,
                    });

                    reservedItems.push({
                        productId: product._id,
                        productName: product.name,
                        sku: variant.sku,
                        size: variant.size,
                        quantity: requestedItem.quantity,
                        unitPrice: product.price.amount,
                        image: primaryImage.src,
                    });
                }

                if (!orderCurrency) {
                    throw new CheckoutError(
                        "Unable to determine order currency",
                    );
                }

                const subtotal = reservedItems.reduce(
                    (total, item) =>
                        total + item.unitPrice * item.quantity,
                    0,
                );

                const shipping = 0;
                const tax = 0;
                const total = subtotal + shipping + tax;

                const [order] = await OrderModel.create(
                    [
                        {
                            orderNumber: createOrderNumber(),
                            checkoutRequestId,
                            customer,
                            shippingAddress,
                            items: reservedItems,
                            totals: {
                                subtotal,
                                shipping,
                                tax,
                                total,
                                currency: orderCurrency,
                            },
                            paymentStatus: "pending",
                            fulfillmentStatus: "unfulfilled",
                            inventoryStatus: "reserved",
                            reservationExpiresAt,
                        },
                    ],
                    {
                        session: databaseSession,
                    },
                );

                if (!order) {
                    throw new Error("Unable to create order");
                }

                reservedOrderId = order._id;
                orderNumber = order.orderNumber;
                currency = orderCurrency;
                orderItems = reservedItems;
            });
        } finally {
            await databaseSession.endSession();
        }

        const orderId =
            reservedOrderId as mongoose.Types.ObjectId | null;

        if (!orderId) {
            throw new Error("Unable to reserve inventory");
        }

        const stripe = getStripeClient();
        let stripeSessionId: string | null = null;

        try {
            const checkoutSession =
                await stripe.checkout.sessions.create({
                    mode: "payment",
                    customer_email: customer.email,
                    expires_at: Math.floor(
                        reservationExpiresAt.getTime() / 1000,
                    ),

                    line_items: orderItems.map((item) => ({
                        price_data: {
                            currency: currency.toLowerCase(),
                            product_data: {
                                name: item.productName,
                            },
                            unit_amount: item.unitPrice,
                        },
                        quantity: item.quantity,
                    })),

                    metadata: {
                        orderId: orderId.toString(),
                        orderNumber,
                    },

                    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${appUrl}/products/${firstItem.catalogId}`,
                },
                    {
                        idempotencyKey: `checkout-${checkoutRequestId}`,
                    });

            if (!checkoutSession.url) {
                throw new Error(
                    "Stripe did not return a checkout URL",
                );
            }

            stripeSessionId = checkoutSession.id;

            const sessionUpdate = await OrderModel.updateOne(
                {
                    _id: reservedOrderId,
                    inventoryStatus: "reserved",
                },
                {
                    $set: {
                        stripeSessionId: checkoutSession.id,
                    },
                },
            );

            if (sessionUpdate.modifiedCount !== 1) {
                throw new Error(
                    "Unable to connect the order to Stripe",
                );
            }

            return NextResponse.json({
                checkoutUrl: checkoutSession.url,
                orderNumber,
            });
        } catch (error) {
            if (stripeSessionId) {
                await stripe.checkout.sessions
                    .expire(stripeSessionId)
                    .catch(() => undefined);
            }

            await releaseReservedOrder(orderId).catch(
                (releaseError) => {
                    console.error(
                        "Inventory release after checkout failure failed:",
                        releaseError,
                    );
                },
            );

            throw error;
        }
    } catch (error) {
        if (error instanceof CheckoutError) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 },
            );
        }

        console.error("Checkout creation error:", error);

        return NextResponse.json(
            { message: "Unable to start checkout" },
            { status: 500 },
        );
    }
}