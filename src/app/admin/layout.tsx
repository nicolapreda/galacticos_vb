import { signOut } from "@/auth";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-galacticos-dark text-white">
      
      {/* NAVBAR (Client Component) */}
      <AdminNavbar signOutAction={handleSignOut} />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-6 pt-28 w-full">
          {children}
      </main>
    </div>
  );
}
