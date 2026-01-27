import Link from "next/link";
import Image from "next/image";
import { db, News } from "@/lib/db";

async function getAllNews(): Promise<News[]> {
  const stmnt = db.prepare("SELECT * FROM news ORDER BY date DESC");
  return stmnt.all() as News[];
}

export default async function NewsPage() {
  const news = await getAllNews();

  return (
    <div className="bg-galacticos-dark min-h-screen pb-20 text-white">
      {/* Header */}
      <header className="bg-galacticos-dark text-white pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-4 font-anton uppercase">
            News
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Tutte le novità dal mondo Galacticos.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.length > 0 ? (
            news.map((item) => (
              <article key={item.id} className="group cursor-pointer flex flex-col h-full bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-800 mb-4 group-hover:opacity-90 transition-all">
                  <Image
                    src={item.image || "/assets/news-placeholder.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover transform group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute top-0 left-0 bg-flyer-cyan text-galacticos-dark font-bold text-xs px-3 py-1 uppercase">
                    News
                  </div>
                </div>
                <div className="p-6 pt-0 flex-1 flex flex-col">
                    <div className="text-flyer-cyan px-1 text-xs font-bold mb-2 uppercase tracking-wider">
                    {new Date(item.date).toLocaleDateString()}
                    </div>
                    <h3 className="text-2xl font-black leading-tight text-white group-hover:text-flyer-cyan transition-colors font-anton uppercase">
                    <Link href={`/news/${item.id}`}>{item.title}</Link>
                    </h3>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Nessuna notizia disponibile.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
