import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-page">
      <AdminNav user={session.user} />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
