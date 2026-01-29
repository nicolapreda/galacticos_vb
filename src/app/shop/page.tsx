import { db, Product } from "@/lib/db";
import ShopClient from "@/components/ShopClient";
import { stripe } from "@/lib/stripe";

async function getProducts(): Promise<Product[]> {
  const stmnt = db.prepare("SELECT * FROM products");
  return stmnt.all() as Product[];
}

async function verifyOrder(orderId: string) {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as any;
    
    if (order && order.status === 'pending' && order.stripe_session_id) {
        try {
            const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
            if (session.payment_status === 'paid') {
                const customerDetails = session.customer_details;
                const shipping = customerDetails?.address;

                const addressString = JSON.stringify({
                    line1: shipping?.line1,
                    line2: shipping?.line2,
                    city: shipping?.city,
                    postal_code: shipping?.postal_code,
                    country: shipping?.country,
                    state: shipping?.state,
                });

                db.prepare(`
                    UPDATE orders 
                    SET status = 'paid', 
                        customer_name = ?, 
                        customer_email = ?, 
                        shipping_address = ?
                    WHERE id = ?
                `).run(
                    customerDetails?.name || 'N/A', 
                    customerDetails?.email || 'N/A', 
                    addressString, 
                    orderId
                );
                console.log(`Order ${orderId} confirmed and updated.`);
            }
        } catch (e) {
            console.error("Error verifying Stripe session:", e);
        }
    }
}

export default async function ShopPage({ searchParams }: { searchParams: { success?: string, order_id?: string } }) {
  const products = await getProducts();
  
  if (searchParams.success === 'true' && searchParams.order_id) {
      await verifyOrder(searchParams.order_id);
  }

  return <ShopClient products={products} success={searchParams.success === 'true'} />;
}
