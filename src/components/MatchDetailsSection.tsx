"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MatchEvent {
    time: string;
    type: "goal" | "yellow-card" | "red-card" | "sub" | "other";
    player: string;
    team: "home" | "away";
    score?: string;
}

interface MatchDetails {
    scorers: string[];
    events?: MatchEvent[];
}

interface PreMatchStats {
    galacticos: {
        rank: number;
        points: number;
        dr: number;
        played: number;
    };
    opponent: {
        name: string;
        rank: number;
        points: number;
        dr: number;
        played: number;
    } | null;
    winProbability: number;
    analysisText: string;
    galacticosScorers: { player: string; goals: number }[];
    opponentScorers: { player: string; goals: number }[];
}

interface MatchDetailsSectionProps {
    url: string;
    isPlayed: boolean;
    albumName: string | null;
    albumCover: string | undefined;
    albumImages?: string[];
    preMatchStats?: PreMatchStats | null;
}

export default function MatchDetailsSection({ url, isPlayed, albumName, albumCover, albumImages = [], preMatchStats }: MatchDetailsSectionProps) {
    const [details, setDetails] = useState<MatchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!url || !isPlayed) {
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/match-details?url=${encodeURIComponent(url)}`);
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setDetails(data);
            } catch (e) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [url, isPlayed]);

    if (!isPlayed) {
         if (preMatchStats) {
             const { galacticos, opponent, winProbability, analysisText, galacticosScorers, opponentScorers } = preMatchStats;
             
             return (
                 <div className="space-y-8 animate-fade-in text-center">
                     <h4 className="text-xl font-bold uppercase text-white mb-6 border-b border-white/10 pb-4 inline-block">
                        Analisi Pre-Partita
                     </h4>
                     
                     {/* ANALYSIS TEXT */}
                     <div className="bg-white/5 p-6 rounded-lg border border-white/10 mb-8 max-w-2xl mx-auto shadow-lg">
                        <p className="text-gray-300 italic text-lg leading-relaxed">
                            "{analysisText}"
                        </p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                         
                         {/* WIN PROBABILITY */}
                         <div className="bg-black/40 p-6 rounded-lg border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-br from-flyer-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                             <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Probabilità Vittoria Galacticos</h5>
                             <div className="text-5xl font-black font-anton text-flyer-cyan mb-2">
                                 {winProbability}%
                             </div>
                             <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
                                 <div className="bg-flyer-cyan h-full transition-all duration-1000" style={{ width: `${winProbability}%` }} />
                             </div>
                         </div>

                         {/* STATS COMPARISON */}
                         <div className="bg-black/40 p-6 rounded-lg border border-white/5 flex flex-col justify-center text-sm">
                             <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 text-center">Confronto Classifica</h5>
                             
                             <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="font-bold text-flyer-cyan">GALACTICOS</span>
                                    <span className="text-xs text-gray-500 uppercase">Team</span>
                                    <span className="font-bold text-white uppercase truncate max-w-[100px]">{opponent?.name || "Avversario"}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="font-mono font-bold text-lg">{galacticos.points}</span>
                                    <span className="text-xs text-gray-500 uppercase">Punti</span>
                                    <span className="font-mono font-bold text-lg text-gray-300">{opponent?.points ?? "-"}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="font-mono font-bold text-lg">#{galacticos.rank}</span>
                                    <span className="text-xs text-gray-500 uppercase">Posizione</span>
                                    <span className="font-mono font-bold text-lg text-gray-300">#{opponent?.rank ?? "-"}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className={`font-mono font-bold text-lg ${galacticos.dr > 0 ? "text-green-400" : "text-red-400"}`}>
                                        {galacticos.dr > 0 ? "+" : ""}{galacticos.dr}
                                    </span>
                                    <span className="text-xs text-gray-500 uppercase">Diff. Reti</span>
                                    <span className={`font-mono font-bold text-lg ${opponent && opponent.dr > 0 ? "text-green-400" : "text-red-400"}`}>
                                        {opponent ? (opponent.dr > 0 ? "+" : "") + opponent.dr : "-"}
                                    </span>
                                </div>
                             </div>
                         </div>
                     </div>
                     
                     {/* TOP SCORERS COMPARISON */}
                     {(galacticosScorers.length > 0 || opponentScorers.length > 0) && (
                         <div className="mt-8 max-w-4xl mx-auto">
                              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 text-center">Occhi Puntati Su (Top Marcatori)</h5>
                              <div className="grid grid-cols-2 gap-8">
                                  {/* Galacticos Scorers */}
                                  <div className="bg-black/20 p-4 rounded border border-white/5">
                                      <h6 className="text-flyer-cyan font-bold uppercase mb-4 text-sm border-b border-flyer-cyan/20 pb-2">Galacticos</h6>
                                      {galacticosScorers.length > 0 ? (
                                        <ul className="space-y-2">
                                            {galacticosScorers.map((s, i) => (
                                                <li key={i} className="flex justify-between items-center text-sm">
                                                    <span className="text-white font-medium truncate pr-2">{s.player}</span>
                                                    <span className="bg-flyer-blue/20 text-flyer-cyan font-mono font-bold px-2 py-0.5 rounded text-xs">{s.goals} ⚽️</span>
                                                </li>
                                            ))}
                                        </ul>
                                      ) : <p className="text-gray-500 text-xs italic">Nessun marcatore in Top 50</p>}
                                  </div>

                                  {/* Opponent Scorers */}
                                  <div className="bg-black/20 p-4 rounded border border-white/5">
                                      <h6 className="text-white font-bold uppercase mb-4 text-sm border-b border-white/10 pb-2">{opponent?.name || "Avversari"}</h6>
                                      {opponentScorers.length > 0 ? (
                                        <ul className="space-y-2">
                                            {opponentScorers.map((s, i) => (
                                                <li key={i} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-300 font-medium truncate pr-2">{s.player}</span>
                                                    <span className="bg-white/10 text-white font-mono font-bold px-2 py-0.5 rounded text-xs">{s.goals} ⚽️</span>
                                                </li>
                                            ))}
                                        </ul>
                                      ) : <p className="text-gray-500 text-xs italic">Nessun marcatore in Top 50</p>}
                                  </div>
                              </div>
                         </div>
                     )}
                 </div>
             );
         }

         return (
             <div className="space-y-6">
                <div className="text-center py-12">
                     <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                         <span className="text-3xl">⚽️</span>
                     </div>
                     <h4 className="text-xl font-bold uppercase mb-2">Partita non ancora giocata</h4>
                     <p className="text-gray-400 mb-6">Le statistiche saranno disponibili dopo il fischio finale.</p>
                 </div>
             </div>
         );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* CSI Link (Always visible) */}
             <div className="bg-flyer-blue/20 p-4 rounded border border-flyer-blue/30 flex items-center justify-between">
                 <div>
                     <h4 className="font-bold uppercase text-flyer-cyan mb-1">Dati Ufficiali CSI</h4>
                     <p className="text-sm text-gray-400">Consulta il referto ufficiale.</p>
                 </div>
                 <a href={url} target="_blank" className="bg-white text-black font-bold uppercase text-xs px-4 py-2 rounded hover:bg-flyer-cyan transition-colors">
                     Apri su CSI
                 </a>
             </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-flyer-cyan" />
                    <p className="text-xs uppercase tracking-widest font-bold">Caricamento statistiche...</p>
                </div>
            )}

            {/* Error or No Data */}
            {!loading && !details && !error && (
                <p className="text-center text-gray-500 italic">Nessun dettaglio extra disponibile.</p>
            )}


            {/* Details Content */}
            {!loading && details && (
                <div className="space-y-8 animate-fade-in-up">
                     
                     {/* TIMELINE */}
                     {details.events && details.events.length > 0 ? (
                         <div>
                             <h4 className="font-bold text-gray-400 uppercase text-sm mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                 Cronaca Partita
                             </h4>
                             <div className="relative border-l border-white/10 ml-3 md:ml-6 pl-6 space-y-6">
                                 {details.events.map((event, i) => (
                                     <div key={i} className={`relative flex items-center justify-between group ${event.team === 'home' ? 'flex-row' : 'flex-row-reverse text-right'}`}>
                                         {/* Dot on line */}
                                         <div className="absolute -left-[31px] md:-left-[30px] w-4 h-4 rounded-full bg-galacticos-dark border-2 border-white/30 group-hover:border-flyer-cyan group-hover:scale-110 transition-all z-10"></div>
                                         
                                         <div className={`flex flex-col ${event.team === 'home' ? 'items-start' : 'items-end'} w-full`}>
                                             <div className="flex items-center gap-2 mb-1">
                                                 <span className="font-mono text-xs text-flyer-cyan font-bold p-1 bg-flyer-blue/20 rounded">{event.time}</span>
                                                 {event.type === 'goal' && <span className="text-xl">⚽️</span>}
                                                 {event.type === 'yellow-card' && <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-sm" title="Ammonizione"></div>}
                                                 {event.type === 'red-card' && <div className="w-3 h-4 bg-red-600 rounded-sm shadow-sm" title="Espulsione"></div>}
                                             </div>
                                             
                                             <div className="flex items-center gap-2">
                                                 <span className={`font-bold text-white ${event.team === 'home' ? 'text-lg' : 'text-base opacity-90'}`}>
                                                     {event.player}
                                                 </span>
                                                 {event.score && (
                                                     <span className="text-xs font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full ml-2">
                                                         {event.score}
                                                     </span>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ) : (
                        /* Fallback to simple scorer list if no timeline events found */
                        details.scorers && details.scorers.length > 0 && (
                            <div>
                                <h4 className="font-bold text-gray-400 uppercase text-sm mb-3 border-b border-white/10 pb-2">Marcatori</h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {details.scorers.map((scorer, i) => (
                                        <li key={i} className="flex items-center gap-2 bg-white/5 p-3 rounded border border-white/5 hover:border-flyer-cyan/30 transition-colors">
                                            <div className="w-6 h-6 bg-galacticos-accent text-black font-bold rounded-full flex items-center justify-center text-xs shadow-glow">⚽️</div>
                                            <span className="font-bold text-white">{scorer}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                     )}
                </div>
            )}


             {/* GALLERY LINK & GRID */}
             {albumName && (
                 <div className="mt-8 pt-8 border-t border-white/10">
                     <h4 className="font-bold text-gray-400 uppercase text-sm mb-6 flex items-center gap-2">
                        <span className="text-xl">📸</span> Galleria Fotografica
                     </h4>
                     
                     {/* Full Grid if images exist */}
                     {albumImages.length > 0 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {albumImages.slice(0, 4).map((img, i) => (
                                    <div key={i} className="relative aspect-video group overflow-hidden rounded bg-white/5">
                                        <Image
                                            src={img}
                                            alt={`Foto match ${i + 1}`}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                            unoptimized
                                        />
                                        <a 
                                            href={img} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-6">
                               <a 
                                    href={`https://drive.predanicola.it/s/i4rkc43fwrMEKB5?dir=${encodeURIComponent("/" + albumName)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-flyer-cyan text-galacticos-dark px-6 py-3 rounded font-black uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg shadow-flyer-cyan/20"
                                >
                                    Vedi Tutte le Foto <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </a>
                            </div>
                        </div>
                     ) : (
                         /* Fallback to single cover link */
                         <Link 
                            href={`/gallery?dir=${encodeURIComponent(albumName)}`} 
                            className="group relative h-48 w-full block overflow-hidden rounded-lg border border-white/20"
                        >
                            <Image 
                                src={albumCover || "/assets/placeholder.webp"} 
                                alt={albumName}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <div className="text-center transform group-hover:-translate-y-1 transition-transform">
                                    <span className="block text-4xl mb-2">📸</span>
                                    <span className="font-black font-anton uppercase text-2xl text-white">Guarda le Foto</span>
                                </div>
                            </div>
                         </Link>
                     )}
                 </div>
             )}
        </div>
    );
}
