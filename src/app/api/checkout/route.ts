import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { Product } from "@/lib/db";

interface CartItem extends Product {
    quantity: number;
    size?: string;
}

export async function POST(req: Request) {
    try {
        const { items }: { items: CartItem[] } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // Determine Base URL
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host") || "localhost:3000";
        const baseUrl = `${protocol}://${host}`;

        const lineItems = items.map((item) => ({
            price_data: {
                currency: "eur",
                product_data: {
                    name: item.size ? `${item.name} (Taglia: ${item.size})` : item.name,
                    description: item.description ? item.description.substring(0, 100) + "..." : undefined,
                    images: item.image ? [`${baseUrl}${item.image}`] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
            },
            quantity: item.quantity,
        }));

        // Create Order ID
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${baseUrl}/shop?success=true&order_id=${orderId}`,
            cancel_url: `${baseUrl}/shop?canceled=true`,
            shipping_address_collection: {
                allowed_countries: ["IT"], // Restrict to Italy or add more if needed
            },
            phone_number_collection: {
                enabled: true,
            },
            metadata: {
                orderId: orderId,
            }
        });

        // Save Order to DB (Pending)
        // We don't have address yet, so we leave it empty or update it via webhook later.
        // For MVP without webhook, we assume we capture it if possible, but Stripe collects it on their page.
        // We can only get it back if we verify the session after success. 
        // For now, let's save what we have items-wise.
        const db = require('better-sqlite3')(require('path').resolve(process.cwd(), 'database.sqlite'));

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        db.prepare(`
            INSERT INTO orders (id, total_amount, status, stripe_session_id, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(orderId, totalAmount, 'pending', session.id, new Date().toISOString());

        // Insert Items
        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_name, quantity, price, size)
            VALUES (?, ?, ?, ?, ?)
        `);

        items.forEach(item => {
            insertItem.run(orderId, item.name, item.quantity, item.price, item.size || null);
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Stripe Error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
