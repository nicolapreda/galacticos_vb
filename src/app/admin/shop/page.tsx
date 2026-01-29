import { getProducts } from "@/actions/shop-actions";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminShopPage() {
  const products = await getProducts();

  return (
    <div>
      {/* ... previous content ... */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black font-anton uppercase text-white tracking-wide">
          Gestione Shop
        </h1>
        <Link 
          href="/admin/shop/new" 
          className="bg-flyer-cyan text-white px-6 py-3 rounded font-bold uppercase tracking-wider hover:bg-white hover:text-flyer-cyan transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nuovo Drop
        </Link>
      </div>

      <div className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 font-bold uppercase text-sm tracking-wider">
             <tr>
               <th className="p-4">Anteprima</th>
               <th className="p-4">Nome</th>
               <th className="p-4">Prezzo</th>
               <th className="p-4">Stock</th>
               <th className="p-4">Azioni</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 w-24">
                   <div className="relative w-16 h-20 bg-gray-800 rounded overflow-hidden">
                      <Image 
                        src={product.image || "/assets/placeholder.webp"} 
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                   </div>
                </td>
                <td className="p-4 font-bold text-white">{product.name}</td>
                <td className="p-4 text-flyer-cyan font-mono">€ {product.price.toFixed(2)}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${product.stock > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {product.stock} pz
                    </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/admin/shop/${product.id}`}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors"
                      title="Modifica"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    
                    <DeleteProductButton id={product.id} />
                  </div>
                </td>
              </tr>
            ))}
            
            {products.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                        Nessun prodotto presente. Aggiungine uno!
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
