"use client";

import { useActionState } from "react";
import { updateNews } from "@/lib/actions"; // We'll bind the ID
import { Save } from "lucide-react";
import { News } from "@/lib/db";
import Image from "next/image";

export default function EditNewsForm({ news }: { news: News }) {
    const updateNewsWithId = updateNews.bind(null, news.id);
    const [state, formAction] = useActionState(updateNewsWithId, null);

    return (
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
                    defaultValue={news.title}
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
                        defaultValue={news.date}
                        required 
                    />
                </div>

                {/* Category */}
                <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="category">
                        Categoria
                    </label>
                        <select 
                        className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors appearance-none"
                        id="category" 
                        name="category"
                        defaultValue={(news as any).category || "News"}
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
                    defaultValue={news.content}
                    required
                ></textarea>
            </div>

                {/* Image */}
                <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="image">
                    Nuova Immagine (Opzionale)
                </label>
                {news.image && (
                    <div className="relative w-32 h-20 mb-4 rounded overflow-hidden border border-white/10">
                        <Image src={news.image} alt="Current" fill className="object-cover" />
                    </div>
                )}
                <input 
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-flyer-cyan file:text-black hover:file:bg-white"
                    id="image" 
                    name="image" 
                    type="file" 
                    accept="image/*"
                />
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
                <button type="submit" className="bg-flyer-cyan text-black font-black uppercase tracking-widest px-8 py-4 rounded hover:bg-white transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" /> Salva Modifiche
                </button>
            </div>

        </form>
    );
}
