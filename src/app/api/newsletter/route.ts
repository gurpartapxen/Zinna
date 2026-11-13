import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import {
  getClientIdentifier,
  getRateLimitHeaders,
  newsletterRateLimit,
} from "@/lib/rateLimit";
import { getResendClient } from "@/lib/resend";
import { NewsletterSubscriberModel } from "@/models/newsLetterSubscriber";

export const runtime = "nodejs";

const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
});

export async function POST(request: Request) {
  try {
    const ipRateLimitResult = await newsletterRateLimit.limit(
      getClientIdentifier(request),
    );

    if (!ipRateLimitResult.success) {
      return Response.json(
        {
          success: false,
          message: "Too many subscription attempts. Please try again later.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(ipRateLimitResult),
        },
      );
    }
    const body = await request.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: "Please enter a valid email address",
        },
        { status: 400 },
      );
    }

    const email = result.data.email;

    const emailRateLimitResult = await newsletterRateLimit.limit(
      `email:${email}`,
    );

    if (!emailRateLimitResult.success) {
      return Response.json(
        {
          success: false,
          message: "Too many subscription attempts. Please try again later.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(emailRateLimitResult),
        },
      );
    }

    await connectToDatabase();

    await NewsletterSubscriberModel.updateOne(
      {
        email,
      },
      {
        $setOnInsert: {
          email,
          subscribedAt: new Date(),
        },
      },
      {
        upsert: true,
      },
    );

    const { resend, fromEmail } = getResendClient();

    const { error: emailError } = await resend.emails.send(
      {
        from: fromEmail,
        to: [email],
        subject: "Welcome to Zinna",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h1>Welcome to Zinna</h1>

            <p>
              Thanks for joining the Zinna community.
            </p>

            <p>
              Enjoy 15% off your first order with us.
            </p>

            <p>
              Stay tuned for new drops, exclusive offers, and everyday pieces
              made for your style.
            </p>

            <p>
              — The Zinna Team
            </p>
          </div>
        `,
      },
      {
        idempotencyKey: `newsletter-welcome-${email}`,
      },
    );

    if (emailError) {
      console.error("Welcome email failed:", emailError);

      return Response.json({
        success: true,
        emailSaved: true,
        emailSent: false,
        message: "Subscription saved, but the welcome email could not be sent",
      });
    }

    return Response.json({
      success: true,
      emailSaved: true,
      emailSent: true,
      message: "Welcome email sent successfully",
    });
  } catch (error) {
    console.error("Newsletter subscription failed:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to subscribe right now",
      },
      { status: 500 },
    );
  }
}