import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Product } from "@/lib/db";

interface CartItem extends Product {
    quantity: number;
    size?: string;
}

export async function POST(req: Request) {
    try {
        // ✅ Stripe inizializzato SOLO a runtime
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2026-01-28.clover",
        });

        const { items }: { items: CartItem[] } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "Cart is empty" },
                { status: 400 }
            );
        }

        // Base URL (compatibile con proxy / nginx / cloudflare)
        const protocol =
            req.headers.get("x-forwarded-proto") ??
            (process.env.NODE_ENV === "production" ? "https" : "http");

        const host = req.headers.get("host") ?? "localhost:3000";
        const baseUrl = `${protocol}://${host}`;

        const lineItems = items.map((item) => ({
            price_data: {
                currency: "eur",
                product_data: {
                    name: item.size
                        ? `${item.name} (Taglia: ${item.size})`
                        : item.name,
                    description: item.description
                        ? item.description.substring(0, 100) + "..."
                        : undefined,
                    images: item.image ? [`${baseUrl}${item.image}`] : [],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${baseUrl}/shop?success=true&order_id=${orderId}`,
            cancel_url: `${baseUrl}/shop?canceled=true`,
            shipping_address_collection: {
                allowed_countries: ["IT"],
            },
            phone_number_collection: {
                enabled: true,
            },
            metadata: {
                orderId,
            },
        });

        // ✅ DB inizializzato SOLO a runtime
        const path = require("path");
        const Database = require("better-sqlite3");

        const dbPath = path.resolve(process.cwd(), "database.sqlite");
        const db = new Database(dbPath);

        const totalAmount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        db.prepare(`
      INSERT INTO orders (id, total_amount, status, stripe_session_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
            orderId,
            totalAmount,
            "pending",
            session.id,
            new Date().toISOString()
        );

        const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_name, quantity, price, size)
      VALUES (?, ?, ?, ?, ?)
    `);

        for (const item of items) {
            insertItem.run(
                orderId,
                item.name,
                item.quantity,
                item.price,
                item.size ?? null
            );
        }

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Checkout error:", err);

        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}