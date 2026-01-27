import { signOut } from "@/auth";
import Link from "next/link";
import { LogOut, LayoutDashboard, FileText } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-galacticos-dark text-white flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-black/30 border-r border-white/10 flex flex-col fixed h-full z-10">
          <div className="p-6 border-b border-white/10 bg-black/50">
              <span className="font-black font-anton uppercase text-xl text-flyer-cyan">Admin Panel</span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
              <Link href="/admin/news" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors font-bold uppercase tracking-wider text-sm text-gray-300 hover:text-white">
                  <FileText className="w-4 h-4" /> Notizie
              </Link>
          </nav>

          <div className="p-4 border-t border-white/10 bg-black/50">
              <form action={async () => {
                  "use server";
                  await signOut();
              }}>
                  <button className="flex items-center gap-3 w-full px-4 py-3 rounded hover:bg-red-900/20 hover:text-red-400 transition-colors font-bold uppercase tracking-wider text-sm text-gray-400">
                      <LogOut className="w-4 h-4" /> Esci
                  </button>
              </form>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
          {children}
      </main>
    </div>
  );
}
