import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const sessionEmail = session?.user?.email?.toLowerCase();

  return Boolean(
    sessionEmail &&
      adminEmail &&
      sessionEmail === adminEmail,
  );
}