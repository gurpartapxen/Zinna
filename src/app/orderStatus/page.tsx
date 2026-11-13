import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { OrderStatusForm } from "@/components/features/orderStatusForm";

export default function OrderStatusPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background px-4 py-20 sm:px-6 lg:px-10 lg:py-23">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Guest order tracking
            </p>

            <h1 className="mt-5 font-[family-name:var(--font-arizonia)] text-5xl leading-none sm:text-6xl">
              Check your order
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
              Enter the email address used during checkout and your order
              number to view the latest order status.
            </p>
          </div>

          <OrderStatusForm />
        </div>
      </main>

      <Footer />
    </>
  );
}