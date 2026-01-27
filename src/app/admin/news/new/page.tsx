"use client";

import { useActionState } from "react";
import { createNews } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewNewsPage() {
    const [state, formAction] = useActionState(createNews, null);
    
    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/news" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-black font-anton uppercase text-white">Nuova Notizia</h1>
            </div>

            <form action={formAction} className="bg-white/5 border border-white/10 rounded p-8 space-y-6">
                
                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="title">
                        Titolo
                    </label>
                    <input 
                        className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors font-bold text-lg"
                        id="title" 
                        name="title" 
                        type="text" 
                        placeholder="ES: GRANDE VITTORIA PER I GALACTICOS" 
                        required 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="date">
                            Data
                        </label>
                        <input 
                            className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors"
                            id="date" 
                            name="date" 
                            type="date" 
                            required 
                        />
                    </div>

                    {/* Category (Optional) */}
                    <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="category">
                            Categoria
                        </label>
                         <select 
                            className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors appearance-none"
                            id="category" 
                            name="category"
                        >
                            <option value="News">News</option>
                            <option value="Partita">Partita</option>
                            <option value="Comunicato">Comunicato</option>
                            <option value="Evento">Evento</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="content">
                        Contenuto
                    </label>
                    <textarea 
                        className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors h-40"
                        id="content" 
                        name="content" 
                        placeholder="Scrivi qui il testo dell'articolo..." 
                        required
                    ></textarea>
                </div>

                 {/* Image */}
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="image">
                        Immagine di Copertina
                    </label>
                    <input 
                        className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-flyer-cyan file:text-black hover:file:bg-white"
                        id="image" 
                        name="image" 
                        type="file" 
                        accept="image/*"
                    />
                    <p className="text-xs text-gray-500 mt-2">Formati supportati: JPG, PNG, WEBP.</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button type="submit" className="bg-flyer-cyan text-black font-black uppercase tracking-widest px-8 py-4 rounded hover:bg-white transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" /> Pubblica Notizia
                    </button>
                </div>

            </form>
        </div>
    );
}
