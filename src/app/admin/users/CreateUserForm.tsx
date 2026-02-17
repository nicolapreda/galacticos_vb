"use client";

import { useActionState } from "react";
import { createUser } from "@/lib/actions";

const initialState = {
  message: "",
};

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, initialState);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-flyer-cyan block"></span>
            Nuovo Amministratore
        </h2>
        <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
                type="text" 
                name="name" 
                placeholder="Nome Completo" 
                className="bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors"
                required
            />
            <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                className="bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors"
                required
            />
                <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                className="bg-black/40 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors"
                required
                minLength={6}
            />
            <button 
                type="submit" 
                disabled={isPending}
                className="bg-flyer-cyan text-galacticos-dark font-black uppercase tracking-widest py-3 rounded md:col-start-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Creazione..." : "Crea Utente"}
            </button>
            
            {state?.message && (
                <div className="col-span-1 md:col-span-3 text-sm font-bold text-center mt-2 p-2 rounded bg-white/10">
                    <span className={state.message.includes("success") ? "text-green-400" : "text-red-400"}>
                        {state.message}
                    </span>
                </div>
            )}
        </form>
    </div>
  );
}
