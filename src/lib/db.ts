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
