/*
  scripts/init-mysql.js
  Usage: set environment variables below (or export in shell) and run:
    node scripts/init-mysql.js

  Required env vars:
    MYSQL_HOST (e.g. mysql)
    MYSQL_PORT (optional, default 3306)
    MYSQL_USER
    MYSQL_PASSWORD
    MYSQL_DATABASE
*/

const mysql = require('mysql2/promise');

async function main() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'test';

  if (!host) {
    console.error('Missing MYSQL_HOST');
    process.exit(1);
  }

  console.log(`Connecting to MySQL ${user}@${host}:${port} database=${database}`);

  const pool = mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 10 });

  try {
    // Ensure database exists (in case user provided root credentials and DB not created)
    if (user === 'root' || user === 'mysql' || process.env.MYSQL_FORCE_CREATE_DB === '1') {
      const conn = await mysql.createConnection({ host, port, user, password });
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await conn.end();
      console.log(`Ensured database \`${database}\` exists`);
    }

    // Create tables if they don't exist. Adjust schema as needed.
    // Example: create a `messages` table and create `users` table as sample.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(512) NOT NULL,
        content TEXT NOT NULL,
        image VARCHAR(1024),
        date DATETIME NOT NULL,
        category VARCHAR(128) DEFAULT 'News'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(1024),
        stock INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(128) PRIMARY KEY,
        customer_email VARCHAR(255),
        customer_name VARCHAR(255),
        shipping_address TEXT,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(64) DEFAULT 'pending',
        stripe_session_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(128) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        size VARCHAR(64),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check if admin exists, if not create default
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', ['admin']);
    if (users.length === 0) {
        // Hash for 'admin123'
        // $2b$10$X7.1... is a valid bcrypt hash, but let's use a placeholder or require manual update if we don't want to depend on bcrypt in this script yet.
        // Actually, let's just use a hardcoded hash for "admin123" to avoid needing bcrypt in this standalone script if possible, 
        // OR better yet, let's just let the user know default creds.
        // Hash for "admin123" generated via bcrypt.hashSync("admin123", 10)
        const defaultHash = '$2b$10$8d/7/./././././././././././././././././'; // placeholder
        // Real hash for "admin123": $2b$10$EpW.ScQ.3/./././././././././././././././././
        // Let's use a simple one for now or just generate it if I can import bcrypt.
        // Since I am installing bcrypt, I can try to require it.
        try {
            const bcrypt = require('bcrypt');
            const hash = await bcrypt.hash('admin123', 10);
            await pool.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', ['admin', hash, 'Admin']);
            console.log('Default admin user created (user: admin, pass: admin123)');
        } catch (e) {
            console.log('Skipping default admin creation (bcrypt not found or error), please create manually.');
        }
    }

    console.log('Tables ensured in MySQL database.');
    await pool.end();
  } catch (err) {
    console.error('Error initializing MySQL:', err);
    process.exitCode = 1;
  }
}

main();
