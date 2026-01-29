import Database from 'better-sqlite3';
import path from 'path';

// Initialize the database connection
// In development, we want to preserve the connection across hot reloads if possible, 
// but simplified approach is acceptable for SQLite.
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Ensure tables exist
db.exec(`
    CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        date TEXT NOT NULL,
        category TEXT DEFAULT 'News'
    );

    CREATE TABLE IF NOT EXISTS match_comments (
        match_id TEXT PRIMARY KEY,
        comment TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        stock INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_email TEXT,
        customer_name TEXT,
        shipping_address TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending', 
        stripe_session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        size TEXT,
        FOREIGN KEY(order_id) REFERENCES orders(id)
    );
`);

export interface News {
    id: number;
    title: string;
    content: string;
    image: string | null;
    date: string;
}

export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    image: string | null;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    stock: number;
}

export interface Order {
    id: string;
    customer_email: string;
    customer_name: string;
    shipping_address: string; // JSON string
    total_amount: number;
    status: string;
    stripe_session_id: string;
    created_at: string;
}

export interface OrderItem {
    id: number;
    order_id: string;
    product_name: string;
    quantity: number;
    price: number;
    size: string | null;
}
