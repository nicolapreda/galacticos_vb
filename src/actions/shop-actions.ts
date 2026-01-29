"use server";

import { db, Product, Order, OrderItem } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- PRODUCTS ---

export async function getProducts(): Promise<Product[]> {
    return db.prepare("SELECT * FROM products ORDER BY id DESC").all() as Product[];
}

export async function getProduct(id: number): Promise<Product | undefined> {
    return db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Product | undefined;
}

import { saveFile } from "@/lib/upload";

export async function createProduct(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const imageFile = formData.get("imageFile") as File;
    let image = formData.get("image") as string; // Fallback text URL

    if (imageFile && imageFile.size > 0) {
        image = await saveFile(imageFile);
    }

    const stmt = db.prepare(`
    INSERT INTO products (name, description, price, image, stock)
    VALUES (?, ?, ?, ?, ?)
  `);

    stmt.run(name, description, isNaN(price) ? 0 : price, image, isNaN(stock) ? 0 : stock);
    revalidatePath("/shop");
    revalidatePath("/admin/shop");
}

export async function updateProduct(id: number, formData: FormData) {
    console.log(`[UPDATE PRODUCT] ID: ${id}`);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const imageFile = formData.get("imageFile") as File;
    let image = formData.get("image") as string;

    console.log(`[UPDATE PRODUCT] Name: ${name}, Price: ${price}, ImageInput: ${image}, FileSize: ${imageFile?.size}`);

    if (imageFile && imageFile.size > 0) {
        image = await saveFile(imageFile);
        console.log(`[UPDATE PRODUCT] New Image Saved: ${image}`);
    }

    const stmt = db.prepare(`
    UPDATE products 
    SET name = ?, description = ?, price = ?, image = ?, stock = ?
    WHERE id = ?
  `);

    stmt.run(name, description, isNaN(price) ? 0 : price, image, isNaN(stock) ? 0 : stock, id);
    revalidatePath("/shop");
    revalidatePath(`/shop/${id}`);
    revalidatePath("/admin/shop");
}

export async function deleteProduct(id: number) {
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    revalidatePath("/shop");
    revalidatePath("/admin/shop");
}

// --- ORDERS ---

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

export async function getOrders(): Promise<OrderWithItems[]> {
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as Order[];

    // Fetch items for each order (efficient enough for expected volume)
    // Could accept a JOIN query but manual mapping is simpler for typing right now
    const ordersWithItems = orders.map(order => {
        const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id) as OrderItem[];
        return { ...order, items };
    });

    return ordersWithItems;
}
