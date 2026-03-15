import { getLeagueData, CalendarMatch } from "@/lib/scraper";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

// Force dynamic rendering so scraper runs on every request
export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const { matches } = await getLeagueData();

  // Separate matches - Only played ones
  const playedMatches = matches.filter((m) => m.played).reverse(); // Most recent first

  return (
    <div className="min-h-screen bg-galacticos-dark text-white selection:bg-flyer-cyan selection:text-galacticos-dark pb-20">
        
        {/* HEADER */}
        <div className="relative py-24 px-6 overflow-hidden">
             <div className="absolute inset-0 z-0">
                 <Image 
                    src="/assets/DSC08466.webp" 
                    alt="Background" 
                    fill 
                    className="object-cover opacity-20"
                />
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-galacticos-dark/90 to-galacticos-dark" />
             </div>

             <div className="relative z-10 container mx-auto max-w-5xl">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Torna alla Home
                </Link>
                <h1 className="text-7xl md:text-9xl font-black font-anton uppercase text-white leading-none mb-4 tracking-wide">
                    Ultimi <br/> <span className="text-flyer-cyan">Match</span>
                </h1>
             </div>
        </div>

        <div className="container mx-auto px-6 max-w-5xl relative z-20">
            
             {/* PLAYED MATCHES */}
             <section id="latest-matches">
                <div className="flex items-center gap-4 mb-8">
                     <h2 className="text-4xl md:text-6xl font-black font-anton uppercase text-white tracking-wide">Risultati Stagione</h2>
                     <div className="h-[2px] flex-1 bg-white/10" />
                </div>

                <div className="flex flex-col gap-4">
                    {playedMatches.length > 0 ? playedMatches.map((match) => {
                        // Determine Outcome
                        const [homeScore, awayScore] = (match.result || "0-0").split("-").map(s => parseInt(s.trim()));
                        const galacticosScore = match.isHome ? homeScore : awayScore;
                        const opponentScore = match.isHome ? awayScore : homeScore;
                        
                        let outcomeColor = ""; 
                        let outcomeBorder = "";
                        
                        if (galacticosScore > opponentScore) {
                            outcomeColor = "bg-green-600";
                            outcomeBorder = "border-green-600/50";
                        } else if (galacticosScore < opponentScore) {
                            outcomeColor = "bg-[#ff0000]"; // Explicit Red
                            outcomeBorder = "border-[#ff0000]/50";
                        } else {
                            // Draw - Yellow
                            outcomeColor = "bg-galacticos-accent";
                            outcomeBorder = "border-galacticos-accent/50";
                        }

                        return (
                            <Link href={`/matches/${match.id}`} key={match.id} className={`group relative bg-black/40 border ${outcomeBorder} p-0 rounded-sm hover:border-white/30 transition-all flex flex-col md:flex-row items-stretch overflow-hidden`}>
                                
                                {/* Outcome Indicator Strip */}
                                <div className={`h-1 md:h-auto md:w-2 ${outcomeColor} absolute top-0 left-0 right-0 md:right-auto md:bottom-0 z-10`} />

                                <div className="flex flex-col md:flex-row items-center w-full p-4 md:p-6 pl-4 md:pl-8 gap-4 md:gap-0">
                                    {/* Date */}
                                    <div className="md:w-32 flex-shrink-0 text-center md:text-left">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{match.date}</span>
                                    </div>

                                    {/* Teams & Score Grid */}
                                    <div className="flex-1 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8 w-full md:w-auto">
                                        
                                        {/* Galacticos VB - Always Left */}
                                        <div className="text-center md:text-right w-full">
                                            <span className="block font-black text-base md:text-2xl uppercase text-flyer-cyan break-words">
                                                GALACTICOS VB
                                            </span>
                                        </div>

                                        {/* Score Badge - swapped for away matches so Galacticos score is always first */}
                                        <div className="bg-white/10 px-3 py-1 md:px-4 md:py-2 rounded text-xl md:text-2xl font-black font-anton text-white tracking-widest shadow-lg min-w-[80px] text-center">
                                            {match.isHome
                                                ? match.result
                                                : match.result?.split("-").reverse().join("-")}
                                        </div>

                                        {/* Opponent - Always Right */}
                                        <div className="text-center md:text-left w-full">
                                            <span className="block font-black text-base md:text-2xl uppercase text-white break-words">
                                                {match.opponent}
                                            </span>
                                        </div>
                                    </div>

                                     {/* Action */}
                                     <div className="md:w-32 flex-shrink-0 flex justify-end">
                                         <span className="text-xs font-bold uppercase tracking-widest text-flyer-cyan group-hover:underline underline-offset-4 decoration-flyer-cyan transition-all">
                                             Dettagli
                                         </span>
                                     </div>
                                </div>
                            </Link>
                        );
                    }) : (
                        <p className="text-gray-500 italic">Nessuna partita giocata.</p>
                    )}
                </div>
            </section>
        </div>
    </div>
  );
}
