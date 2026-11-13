import { NextResponse } from "next/server";

import { releaseExpiredReservations } from "@/lib/releaseReservation";

export const runtime = "nodejs";

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
    const cleanupResult = await releaseExpiredReservations();

    return NextResponse.json({
      success: true,
      ...cleanupResult,
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
