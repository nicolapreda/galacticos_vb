const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Fallback for dev
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);

        // News table
        db.run(`CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            image TEXT,
            date TEXT
        )`);

        // Events table
        db.run(`CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            date TEXT,
            location TEXT,
            image TEXT
        )`);

        // Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            price REAL,
            image TEXT,
            stock INTEGER DEFAULT 0
        )`);

        // Comments table
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            news_id INTEGER,
            author TEXT,
            content TEXT,
            date TEXT,
            FOREIGN KEY(news_id) REFERENCES news(id)
        )`);

        // Seed admin user if not exists
        const adminUsername = 'admin';
        const adminPassword = 'admin123'; // Default password, should be changed

        db.get("SELECT id FROM users WHERE username = ?", [adminUsername], (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }
            if (!row) {
                const saltRounds = 10;
                bcrypt.hash(adminPassword, 10, (err, hash) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [adminUsername, hash], (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log(`Admin user created. Username: ${adminUsername}, Password: ${adminPassword}`);
                        }
                    });
                });
            }
        });
    });

    // Schedule cleanup of expired events (older than 10 days)
    const cleanupExpiredEvents = () => {
        db.run("DELETE FROM events WHERE date < date('now', '-10 days')", function(err) {
            if (err) {
                console.error('Error deleting expired events:', err.message);
            } else if (this.changes > 0) {
                console.log(`Deleted ${this.changes} expired events.`);
            }
        });
    };

    // Run cleanup on startup and then every 24 hours
    cleanupExpiredEvents();
    setInterval(cleanupExpiredEvents, 24 * 60 * 60 * 1000);
}

module.exports = db;
