"use server";

import { db, Product, Order, OrderItem } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- PRODUCTS ---

export async function getProducts(): Promise<Product[]> {
    console.log('[getProducts] Fetching all products...');
    const result = await db.prepare("SELECT * FROM products ORDER BY id DESC").all() as Product[];
    console.log(`[getProducts] ✅ Found ${result.length} products`);
    return result;
}

export async function getProduct(id: number): Promise<Product | undefined> {
    console.log(`[getProduct] Fetching product ID: ${id}`);
    const result = await db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Product | undefined;
    console.log(`[getProduct] ✅ Product found: ${result ? result.name : 'NOT FOUND'}`);
    return result;
}

import { saveFile } from "@/lib/upload";

export async function createProduct(formData: FormData) {
    console.log('\n========== CREATE PRODUCT START ==========');
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const imageFile = formData.get("imageFile") as File;
    let image = formData.get("image") as string; // Fallback text URL

    console.log(`[createProduct] Name: "${name}"`);
    console.log(`[createProduct] Description length: ${description?.length || 0}`);
    console.log(`[createProduct] Price: ${price}`);
    console.log(`[createProduct] Stock: ${stock}`);
    console.log(`[createProduct] Image file: ${imageFile?.name || 'none'}`);
    console.log(`[createProduct] Image URL fallback: ${image || 'none'}`);

    if (imageFile && imageFile.size > 0) {
        console.log(`[createProduct] Processing image: ${imageFile.name} (${imageFile.size} bytes)`);
        image = await saveFile(imageFile);
        console.log(`[createProduct] ✅ Image saved: ${image}`);
    }

    try {
        console.log('[createProduct] Executing database INSERT...');
        const stmt = db.prepare(`
            INSERT INTO products (name, description, price, image, stock)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = await stmt.run(name, description, isNaN(price) ? 0 : price, image, isNaN(stock) ? 0 : stock);
        console.log('[createProduct] ✅ Database INSERT successful');
    } catch (e) {
        console.error('❌ [createProduct] Database Error:', e);
        throw e;
    }

    console.log('[createProduct] Revalidating paths...');
    revalidatePath("/shop");
    revalidatePath("/admin/shop");
    
    console.log('========== CREATE PRODUCT END ✅ ==========\n');
}

export async function updateProduct(id: number, formData: FormData) {
    console.log('\n========== UPDATE PRODUCT START ==========');
    console.log(`[updateProduct] ID: ${id}`);
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const imageFile = formData.get("imageFile") as File;
    let image = formData.get("image") as string;

    console.log(`[updateProduct] Name: "${name}"`);
    console.log(`[updateProduct] Description length: ${description?.length || 0}`);
    console.log(`[updateProduct] Price: ${price}`);
    console.log(`[updateProduct] Stock: ${stock}`);
    console.log(`[updateProduct] Image file: ${imageFile?.name || 'none'}`);
    console.log(`[updateProduct] Image URL: ${image}`);

    if (imageFile && imageFile.size > 0) {
        console.log(`[updateProduct] Processing new image: ${imageFile.name} (${imageFile.size} bytes)`);
        image = await saveFile(imageFile);
        console.log(`[updateProduct] ✅ New image saved: ${image}`);
    }

    try {
        console.log('[updateProduct] Executing database UPDATE...');
        const stmt = db.prepare(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, image = ?, stock = ?
            WHERE id = ?
        `);
        const result = await stmt.run(name, description, isNaN(price) ? 0 : price, image, isNaN(stock) ? 0 : stock, id);
        console.log('[updateProduct] ✅ Database UPDATE successful');
    } catch (e) {
        console.error('❌ [updateProduct] Database Error:', e);
        throw e;
    }

    console.log('[updateProduct] Revalidating paths...');
    revalidatePath("/shop");
    revalidatePath(`/shop/${id}`);
    revalidatePath("/admin/shop");
    
    console.log('========== UPDATE PRODUCT END ✅ ==========\n');
}

export async function deleteProduct(id: number) {
    console.log('\n========== DELETE PRODUCT START ==========');
    console.log(`[deleteProduct] ID: ${id}`);
    
    try {
        console.log('[deleteProduct] Executing database DELETE...');
        await db.prepare("DELETE FROM products WHERE id = ?").run(id);
        console.log('[deleteProduct] ✅ Database DELETE successful');
    } catch (e) {
        console.error('❌ [deleteProduct] Database Error:', e);
        throw e;
    }

    console.log('[deleteProduct] Revalidating paths...');
    revalidatePath("/shop");
    revalidatePath("/admin/shop");
    
    console.log('========== DELETE PRODUCT END ✅ ==========\n');
}

// --- ORDERS ---

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

export async function getOrders(): Promise<OrderWithItems[]> {
    const orders = await db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as Order[];

    // Fetch items for each order (efficient enough for expected volume)
    const ordersWithItems: OrderWithItems[] = [];
    for (const order of orders) {
        const items = await db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id) as OrderItem[];
        ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems;
}
