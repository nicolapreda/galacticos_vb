const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

const product = {
    name: "Hoodie 'Locally Hated'",
    description: "Felpa grigia (con interno leggermente felpato) graficata sia nella parte anteriore sia posteriore.\n\nN.B. la felpa veste un po’ stretta, consultare la tabella taglie per assicurarsi di prendere la taglia giusta.\n\nLa scadenza per l’ordine è entro e non oltre domenica prossima 1 febbraio.",
    price: 25.00,
    image: "/assets/drop1/hoodie_front.jpg",
    stock: 50
};

// Check if exists
const existing = db.prepare("SELECT * FROM products WHERE name = ?").get(product.name);

if (existing) {
    console.log("Product already exists, updating...");
    db.prepare(`
        UPDATE products 
        SET description = ?, price = ?, image = ?, stock = ?
        WHERE name = ?
    `).run(product.description, product.price, product.image, product.stock, product.name);
    console.log("Product updated!");
} else {
    console.log("Inserting new product...");
    db.prepare(`
        INSERT INTO products (name, description, price, image, stock)
        VALUES (?, ?, ?, ?, ?)
    `).run(product.name, product.description, product.price, product.image, product.stock);
    console.log("Product inserted!");
}

console.log("Done.");
