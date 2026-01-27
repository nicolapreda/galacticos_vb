import { db, News } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditNewsForm from "./form"; // We'll extract the form to a client component

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const news = db.prepare("SELECT * FROM news WHERE id = ?").get(id) as News | undefined;

    if (!news) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/news" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-black font-anton uppercase text-white">Modifica Notizia</h1>
            </div>

            <EditNewsForm news={news} />
        </div>
    );
}
