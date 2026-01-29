import { getOrders } from "@/actions/shop-actions";
import { ShoppingBag, MapPin, User, ChevronDown } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black font-anton uppercase text-white tracking-wide">
          Ordini Ricevuti
        </h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
            const address = order.shipping_address ? JSON.parse(order.shipping_address) : null;
            
            return (
                <div key={order.id} className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
                    {/* Order Header */}
                    <div className="flex items-center justify-between p-4 bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${order.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <div>
                                <span className="block font-bold text-white uppercase tracking-wider text-sm">
                                    Ordine #{order.id.substring(0, 8)}...
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="block font-black font-anton text-xl text-flyer-cyan">
                                € {order.total_amount.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="p-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <User className="w-3 h-3" /> Cliente
                            </h4>
                            <div className="text-sm text-gray-300 space-y-1">
                                <p className="font-bold text-white">{order.customer_name || "N/A"}</p>
                                <p>{order.customer_email || "No Email"}</p>
                            </div>
                            
                            {address && (
                                <div className="mt-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> Spedizione
                                    </h4>
                                    <div className="text-sm text-gray-300">
                                        <p>{address.line1}</p>
                                        <p>{address.postal_code} {address.city} ({address.country})</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShoppingBag className="w-3 h-3" /> Articoli
                            </h4>
                            <div className="space-y-2">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                                        <div>
                                            <span className="font-bold text-white">{item.product_name}</span>
                                            {item.size && (
                                                <span className="text-xs text-gray-400 ml-2 bg-white/10 px-1 rounded">
                                                    Tg: {item.size}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-gray-400">
                                            x{item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}

        {orders.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                Nessun ordine ricevuto.
            </div>
        )}
      </div>
    </div>
  );
}
