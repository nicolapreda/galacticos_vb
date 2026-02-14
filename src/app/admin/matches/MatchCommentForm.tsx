"use client";

import { useActionState } from "react";
import { saveMatchComment } from "@/lib/actions";
import { Save } from "lucide-react";
import { clsx } from "clsx";

interface MatchCommentFormProps {
    matchId: string;
    initialComment: string;
    initialCoverImage?: string | null;
}

export default function MatchCommentForm({ matchId, initialComment, initialCoverImage }: MatchCommentFormProps) {
    const [state, formAction, isPending] = useActionState(saveMatchComment, null);

    const handleFormAction = (formData: FormData) => {
        console.log('[MatchCommentForm] Form submitted!');
        console.log('[MatchCommentForm] Match ID:', formData.get('match_id'));
        console.log('[MatchCommentForm] Comment:', formData.get('comment'));
        console.log('[MatchCommentForm] Calling server action...');
        formAction(formData);
    };

    return (
        <form action={handleFormAction} className="mt-4 space-y-4">
            <input type="hidden" name="match_id" value={matchId} />
            
            {/* Cover Image URL Input */}
            <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Cover Image URL (Opzionale)</label>
                <input 
                    type="text" 
                    name="cover_image" 
                    defaultValue={initialCoverImage || ""}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm focus:outline-none focus:border-flyer-cyan transition-colors"
                />
                <p className="text-[10px] text-gray-500 mt-1">Lascia vuoto per usare l'immagine di default.</p>
            </div>

            <div className="relative">
                <textarea
                    name="comment"
                    defaultValue={initialComment}
                    placeholder="Scrivi qui il commento di Bortolo... (Lasciare vuoto per nessun commento)"
                    className={clsx(
                        "w-full bg-black/30 border border-white/10 rounded p-4 text-white focus:outline-none focus:border-flyer-cyan transition-colors min-h-[100px]",
                        isPending && "opacity-50 pointer-events-none"
                    )}
                />
                
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="absolute bottom-2 right-2 bg-flyer-cyan text-galacticos-dark font-bold uppercase text-xs px-3 py-1 rounded hover:bg-white transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                    <Save className="w-3 h-3" /> Salva
                </button>
            </div>
            {state?.message && (
                <p className={clsx("text-xs mt-2 font-bold", state.message.includes("Error") ? "text-flyer-red" : "text-green-400" )}>
                    {state.message}
                </p>
            )}
        </form>
    );
}
