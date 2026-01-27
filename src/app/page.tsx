import Link from "next/link";
import Image from "next/image";
import { db, News } from "@/lib/db";
import { getLeagueData, NextMatch } from "@/lib/scraper";
import { ArrowRight, MapPin, Calendar, ExternalLink, Camera } from "lucide-react";
import folders from "@/data/gallery-folders.json";

async function getLatestNews(): Promise<News[]> {
  const stmnt = db.prepare("SELECT * FROM news ORDER BY date DESC LIMIT 4");
  return stmnt.all() as News[];
}

import HeroCollage from "@/components/HeroCollage";

// Force dynamic rendering so scraper runs on every request
export const dynamic = 'force-dynamic';

// ... existing imports

export default async function Home() {
  const latestNews = await getLatestNews();
  const { standings, topScorers, nextMatch, matches = [] } = await getLeagueData();

  // Find Galacticos rank
  const teamStats = standings.find((s) => s.team === "GALACTICOS VB");
  const isMatchWeek = !!nextMatch;
  
  // Find ID for next match to link to details
  const nextMatchId = nextMatch && matches.find(m => m.date === nextMatch.date && m.opponent === nextMatch.opponent)?.id;

  return (
    <div className="bg-[#001E45] min-h-screen text-white selection:bg-flyer-cyan selection:text-galacticos-dark">
      
      {/* 
        HERO SECTION - SWAG MODE 
      */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Dynamic Collage Background */}
        <HeroCollage />

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
            
            {/* BRANDING / BIG TITLE */}
            <div className="max-w-6xl animate-fade-in-up flex flex-col items-center">
                <span className="inline-block py-1 px-3 border border-flyer-cyan text-flyer-cyan font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-sm text-sm bg-black/50">
                    Est. 2023 • Bergamo
                </span>
                
                <h1 className="text-6xl md:text-9xl font-black font-anton text-white leading-[0.85] uppercase mb-8 drop-shadow-2xl">
                    <span className="block text-white drop-shadow-md" style={{ WebkitTextStroke: "2px black" }}>Locally Hated</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-flyer-cyan to-flyer-blue drop-shadow-xl filter backdrop-brightness-150">Globally Known</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-200 font-bold max-w-2xl mb-10 border-b-4 border-flyer-cyan pb-4 drop-shadow-md italic uppercase tracking-wider">
                    Non siamo qui per partecipare. <br/>
                    Siamo qui per comandare.
                </p>
                
                <div className="flex flex-wrap gap-6 justify-center">
                    <Link href="/roster" className="group bg-white text-galacticos-dark font-black uppercase px-8 py-4 text-lg hover:bg-flyer-cyan hover:text-white transition-all duration-300 flex items-center gap-3 skew-x-[-10deg] shadow-lg hover:shadow-flyer-cyan/50">
                        <span className="skew-x-[10deg] inline-block">Scopri la Rosa</span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform skew-x-[10deg]" />
                    </Link>

                </div>
            </div>
        </div>


      </section>

      {/* 
        MATCH DAY STRIP 
        Wide strip inspired by the "Flyer" aesthetic (Paper texture, red stamps).
      */}
      {nextMatch && (
        <section className="relative z-20 -mt-20 mx-4 md:mx-auto max-w-7xl">
            <div className="bg-galacticos-blue text-white shadow-2xl rounded-sm overflow-hidden flex flex-col md:flex-row relative border border-white/10">
                 {/* Decorative Red Stamp Line on top */}
                 <div className="absolute top-0 left-0 w-full h-2 bg-flyer-red z-30" />

                 {/* LEFT: Date & Info "Stamp" */}
                 <div className="md:w-1/4 bg-blue-900/50 p-8 flex flex-col justify-center items-center text-center border-r border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/assets/pattern-dots.svg')" }} />
                    <span className="font-anton text-flyer-red text-6xl md:text-7xl leading-none rotate-[-5deg] block mb-2 opacity-90 drop-shadow-md">
                        {nextMatch.date.split('/')[0]}
                    </span>
                    <span className="font-bold uppercase tracking-widest text-blue-200">
                        {(() => {
                            const [day, month, year] = nextMatch.date.split('/').map(Number);
                            const dateObj = new Date(2000 + year, month - 1, day);
                            return dateObj.toLocaleString('it-IT', { month: 'long' });
                        })()}
                    </span>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold bg-white text-galacticos-blue px-3 py-1 rounded-full">
                        <Calendar className="w-3 h-3" />
                        {nextMatch.time}
                    </div>
                 </div>

                 {/* CENTER: Matchup */}
                 <div className="flex-1 p-8 flex items-center justify-between relative">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <div className="text-3xl md:text-5xl font-black font-anton text-white uppercase leading-none mb-2">
                             {nextMatch.isHome ? "GALACTICOS" : nextMatch.opponent}
                        </div>
                        {nextMatch.isHome && <span className="text-xs font-bold text-flyer-cyan uppercase tracking-wider">Home Team</span>}
                    </div>

                    {/* VS */}
                    <div className="px-4">
                        <span className="font-black text-4xl text-blue-300/30 font-anton italic">VS</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                         <div className="text-3xl md:text-5xl font-black font-anton text-white uppercase leading-none mb-2 text-outline-white">
                            {!nextMatch.isHome ? "GALACTICOS" : nextMatch.opponent}
                        </div>
                        {!nextMatch.isHome && <span className="text-xs font-bold text-flyer-cyan uppercase tracking-wider">Away Team</span>}
                    </div>
                 </div>

                 {/* RIGHT: Location & Action */}
                 <Link href={nextMatchId ? `/matches/${nextMatchId}` : "#"} 
                     className="md:w-1/4 bg-flyer-blue text-white p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group cursor-pointer hover:bg-flyer-cyan transition-colors duration-500">
                     <div className="relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase truncate max-w-[150px]">{nextMatch.location}</span>
                        </div>
                        <span className="font-black font-anton text-2xl uppercase tracking-wider border-2 border-white px-4 py-2 inline-block group-hover:bg-white group-hover:text-flyer-blue transition-all">
                            Dettagli
                        </span>
                     </div>
                     {/* Background Pattern */}
                     <div className="absolute inset-0 opacity-20 bg-[url('/assets/hero-bg.jpg')] bg-cover mix-blend-overlay" />
                 </Link>
            </div>
        </section>
      )}



      <section className="relative z-30 py-40 bg-[#001E45] border-t border-white/10">
          <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-4">
                  <h2 className="text-5xl md:text-7xl font-black font-anton uppercase text-white leading-[0.85]">
                      Ultime <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyer-cyan to-flyer-blue">Notizie</span>
                  </h2>
                  <Link href="/news" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                      Tutte le News <ArrowRight className="w-4 h-4" />
                  </Link>
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {latestNews.map((news, i) => (
                      <Link href={`/news/${news.id}`} key={news.id} className="group relative h-[400px] block overflow-hidden border border-white/10 shadow-lg hover:shadow-flyer-cyan/20 transition-all duration-500">
                          <Image
                              src={news.image || "/assets/placeholder.webp"}
                              alt={news.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                          
                          <div className="absolute bottom-0 left-0 p-8 w-full">
                              <span className="inline-block bg-flyer-red text-white text-xs font-bold px-2 py-1 mb-3 uppercase tracking-wider transform -skew-x-12">
                                  News
                              </span>
                              <h3 className="text-2xl font-black font-anton uppercase text-white leading-tight mb-2 group-hover:text-flyer-cyan transition-colors">
                                  {news.title}
                              </h3>
                              <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-medium">
                                  {news.content}
                              </p>
                              <span className="text-xs font-bold uppercase tracking-widest text-flyer-cyan flex items-center gap-2">
                                  Leggi Articolo <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                              </span>
                          </div>
                      </Link>
                  ))}
              </div>
              
              <div className="mt-8 text-center md:hidden">
                    <Link href="/news" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white border-b border-flyer-cyan pb-1">
                      Tutte le News <ArrowRight className="w-4 h-4" />
                  </Link>
              </div>
          </div>
      </section>

      {/* 
        GALLERY SECTION
      */}
      <section className="relative z-30 py-40 bg-[#001E45] border-t border-white/10">
           <div className="container mx-auto px-6 max-w-7xl">
               <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-4">
                   <h2 className="text-5xl md:text-7xl font-black font-anton uppercase text-white leading-[0.85]">
                       Media <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyer-cyan to-flyer-blue">Gallery</span>
                   </h2>
                   <Link href="/gallery" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                       Tutti gli Album <ArrowRight className="w-4 h-4" />
                   </Link>
               </div>


               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {folders
                        .filter(f => f.cover && f.cover.trim() !== "") // Filter out folders without covers
                        .slice(0, 4)
                        .map((folder, index) => { 
                        const folderUrl = `https://drive.predanicola.it/s/i4rkc43fwrMEKB5?dir=${encodeURIComponent("/" + folder.name)}`;

                        return (
                            <a 
                                key={index} 
                                href={folderUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group bg-[#001E45] border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-flyer-cyan/20 transition-all duration-300 flex flex-col"
                            >
                                <div className="h-48 relative items-center justify-center flex overflow-hidden bg-black/50">
                                    <Image 
                                        src={folder.cover as string} 
                                        alt={folder.name} 
                                        fill 
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                </div>
                                <div className="p-4">
                                     <h3 className="text-lg font-black font-anton text-white uppercase mb-1 truncate group-hover:text-flyer-cyan transition-colors">
                                        {folder.name}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        Vedi Foto <ExternalLink className="w-3 h-3" />
                                    </span>
                                </div>
                            </a>
                        )
                   })}
               </div>
               
               <div className="mt-8 text-center md:hidden">
                    <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white border-b border-flyer-cyan pb-1">
                       Tutti gli Album <ArrowRight className="w-4 h-4" />
                   </Link>
               </div>
           </div>
      </section>

      {/* 
        SHOP SECTION 
      */}
      <section className="relative z-30 min-h-[80vh] flex items-center border-t border-white/10 overflow-hidden group">
          {/* Background Image with Parallax-like feel */}
          <div className="absolute inset-0 z-0">
               <Image 
                   src="/assets/DSC08437.webp" 
                   alt="Merch Background" 
                   fill 
                   className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                   priority
               />
               <div className="absolute inset-0 bg-gradient-to-r from-[#001E45] via-[#001E45]/80 to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto px-6 max-w-7xl flex flex-col justify-center items-start h-full">
               <div className="max-w-2xl animate-fade-in-up">
                   <span className="inline-block py-1 px-3 border border-flyer-cyan text-flyer-cyan font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-sm text-sm bg-black/50 transform -skew-x-12">
                       Official Store
                   </span>
                   <h2 className="text-6xl md:text-8xl font-black font-anton text-white leading-[0.85] uppercase mb-8 drop-shadow-2xl">
                       Indossa <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyer-cyan to-flyer-blue">La Maglia</span>
                   </h2>
                   <p className="text-xl text-gray-200 font-bold mb-10 drop-shadow-md max-w-lg">
                       Porta i colori dei Galacticos sempre con te. 
                       Scopri la nuova collezione ufficiale.
                   </p>
                   
                   <Link href="/shop" className="group bg-white text-galacticos-dark font-black uppercase px-10 py-5 text-xl hover:bg-flyer-cyan hover:text-white transition-all duration-300 inline-flex items-center gap-3 skew-x-[-10deg] shadow-2xl hover:shadow-flyer-cyan/50">
                       <span className="skew-x-[10deg] inline-block">Vai allo Shop</span>
                       <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform skew-x-[10deg]" />
                   </Link>
               </div>
          </div>
      </section>

      {/* 
        STANDINGS SECTION 
        Full width section dedicated to standings.
      */}
      <section className="relative z-20 py-40 bg-gradient-to-b from-[#001E45] to-black border-t border-white/5">
         <div className="container mx-auto px-6 max-w-5xl">
             <div className="flex items-end justify-between mb-12">
                  <h2 className="text-5xl md:text-7xl font-black font-anton uppercase text-white leading-[0.85]">
                      La <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyer-cyan to-flyer-blue">Classifica</span>
                  </h2>
                  <div className="text-right">
                      <span className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                          CSI Bergamo
                      </span>
                      <span className="block text-xl font-bold text-flyer-cyan">
                          Girone C
                      </span>
                  </div>
             </div>

             {/* Standings Widget */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/50 text-gray-400 font-bold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Pos</th>
                                <th className="p-4">Team</th>
                                <th className="p-4 text-center">PT</th>
                                <th className="p-4 text-center hidden md:table-cell">PG</th>
                                <th className="p-4 text-center hidden md:table-cell">DR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm font-bold">
                            {standings.map((team, index) => {
                                const isGalacticos = team.team === "GALACTICOS VB";
                                return (
                                    <tr 
                                        key={index} 
                                        className={`
                                            transition-colors duration-300 relative group
                                            ${isGalacticos ? "bg-flyer-blue/20 hover:bg-flyer-blue/30" : "hover:bg-white/5"}
                                        `}
                                    >
                                        <td className="p-4">
                                            <span className={`
                                                flex items-center justify-center w-8 h-8 rounded-full font-black
                                                ${index < 3 ? "bg-flyer-cyan text-black" : "bg-white/10 text-gray-400"}
                                            `}>
                                                {team.rank}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-8 h-8 flex-shrink-0">
                                                    {team.logo ? (
                                                        <Image 
                                                            src={team.logo} 
                                                            alt={team.team} 
                                                            fill 
                                                            className="object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-white/10 rounded-full" />
                                                    )}
                                                </div>
                                                <span className={`${isGalacticos ? "text-flyer-cyan text-lg uppercase tracking-wider" : "text-white"} font-bold`}>
                                                    {team.team}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={`p-4 text-center text-lg ${isGalacticos ? "text-white" : "text-gray-300"}`}>
                                            {team.points}
                                        </td>
                                        <td className="p-4 text-center hidden md:table-cell text-gray-500">
                                            {team.played}
                                        </td>
                                        <td className={`p-4 text-center hidden md:table-cell ${team.dr > 0 ? "text-green-400" : "text-red-400"}`}>
                                            {team.dr > 0 ? `+${team.dr}` : team.dr}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {teamStats && (
                   <div className="mt-4 bg-flyer-blue/20 p-4 rounded-md border border-flyer-blue/30 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="font-black text-xl text-white">#{teamStats.rank}</span>
                            <span className="font-bold text-flyer-cyan uppercase">Galacticos VB</span>
                         </div>
                         <span className="font-black text-lg text-white">{teamStats.points} PT</span>
                   </div>
                )}
            </div>
        </div>
      </section>



    </div>
  );
}
