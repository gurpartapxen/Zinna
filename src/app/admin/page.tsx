import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { AdminProductList } from "@/components/admin/adminProductList";
import { AdminProductForm } from "@/components/admin/adminProductForm";
import { AdminOrderList } from "@/components/admin/adminOrderList";

export default async function AdminPage() {
  const session = await auth();

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const sessionEmail = session?.user?.email?.toLowerCase();

  if (!sessionEmail || sessionEmail !== adminEmail) {
    redirect("/admin/login");
  }

  async function handleSignOut() {
    "use server";

    await signOut({
      redirectTo: "/admin/login",
    });
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em]">
              Zinna Admin
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              Dashboard
            </h1>

            <p className="mt-2 text-muted-foreground">
              Manage products, images, and orders.
            </p>
          </div>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="border px-4 py-2"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <AdminProductList />
      <AdminProductForm />
      <AdminOrderList />
    </main>
  );
}