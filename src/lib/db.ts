import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'predanicola_db';

const pool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
});

// Minimal drop-in wrapper to emulate better-sqlite3 prepare().all/get/run API
export const db = {
    prepare(sql: string) {
        return {
            all: async (...params: any[]) => {
                const [rows] = await pool.execute(sql, params);
                return rows;
            },
            get: async (...params: any[]) => {
                const [rows] = await pool.execute(sql, params);
                const arr = rows as any[];
                return arr[0];
            },
            run: async (...params: any[]) => {
                const [result] = await pool.execute(sql, params);
                return result;
            },
        };
    },
    async exec(sql: string) {
        await pool.query(sql);
    },
    // direct query helper
    async query(sql: string, params?: any[]) {
        const [rows] = await pool.execute(sql, params || []);
        return rows;
    },
};

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
