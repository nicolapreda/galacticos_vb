"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions";
import Image from "next/image";

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen bg-galacticos-dark flex items-center justify-center p-6">
       <div className="bg-white/5 border border-white/10 p-8 rounded-lg shadow-2xl max-w-sm w-full backdrop-blur-sm">
           
           <div className="flex flex-col items-center mb-8">
               <div className="relative w-20 h-20 mb-4">
                   <Image src="/assets/logo.webp" alt="Logo" fill className="object-contain" />
               </div>
               <h1 className="text-2xl font-black font-anton text-white uppercase">Admin Access</h1>
           </div>

           <form action={dispatch} className="flex flex-col gap-4">
               <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="email">
                       Username / Email
                   </label>
                   <input 
                        className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors"
                        id="email" 
                        type="text" 
                        name="email" 
                        placeholder="admin" 
                        required 
                    />
               </div>
               
               <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="password">
                       Password
                   </label>
                   <input 
                        className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-flyer-cyan transition-colors"
                        id="password" 
                        type="password" 
                        name="password" 
                        placeholder="••••••••" 
                        required 
                    />
               </div>

               <button 
                type="submit"
                className="bg-flyer-cyan text-galacticos-dark font-black uppercase tracking-widest py-3 rounded hover:bg-white transition-colors mt-2"
               >
                   Accedi
               </button>

               {errorMessage && (
                   <div className="text-red-500 text-sm font-bold text-center mt-2">
                       {errorMessage}
                   </div>
               )}
           </form>
       </div>
    </div>
  );
}
