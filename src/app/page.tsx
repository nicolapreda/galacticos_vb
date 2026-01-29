import Link from "next/link";
import Image from "next/image";
import { db, News } from "@/lib/db";
import { getLeagueData, NextMatch } from "@/lib/scraper";
import { ArrowRight, MapPin, Calendar, ExternalLink, Camera, ChevronRight } from "lucide-react";
import folders from "@/data/gallery-folders.json";
import HeroCollage from "@/components/HeroCollage";
import Countdown from "@/components/Countdown";

// Force dynamic rendering so scraper runs on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  console.log("🏠 [HOMEPAGE] Rendering homepage...");
  // const latestNews = await getLatestNews(); // Deprecated call for now
  console.log("📰 [HOMEPAGE] Fetching league data...");
  const { standings, topScorers, nextMatch, matches = [] } = await getLeagueData();

  // Find Galacticos rank
  const teamStats = standings.find((s) => s.team === "GALACTICOS VB");
  
  // Find ID for next match
  const nextMatchId = nextMatch && matches.find(m => m.date === nextMatch.date && m.opponent === nextMatch.opponent)?.id;

  // Get Latest Matches (played)
  const latestMatches = matches
    .filter(m => m.played)
    .reverse() // Newest first
    .slice(0, 3); // Take top 3

  // Fetch comments for these matches
  const matchIds = latestMatches.map(m => m.id);
  const comments = matchIds.length > 0 ? db.prepare(`SELECT * FROM match_comments WHERE match_id IN (${matchIds.map(() => '?').join(',')})`).all(...matchIds) as { match_id: string, comment: string }[] : [];
  const commentsMap = new Map(comments.map(c => [c.match_id, c.comment]));

  return (
    <div className="bg-[#001E45] min-h-screen text-white selection:bg-flyer-cyan selection:text-galacticos-dark">
      
      {/* 
        HERO SECTION - SWAG MODE + COUNTDOWN
      */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Dynamic Collage Background */}
        <HeroCollage />

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
            
            <div className="max-w-6xl animate-fade-in-up flex flex-col items-center">
                <span className="inline-block py-1 px-3 border border-flyer-cyan text-flyer-cyan font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-sm text-sm bg-black/50">
                    Est. 2023 • Bergamo
                </span>
                
                <h1 className="text-6xl md:text-9xl font-black font-anton text-white leading-tight uppercase mb-8 drop-shadow-2xl">
                    <span className="block text-white drop-shadow-md">Locally Hated</span>
                    <span className="block text-white drop-shadow-xl">Globally Known</span>
                </h1>

                {/* COUNTDOWN OVERLAY */}
                {nextMatch && (
                  <div className="mb-10 w-full max-w-4xl bg-black/40 backdrop-blur-md border-y border-white/10 py-6 px-4 md:px-12 transform -skew-x-12">
                     <div className="skew-x-[12deg]">
                        <p className="text-flyer-cyan uppercase tracking-widest text-sm font-bold mb-4 text-center">
                            Prossimo Match: {nextMatch.opponent}
                        </p>
                        <Countdown targetDate={`${nextMatch.date} ${nextMatch.time}`} />
                     </div>
                  </div>
                )}
                

                
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
        STANDINGS SECTION (MOVED UP)
      */}
      <section className="relative z-20 py-24 bg-gradient-to-b from-[#001E45] to-black border-t border-white/5">
         <div className="container mx-auto px-6 max-w-5xl">
             <div className="flex items-end justify-between mb-8">
                  <h2 className="text-6xl md:text-8xl font-black font-anton uppercase text-white leading-none tracking-wide">
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
                                                        <img 
                                                            src={team.logo} 
                                                            alt={team.team} 
                                                            className="w-full h-full object-contain"
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
            </div>
        </div>
      </section>

      {/* 
        LATEST MATCHES SECTION (REPLACED NEWS)
      */}
      <section className="relative z-30 py-20 bg-[#001E45] border-t border-white/10">
          <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-4">
                  <h2 className="text-6xl md:text-8xl font-black font-anton uppercase text-white leading-none tracking-wide">
                      Ultimi <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyer-cyan to-flyer-blue">Match</span>
                  </h2>
                  <Link href="/matches" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                      Vedi Tutti <ArrowRight className="w-4 h-4" />
                  </Link>
              </div>

              {/* Matches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {latestMatches.length > 0 ? latestMatches.map((match) => {
                       const [homeScore, awayScore] = (match.result || "0-0").split("-").map(s => parseInt(s.trim()));
                       const galacticosScore = match.isHome ? homeScore : awayScore;
                       const opponentScore = match.isHome ? awayScore : homeScore;
                       const isWin = galacticosScore > opponentScore;
                       const isDraw = galacticosScore === opponentScore;

                      return (
                      <Link href={`/matches/${match.id}`} key={match.id} className="group relative block overflow-hidden border border-white/10 shadow-lg hover:shadow-flyer-cyan/20 transition-all duration-500 bg-[#020f21]">
                          <div className="p-8">
                              <span className="inline-block bg-flyer-blue text-white text-xs font-bold px-2 py-1 mb-4 uppercase tracking-wider transform -skew-x-12">
                                  "Campionato"
                              </span>
                              
                              <div className="flex justify-between items-center mb-6">
                                  <div className="text-center">
                                      <span className={`block text-3xl font-black font-anton mb-1 ${match.isHome ? "text-flyer-cyan" : "text-white"}`}>
                                        {homeScore}
                                      </span>
                                      <span className="text-xs font-bold text-gray-500 uppercase">{match.isHome ? "Galacticos" : match.opponent}</span>
                                  </div>
                                  <div className="text-2xl font-black text-white/20">-</div>
                                  <div className="text-center">
                                      <span className={`block text-3xl font-black font-anton mb-1 ${!match.isHome ? "text-flyer-cyan" : "text-white"}`}>
                                        {awayScore}
                                      </span>
                                      <span className="text-xs font-bold text-gray-500 uppercase">{!match.isHome ? "Galacticos" : match.opponent}</span>
                                  </div>
                              </div>

                              <div className="border-t border-white/10 pt-4">
                                  <p className="text-sm text-gray-400 italic mb-4">
                                      "{(() => {
                                          const c = commentsMap.get(match.id) || "Nessun commento disponibile per questa partita.";
                                          return c.length > 150 ? c.substring(0, 150) + "..." : c;
                                      })()}"
                                      <span className="block text-flyer-cyan text-xs font-bold mt-1 not-italic uppercase tracking-wider">- Caballos P</span>
                                  </p>
                                  <span className="text-xs font-bold uppercase tracking-widest text-flyer-cyan flex items-center gap-2 group-hover:gap-4 transition-all">
                                      Match Recap <ArrowRight className="w-3 h-3" />
                                  </span>
                              </div>
                          </div>
                      </Link>
                  )}) : (
                      <div className="col-span-full py-12 text-center text-gray-500 italic">
                          Ancora nessuna partita giocata.
                      </div>
                  )}
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
                   <h2 className="text-7xl md:text-9xl font-black font-anton text-white leading-none uppercase mb-8 drop-shadow-2xl tracking-tighter">
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
        GALLERY SECTION (MOVED TO BOTTOM)
      */}
      <section className="relative z-30 py-20 bg-[#001E45] border-t border-white/10">
           <div className="container mx-auto px-6 max-w-7xl">
               <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
                   <h2 className="text-5xl md:text-7xl font-black font-anton uppercase text-white leading-none tracking-tight">
                       Media <br/> Gallery
                   </h2>
                   <Link href="/gallery" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                       Tutti gli Album <ArrowRight className="w-4 h-4" />
                   </Link>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {folders
                        .filter(f => f.cover && f.cover.trim() !== "")
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
           </div>
      </section>

    </div>
  );
}
