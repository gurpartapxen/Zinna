import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/order";
import { ProductModel } from "@/models/product";

export async function releaseReservedOrderById(
  orderId: mongoose.Types.ObjectId,
) {
  await connectToDatabase();

  const databaseSession = await mongoose.startSession();

  try {
    let wasReleased = false;

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

      wasReleased = true;
    });

    return wasReleased;
  } finally {
    await databaseSession.endSession();
  }
}

export async function releaseExpiredReservations(
  maximumOrders = 50,
) {
  await connectToDatabase();

  const expiredOrders = await OrderModel.find({
    inventoryStatus: "reserved",
    reservationExpiresAt: {
      $lte: new Date(),
    },
  })
    .select("_id")
    .limit(maximumOrders)
    .lean();

  let releasedOrders = 0;

  for (const order of expiredOrders) {
    const wasReleased = await releaseReservedOrderById(order._id);

    if (wasReleased) {
      releasedOrders += 1;
    }
  }

  return {
    checkedOrders: expiredOrders.length,
    releasedOrders,
  };
}
