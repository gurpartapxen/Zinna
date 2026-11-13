import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();

    return Response.json({
      success: true,
      message: "MongoDB connected successfully",
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    return Response.json(
      {
        success: false,
        message: "MongoDB connection failed",
      },
      { status: 500 },
    );
  }
}