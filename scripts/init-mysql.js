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

    console.log('Tables ensured in MySQL database.');
    await pool.end();
  } catch (err) {
    console.error('Error initializing MySQL:', err);
    process.exitCode = 1;
  }
}

main();
