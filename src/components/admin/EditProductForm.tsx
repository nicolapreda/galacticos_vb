"use client";

import { updateProduct } from "@/actions/shop-actions";
import { Save } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Define a type that matches the DB product structure
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    stock: number;
}

export default function EditProductForm({ product }: { product: Product }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
           await updateProduct(product.id, formData);
           alert("Prodotto aggiornato con successo!");
           router.push("/admin/shop");
           router.refresh(); // Ensure data is fresh
        } catch (error) {
           console.error("Error updating product:", error);
           alert("Errore durante l'aggiornamento.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl">
            <Link href="/admin/shop" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 font-bold uppercase text-sm tracking-wider">
                <ArrowLeft className="w-4 h-4" /> Torna alla lista
            </Link>

            <h1 className="text-4xl font-black font-anton uppercase text-white tracking-wide mb-8">
                Modifica <span className="text-flyer-cyan">{product.name}</span>
            </h1>

            <form action={handleSubmit} className="space-y-6 bg-black/20 p-8 rounded-lg border border-white/10">
                
                {/* Name */}
                <div>
                   <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Nome Prodotto</label>
                   <input 
                     type="text" 
                     name="name" 
                     defaultValue={product.name}
                     required 
                     className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-flyer-cyan focus:outline-none"
                     placeholder="Es. Hoodie Locally Hated"
                   />
                </div>

                {/* Description */}
                <div>
                   <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Descrizione</label>
                   <textarea 
                     name="description" 
                     defaultValue={product.description}
                     required 
                     rows={4}
                     className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-flyer-cyan focus:outline-none"
                     placeholder="Descrizione dettagliata..."
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Prezzo (€)</label>
                        <input 
                            type="number" 
                            name="price" 
                            defaultValue={product.price}
                            required 
                            step="0.01"
                            min="0"
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-flyer-cyan focus:outline-none"
                            placeholder="25.00"
                        />
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Quantità (Stock)</label>
                        <input 
                            type="number" 
                            name="stock" 
                            defaultValue={product.stock}
                            required 
                            min="0"
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-flyer-cyan focus:outline-none"
                            placeholder="50"
                        />
                    </div>
                </div>

                {/* Image Selection */}
                <div className="bg-white/5 p-4 rounded border border-white/10">
                   <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Immagine Prodotto</label>
                   
                   {/* Current Image Preview */}
                   {product.image && (
                       <div className="mb-4">
                           <p className="text-xs text-gray-500 mb-2">Immagine Attuale:</p>
                           <img src={product.image} alt="Current" className="w-32 h-32 object-cover rounded border border-white/20" />
                       </div>
                   )}

                   {/* Upload File */}
                   <div className="mb-4">
                       <label className="block text-xs font-bold uppercase text-flyer-cyan mb-2">Carica Nuova Immagine:</label>
                       <input 
                         type="file" 
                         name="imageFile" 
                         accept="image/*"
                         className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-flyer-cyan file:text-white hover:file:bg-flyer-blue transition-colors"
                       />
                   </div>

                   <div className="text-center text-xs text-gray-500 my-2">- OPPURE -</div>

                   {/* Manual URL Stick */}
                   <div>
                       <label className="block text-xs font-bold uppercase text-gray-400 mb-2">URL Manuale (se non carichi file):</label>
                       <input 
                         type="text" 
                         name="image" 
                         defaultValue={product.image || ""}
                         className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-flyer-cyan focus:outline-none"
                         placeholder="/assets/..."
                       />
                   </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-flyer-cyan text-white w-full py-4 rounded font-black uppercase tracking-wider hover:bg-white hover:text-flyer-cyan transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Aggiornamento in corso..." : (
                            <>
                                <Save className="w-5 h-5" /> Aggiorna Prodotto
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
