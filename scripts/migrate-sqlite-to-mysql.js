/*
  scripts/migrate-sqlite-to-mysql.js
  Migrates data from local database.sqlite to MySQL using env vars.

  Usage:
    Set MYSQL_* env vars (same as init script) and run:
      node scripts/migrate-sqlite-to-mysql.js

  NOTE: This script is idempotent for simple inserts (it will try to insert rows and may fail on PK conflicts).
  Use with care on production databases.
*/

const path = require('path');
const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');
require('dotenv').config();

const SQLITE_PATH = path.join(process.cwd(), 'database.sqlite');

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'predanicola_db';

async function main() {
  if (!require('fs').existsSync(SQLITE_PATH)) {
    console.error('SQLite file not found at', SQLITE_PATH);
    process.exit(1);
  }

  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const pool = await mysql.createPool({ host: MYSQL_HOST, port: MYSQL_PORT, user: MYSQL_USER, password: MYSQL_PASSWORD, database: MYSQL_DATABASE, waitForConnections: true, connectionLimit: 10, charset: 'utf8mb4' });

  try {
    console.log('Migrating `news`...');
    const newsRows = sqlite.prepare('SELECT * FROM news').all();
    for (const r of newsRows) {
      try {
        await pool.execute(`INSERT INTO news (id, title, content, image, date, category) VALUES (?, ?, ?, ?, ?, ?)`, [r.id, r.title, r.content, r.image, r.date, r.category || 'News']);
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') continue;
        console.error('Failed to insert news id', r.id, e.message);
      }
    }

    console.log('Migrating `match_comments`...');
    const comments = sqlite.prepare('SELECT * FROM match_comments').all();
    for (const c of comments) {
      try {
        await pool.execute(`INSERT INTO match_comments (match_id, comment, updated_at) VALUES (?, ?, ?)`, [c.match_id, c.comment, c.updated_at]);
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') continue;
        console.error('Failed to insert comment', c.match_id, e.message);
      }
    }

    console.log('Migrating `products`...');
    const products = sqlite.prepare('SELECT * FROM products').all();
    for (const p of products) {
      try {
        await pool.execute(`INSERT INTO products (id, name, description, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)`, [p.id, p.name, p.description, p.price, p.image, p.stock]);
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') continue;
        console.error('Failed to insert product', p.id, e.message);
      }
    }

    console.log('Migrating `orders`...');
    const orders = sqlite.prepare('SELECT * FROM orders').all();
    for (const o of orders) {
      try {
        await pool.execute(`INSERT INTO orders (id, customer_email, customer_name, shipping_address, total_amount, status, stripe_session_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [o.id, o.customer_email, o.customer_name, o.shipping_address, o.total_amount, o.status || 'pending', o.stripe_session_id, o.created_at]);
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') continue;
        console.error('Failed to insert order', o.id, e.message);
      }
    }

    console.log('Migrating `order_items`...');
    const items = sqlite.prepare('SELECT * FROM order_items').all();
    for (const it of items) {
      try {
        await pool.execute(`INSERT INTO order_items (id, order_id, product_name, quantity, price, size) VALUES (?, ?, ?, ?, ?, ?)`, [it.id, it.order_id, it.product_name, it.quantity, it.price, it.size]);
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') continue;
        console.error('Failed to insert order_item', it.id, e.message);
      }
    }

    console.log('Migration complete.');
  } finally {
    await pool.end();
    sqlite.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
