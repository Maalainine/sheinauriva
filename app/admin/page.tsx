import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect("/admin/login?callbackUrl=/admin");
  }

  // Redirect to home if not admin
  if (session.user.role !== 'ADMIN') {
    redirect("/");
  }

  // Redirect to dashboard by default
  redirect("/admin/dashboard");
}
