import Link from "next/link";
import { db, News } from "@/lib/db";
import { deleteNews } from "@/lib/actions";
import { Plus, Trash2, Edit } from "lucide-react";
import Image from "next/image";

async function getNews() {
    const news = db.prepare("SELECT * FROM news ORDER BY date DESC").all() as News[];
    return news;
}

export default async function AdminNewsPage() {
    const newsList = await getNews();

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black font-anton uppercase text-white">Gestione Notizie</h1>
                <Link href="/admin/news/new" className="bg-flyer-cyan text-black font-black uppercase tracking-widest px-4 py-2 rounded flex items-center gap-2 hover:bg-white transition-colors">
                    <Plus className="w-4 h-4" /> Nuova Notizia
                </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/50 uppercase text-xs font-bold text-gray-400 tracking-wider">
                        <tr>
                            <th className="p-4">Copertina</th>
                            <th className="p-4">Titolo</th>
                            <th className="p-4">Data</th>
                            <th className="p-4 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {newsList.map((news) => (
                            <tr key={news.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 w-24">
                                    <div className="relative w-16 h-10 bg-black/50 rounded overflow-hidden">
                                        <Image src={news.image || "/assets/placeholder.jpg"} alt={news.title} fill className="object-cover" />
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-white">{news.title}</td>
                                <td className="p-4 text-gray-400 text-sm">{news.date}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/news/${news.id}`} className="p-2 hover:bg-white/10 rounded text-blue-400 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        
                                        <form action={deleteNews.bind(null, news.id)}>
                                            <button className="p-2 hover:bg-red-900/30 rounded text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {newsList.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                                    Nessuna notizia trovata. Inizia a scriverne una!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
