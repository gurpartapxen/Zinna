import Link from "next/link";
import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/products");
  }

  const stripe = getStripeClient();

  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    redirect("/products");
  }

  const orderNumber =
    session.metadata?.orderNumber ?? "your order";

  const paymentCompleted =
    session.payment_status === "paid";

  return (
    <main className="min-h-screen px-6 py-20">
    

      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
          {paymentCompleted
            ? "Payment received"
            : "Payment processing"}
        </p>

        <h1 className="mt-4 font-[family-name:var(--font-arizonia)] text-6xl">
          Thank you for your order
        </h1>

        <p className="mt-6 text-muted-foreground">
          Your order number is:
        </p>

        <p className="mt-2 font-medium">{orderNumber}</p>

        <p className="mt-6 text-sm text-muted-foreground">
          {paymentCompleted
            ? "We are preparing your order."
            : "Your payment is still being confirmed."}
        </p>

        <Link
          href="/products"
          className="mt-10 inline-block bg-black px-7 py-4 text-sm uppercase tracking-[0.12em] text-white"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}