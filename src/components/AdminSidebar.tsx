"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, FileText, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export default function AdminSidebar({ signOutAction }: { signOutAction: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-flyer-cyan p-2 rounded border border-white/20 text-black shadow-lg hover:bg-white transition-colors"
            >
                {isOpen ? <X className="w-6 h-6" /> : <LayoutDashboard className="w-6 h-6" />}
            </button>

            {/* OVERLAY for Mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={clsx(
                "w-64 bg-black/90 md:bg-black/30 border-r border-white/10 flex flex-col fixed h-full z-40 transition-transform duration-300 md:translate-x-0 backdrop-blur-md md:backdrop-blur-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-white/10 bg-black/50 mt-12 md:mt-0">
                    <span className="font-black font-anton uppercase text-xl text-flyer-cyan">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link 
                        href="/admin/matches" 
                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors font-bold uppercase tracking-wider text-sm text-gray-300 hover:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <FileText className="w-4 h-4" /> Commenti Match
                    </Link>
                    <Link 
                        href="/admin/shop" 
                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors font-bold uppercase tracking-wider text-sm text-gray-300 hover:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <ShoppingBag className="w-4 h-4" /> Shop Drops
                    </Link>
                    <Link 
                        href="/admin/orders" 
                        className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition-colors font-bold uppercase tracking-wider text-sm text-gray-300 hover:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <FileText className="w-4 h-4" /> Ordini
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/50">
                    <form action={signOutAction}>
                        <button className="flex items-center gap-3 w-full px-4 py-3 rounded hover:bg-red-900/20 hover:text-red-400 transition-colors font-bold uppercase tracking-wider text-sm text-gray-400">
                            <LogOut className="w-4 h-4" /> Esci
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
