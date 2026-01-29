import { getLeagueData } from "@/lib/scraper";
import { db } from "@/lib/db";
import MatchCommentForm from "./MatchCommentForm";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
    // Fetch League Data
    const { matches } = await getLeagueData();
    const playedMatches = matches.filter(m => m.played).reverse(); // Show most recent first

    // Fetch Comments
    const comments = db.prepare("SELECT * FROM match_comments").all() as { match_id: string, comment: string }[];
    const commentsMap = new Map(comments.map(c => [c.match_id, c.comment]));

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-3xl font-black font-anton uppercase text-white mb-8">Gestione Commenti Match</h1>

            <div className="space-y-6">
                {playedMatches.map((match) => (
                    <div key={match.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold font-anton uppercase text-white mb-1">
                                    {match.isHome ? "GALACTICOS VB" : match.opponent} vs {match.isHome ? match.opponent : "GALACTICOS VB"}
                                </h3>
                                <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">
                                    {match.date} - {match.result || "N/D"}
                                </p>
                            </div>
                            <span className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">
                                ID: {match.id}
                            </span>
                        </div>

                        <MatchCommentForm 
                            matchId={match.id} 
                            initialComment={commentsMap.get(match.id) || ""} 
                        />
                    </div>
                ))}

                {playedMatches.length === 0 && (
                    <p className="text-gray-400 text-center py-12">Nessuna partita giocata trovata.</p>
                )}
            </div>
        </div>
    );
}
