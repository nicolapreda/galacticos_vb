"use client";

import { useActionState } from "react";
import { saveMatchComment } from "@/lib/actions";
import { Save } from "lucide-react";
import { clsx } from "clsx";

interface MatchCommentFormProps {
    matchId: string;
    initialComment: string;
}

export default function MatchCommentForm({ matchId, initialComment }: MatchCommentFormProps) {
    const [state, formAction, isPending] = useActionState(saveMatchComment, null);

    return (
        <form action={formAction} className="mt-4">
            <input type="hidden" name="match_id" value={matchId} />
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
