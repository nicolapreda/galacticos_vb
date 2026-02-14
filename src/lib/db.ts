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
                try {
                    console.log(`[DB.all] SQL: ${sql.substring(0, 100)}...`);
                    console.log(`[DB.all] Params:`, params);
                    const [rows] = await pool.execute(sql, params);
                    console.log(`[DB.all] Result: ${(rows as any[]).length} rows returned`);
                    return rows;
                } catch (err) {
                    console.error('❌ [DB.all] QUERY FAILED:', String(err));
                    console.error('[DB.all] SQL:', sql);
                    console.error('[DB.all] Params:', params);
                    return [];
                }
            },
            get: async (...params: any[]) => {
                try {
                    console.log(`[DB.get] SQL: ${sql.substring(0, 100)}...`);
                    console.log(`[DB.get] Params:`, params);
                    const [rows] = await pool.execute(sql, params);
                    const arr = rows as any[];
                    console.log(`[DB.get] Result: ${arr.length > 0 ? 'found' : 'not found'}`);
                    return arr[0];
                } catch (err) {
                    console.error('❌ [DB.get] QUERY FAILED:', String(err));
                    console.error('[DB.get] SQL:', sql);
                    console.error('[DB.get] Params:', params);
                    return undefined;
                }
            },
            run: async (...params: any[]) => {
                try {
                    console.log(`[DB.run] SQL: ${sql.substring(0, 100)}...`);
                    console.log(`[DB.run] Params:`, params);
                    const [result] = await pool.execute(sql, params);
                    console.log('[DB.run] Result:', result);
                    return result;
                } catch (err) {
                    console.error('❌ [DB.run] QUERY FAILED:', String(err));
                    console.error('[DB.run] SQL:', sql);
                    console.error('[DB.run] Params:', params);
                    return undefined;
                }
            },
        };
    },
    async exec(sql: string) {
        try {
            await pool.query(sql);
        } catch (err) {
            console.warn('DB exec failed:', String(err));
        }
    },
    // direct query helper
    async query(sql: string, params?: any[]) {
        try {
            const [rows] = await pool.execute(sql, params || []);
            return rows;
        } catch (err) {
            console.warn('DB query failed:', String(err));
            return [];
        }
    },
};

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
