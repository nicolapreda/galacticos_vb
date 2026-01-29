import { createProduct } from "@/actions/shop-actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewProductPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const image = formData.get("image") as string;

    await createProduct({ 
        name, 
        description, 
        price: isNaN(price) ? 0 : price, 
        stock: isNaN(stock) ? 0 : stock, 
        image 
    });
    
    redirect("/admin/shop");
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/shop" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 font-bold uppercase text-sm tracking-wider">
        <ArrowLeft className="w-4 h-4" /> Torna alla lista
      </Link>

      <h1 className="text-4xl font-black font-anton uppercase text-white tracking-wide mb-8">
        Nuovo <span className="text-flyer-cyan">Drop</span>
      </h1>

      <form action={async (formData: FormData) => {
          "use server";
          await createProduct(formData);
          redirect("/admin/shop");
      }} className="space-y-6 bg-black/20 p-8 rounded-lg border border-white/10">
        
        {/* Name */}
        <div>
           <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Nome Prodotto</label>
           <input 
             type="text" 
             name="name" 
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
           
           {/* Upload File */}
           <div className="mb-4">
               <label className="block text-xs font-bold uppercase text-flyer-cyan mb-2">Carica Immagine:</label>
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
                 className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white focus:border-flyer-cyan focus:outline-none"
                 placeholder="/assets/..."
               />
           </div>
        </div>

        <div className="pt-4">
            <button 
                type="submit" 
                className="bg-flyer-cyan text-white w-full py-4 rounded font-black uppercase tracking-wider hover:bg-white hover:text-flyer-cyan transition-colors flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" /> Salva Prodotto
            </button>
        </div>

      </form>
    </div>
  );
}
