import { signOut } from "@/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <div className="min-h-screen bg-galacticos-dark text-white flex">
      
      {/* SIDEBAR (Client Component) */}
      <AdminSidebar signOutAction={handleSignOut} />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-64 p-8 pt-20 md:pt-8 w-full overflow-x-hidden">
          {children}
      </main>
    </div>
  );
}
