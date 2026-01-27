import { getLeagueData, CalendarMatch } from "@/lib/scraper";
import MatchDetailsSection from "@/components/MatchDetailsSection";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Clock, Trophy } from "lucide-react";
import fs from 'fs';
import path from 'path';

// Force dynamic rendering so scraper runs on every request
export const dynamic = 'force-dynamic'; 

function findGalleryAlbum(match: CalendarMatch) {
    // Read fresh data from the filesystem
    // This allows the page to pick up changes made by the sync script immediately without rebuild
    const filePath = path.join(process.cwd(), 'src/data/gallery-folders.json');
    let galleryFolders = [];
    
    try {
        if (fs.existsSync(filePath)) {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            galleryFolders = JSON.parse(fileContents);
        }
    } catch (error) {
        console.error("Error reading gallery-folders.json:", error);
        return null;
    }

    // Basic fuzzy matching
    // galleryFolders has "name" and "cover"
    // We try to match date
    // format in folders: "D.MM" or "DD.MM" (e.g. "1.10" or "11.10")
    
    // Normalize match values from DD/MM/YY
    const matchDateVals = match.date.split("/"); // [0] = DD, [1] = MM
    const day = matchDateVals[0];
    const month = matchDateVals[1];

    // Remove leading zero from day for comparison (e.g. "04" -> "4")
    const dayNoZero = day.startsWith("0") ? day.substring(1) : day;
    
    // Check for match in album names
    // We check both "DD.MM" and "D.MM"
    const album = galleryFolders.find((f: any) => {
        // e.g. "04.10"
        const paddedPattern = `${day}.${month}`; 
        // e.g. "4.10"
        const unpaddedPattern = `${dayNoZero}.${month}`;

        return f.name.startsWith(paddedPattern) || f.name.startsWith(unpaddedPattern);
    });
    
    return album || null;
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { matches } = await getLeagueData();
  const match = matches.find((m) => m.id === id);

  if (!match) {
    notFound();
  }

  const isPlayed = match.played;
  // If provided, fetch deeper stats

  const album = findGalleryAlbum(match);

  // Background Image (Random or based on status)
  const bgImage = isPlayed ? "/assets/DSC08466.webp" : "/assets/DSC08437.webp";

  // Calculate Pre-Match Stats if not played
  let preMatchStats = null;
  if (!isPlayed && matches.length > 0) {
      const { standings, topScorers } = await getLeagueData();
      
      const galacticos = standings.find(t => t.team.toUpperCase().includes("GALACTICOS"));
      // Fuzzy find opponent
      const opponent = standings.find(t => t.team.toUpperCase().includes(match.opponent.toUpperCase()) || match.opponent.toUpperCase().includes(t.team.toUpperCase()));

      // Get Scorers
      const galacticosScorers = topScorers
          .filter(s => s.team.toUpperCase().includes("GALACTICOS"))
          .slice(0, 5); // Take top 5
      
      const opponentScorers = topScorers
          .filter(s => s.team.toUpperCase().includes(match.opponent.toUpperCase()) || (opponent && s.team.toUpperCase().includes(opponent.team.toUpperCase())))
          .slice(0, 5);

      if (galacticos) {
          const gPoints = galacticos.points;
          const oPoints = opponent?.points || 0; // Default to 0 if not found (new team?)
          
          let probability = 50;
          
          // Points factor
          if (oPoints > 0) {
              const totalPoints = gPoints + oPoints;
              probability = (gPoints / totalPoints) * 100;
          } else {
              probability = 60; // Conservative baseline
          }

          // Rank adjustment (Lower rank is better)
          if (opponent) {
             const rankDiff = opponent.rank - galacticos.rank; // Pos if we are better (e.g. 10 - 3 = 7)
             probability += rankDiff * 1.5;
          }

          // Home advantage
          if (match.isHome) probability += 5;

          // Cap at 5 - 95
          probability = Math.min(Math.max(Math.round(probability), 10), 90);

          // Generate "Less Jinx" Text - Focus on context and keys
          let text = "";
          if (opponent) {
              text = `Sfida in programma contro ${opponent.team}. I Galacticos (${galacticos.rank}° posto, ${galacticos.points} pt) affrontano una squadra attualmente in ${opponent.rank}° posizione (${opponent.points} pt). `;
              
              if (Math.abs(galacticos.rank - opponent.rank) <= 3) {
                  text += "Si prospetta un match equilibrato e combattuto: due squadre vicine in classifica che cercheranno di superarsi.";
              } else if (galacticos.rank < opponent.rank) {
                  text += "Un'occasione importante per consolidare la posizione in classifica, ma attenzione a non sottovalutare l'impegno.";
              } else {
                  text += "Una sfida che richiede la massima concentrazione per scalare posizioni e dimostrare il valore della rosa.";
              }

              // Attack vs Defense analysis
              const gGoalAvg = galacticos.gf / (galacticos.played || 1);
              const oGoalAvg = opponent.gf / (opponent.played || 1);

              if (gGoalAvg > 2.5) {
                  text += " L'attacco dei Galacticos sta girando bene, sarà fondamentale concretizzare le occasioni.";
              } else if (galacticos.gs < galacticos.played) {
                   text += " La solidità difensiva mostrata finora sarà la chiave per portare a casa il risultato.";
              }
              
              if (oGoalAvg > 2.5) {
                  text += ` Attenzione al potenziale offensivo degli avversari (${opponent.gf} gol fatti), servirà una prova difensiva attenta.`;
              }
          } else {
              text = "I Galacticos scendono in campo pronti a dare battaglia. Una partita da affrontare con il giusto mix di grinta e concentrazione tattica.";
          }

          preMatchStats = {
              galacticos: {
                  rank: galacticos.rank,
                  points: galacticos.points,
                  dr: galacticos.dr,
                  played: galacticos.played
              },
              opponent: opponent ? {
                  name: opponent.team,
                  rank: opponent.rank,
                  points: opponent.points,
                  dr: opponent.dr,
                  played: opponent.played
              } : null,
              winProbability: probability,
              analysisText: text,
              galacticosScorers: galacticosScorers.map(s => ({ player: s.player, goals: s.goals })),
              opponentScorers: opponentScorers.map(s => ({ player: s.player, goals: s.goals }))
          };
      }
  }

  return (
    <div className="min-h-screen bg-galacticos-dark text-white font-sans selection:bg-flyer-cyan selection:text-galacticos-dark pb-20">
      
      {/* HEADER / HERO */}
      <div className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 z-0">
             <Image 
                src={bgImage} 
                alt="Match Background" 
                fill 
                className="object-cover opacity-30" 
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-galacticos-dark/80 to-galacticos-dark" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 container mx-auto px-6 text-center animate-fade-in-up">
            <Link href="/" className="absolute top-8 left-6 md:left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Torna alla Home
            </Link>

            <div className="mb-6 flex flex-col items-center gap-2">
                 <span className="bg-flyer-red text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-lg transform -skew-x-12">
                     {isPlayed ? "Risultato Finale" : "Prossimo Match"}
                 </span>
                 <div className="text-gray-300 font-bold uppercase tracking-widest flex items-center gap-2 text-sm mt-2">
                     <Calendar className="w-4 h-4 text-flyer-cyan" /> {match.date}
                     <span className="mx-2">•</span>
                     <Clock className="w-4 h-4 text-flyer-cyan" /> {match.time}
                 </div>
            </div>

            {/* SCOREBOARD */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                {/* TEAM 1 */}
                <div className={`text-center flex-1 ${match.isHome ? "order-1" : "order-3"}`}>
                    <h2 className="text-3xl md:text-5xl font-black font-anton uppercase text-white drop-shadow-xl">
                        {match.isHome ? "GALACTICOS" : match.opponent}
                    </h2>
                </div>

                {/* VS / RESULT */}
                <div className="order-2 flex flex-col items-center p-8 relative">
                    {isPlayed && match.result ? (
                        <div className="text-7xl md:text-9xl font-black font-anton text-white leading-none tracking-tighter drop-shadow-2xl flex items-center gap-4">
                            <span>{match.result.split("-")[0].trim()}</span>
                            <span className="text-flyer-cyan opacity-50">-</span>
                            <span>{match.result.split("-")[1].trim()}</span>
                        </div>
                    ) : (
                        <div className="text-6xl md:text-8xl font-black font-anton text-white/20 italic">VS</div>
                    )}
                </div>

                {/* TEAM 2 */}
                <div className={`text-center flex-1 ${match.isHome ? "order-3" : "order-1"}`}>
                    <h2 className="text-3xl md:text-5xl font-black font-anton uppercase text-white drop-shadow-xl text-outline-white">
                         {!match.isHome ? "GALACTICOS" : match.opponent}
                    </h2>
                </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-gray-300">
                <MapPin className="w-5 h-5 text-flyer-red" />
                <span className="font-bold uppercase tracking-wider">{match.location}</span>
            </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="container mx-auto px-6 max-w-4xl -mt-20 relative z-20">
            
            {/* MATCH STATS / DETAILS */}
            <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-sm shadow-2xl">
                 <h3 className="text-2xl font-black font-anton uppercase mb-6 border-b border-white/10 pb-4">
                     Match Breakdown
                 </h3>
                 
                 <MatchDetailsSection 
                    url={match.csiUrl} 
                    isPlayed={isPlayed} 
                    albumName={album?.name ?? null}
                    albumCover={album?.cover || undefined}
                    albumImages={album?.images || []}
                    preMatchStats={preMatchStats}
                />
            </div>
      </div>

    </div>
  );
}
