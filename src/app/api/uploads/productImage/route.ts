import { NextResponse } from "next/server";
import { getCloudinaryClient } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
    try {

        const isAdmin = await requireAdmin();

        if (!isAdmin) {
            return NextResponse.json(
                {
                    message: "Unauthorized upload request",
                },
                { status: 401 },
            );
        }
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { message: "An image file is required" },
                { status: 400 },
            );
        }

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: "Only JPG, PNG, and WebP images are allowed" },
                { status: 400 },
            );
        }

        if (file.size > maxFileSize) {
            return NextResponse.json(
                { message: "Image must be smaller than 5MB" },
                { status: 400 },
            );
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const cloudinary = getCloudinaryClient();

        const uploadResult = await new Promise<{
            secureUrl: string;
            publicId: string;
        }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "zinna/products",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error || !result) {
                        reject(error ?? new Error("Cloudinary upload failed"));
                        return;
                    }

                    resolve({
                        secureUrl: result.secure_url,
                        publicId: result.public_id,
                    });
                },
            );

            uploadStream.end(fileBuffer);
        });

        return NextResponse.json(uploadResult, { status: 201 });
    } catch (error) {
        console.error("Product image upload error:", error);

        return NextResponse.json(
            { message: "Unable to upload image" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized request" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { message: "publicId is required" },
        { status: 400 },
      );
    }

    const cloudinary = getCloudinaryClient();

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      result: result.result,
    });
  } catch (error) {
    console.error("Cloudinary cleanup error:", error);

    return NextResponse.json(
      { message: "Unable to delete image" },
      { status: 500 },
    );
  }
}