import Link from "next/link";
import Image from "next/image";
import { db, News } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Comment {
  id: number;
  news_id: number;
  author: string;
  content: string;
  date: string;
}

async function getNews(id: string): Promise<News | undefined> {
  const stmnt = db.prepare("SELECT * FROM news WHERE id = ?");
  return stmnt.get(id) as News | undefined;
}

async function getComments(newsId: string): Promise<Comment[]> {
  const stmnt = db.prepare("SELECT * FROM comments WHERE news_id = ? ORDER BY date DESC");
  return stmnt.all(newsId) as Comment[];
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getNews(id);

  if (!article) {
    notFound();
  }

  const comments = await getComments(id);

  return (
    <div className="bg-galacticos-dark min-h-screen pb-20 text-white">
      {/* PADDING FOR FIXED NAVBAR */}
      <div className="h-[120px] bg-galacticos-dark"></div>

      <article className="max-w-4xl mx-auto px-6">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-flyer-cyan font-bold uppercase tracking-wider text-sm mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Torna alle news
        </Link>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 font-anton uppercase leading-none">
          {article.title}
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 border-b border-white/10 pb-8">
          <span className="font-bold text-galacticos-dark bg-flyer-cyan px-2 py-1 uppercase">
            News
          </span>
          <span>{new Date(article.date).toLocaleDateString()}</span>
        </div>

        {article.image && (
          <div className="relative w-full aspect-video mb-12 rounded-lg overflow-hidden shadow-lg border border-white/10">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose pro max-w-none text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </article>

      {/* Comments Section */}
      <section className="max-w-4xl mx-auto px-6 mt-20 pt-12 border-t border-white/10">
        <h3 className="text-3xl font-black text-white mb-8 font-anton uppercase">
          Commenti ({comments.length})
        </h3>

        <div className="space-y-8">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white">{comment.author}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Nessun commento presente.</p>
          )}
        </div>
      </section>
    </div>
  );
}
