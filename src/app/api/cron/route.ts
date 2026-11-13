import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { releaseReservedOrderById } from "@/lib/releaseReservation";
import { OrderModel } from "@/models/order";

export const runtime = "nodejs";

const maximumOrdersPerRun = 50;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      {
        success: false,
        message: "Cron secret is not configured",
      },
      {
        status: 500,
      },
    );
  }

  const authorizationHeader = request.headers.get(
    "authorization",
  );

  if (
    authorizationHeader !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    await connectToDatabase();

    const expiredOrders = await OrderModel.find({
      inventoryStatus: "reserved",
      reservationExpiresAt: {
        $lte: new Date(),
      },
    })
      .select("_id")
      .limit(maximumOrdersPerRun)
      .lean();

    let releasedOrders = 0;

    for (const order of expiredOrders) {
      const wasReleased = await releaseReservedOrderById(
        order._id,
      );

      if (wasReleased) {
        releasedOrders += 1;
      }
    }

    return NextResponse.json({
      success: true,
      checkedOrders: expiredOrders.length,
      releasedOrders,
    });
  } catch (error) {
    console.error(
      "Expired reservation cleanup failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Reservation cleanup failed",
      },
      {
        status: 500,
      },
    );
  }
}