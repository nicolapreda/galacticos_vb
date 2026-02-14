/*
  scripts/update_schema_v2.js
  Adds `cover_image` column to `match_comments` table.
*/

const fs = require('fs');
const path = require('path');
try {
    require('dotenv').config();
} catch (e) {
    console.log('⚠️ dotenv not found, using default env vars or process.env');
}

// Try to require mysql2, but don't fail if missing (local dev might be sqlite only)
let mysql;
try {
    mysql = require('mysql2/promise');
} catch (e) {
    console.log('⚠️ mysql2 not found, skipping MySQL checks.');
}

const Database = require('better-sqlite3');

async function main() {
    // 1. Update MySQL (if configured)
    if (process.env.MYSQL_Database || process.env.MYSQL_HOST) {
        console.log('🔄 Checking MySQL schema...');
        try {
            const pool = await mysql.createPool({
                host: process.env.MYSQL_HOST || 'localhost',
                port: Number(process.env.MYSQL_PORT) || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'predanicola_db',
            });

            // Check if column exists
            try {
                await pool.query('SELECT cover_image FROM match_comments LIMIT 1');
                console.log('✅ MySQL `match_comments.cover_image` already exists.');
            } catch (err) {
                if (err.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('➕ Adding `cover_image` column to MySQL `match_comments`...');
                    await pool.query('ALTER TABLE match_comments ADD COLUMN cover_image VARCHAR(1024) DEFAULT NULL');
                    console.log('✅ MySQL schema updated.');
                } else {
                    console.error('⚠️ MySQL check failed:', err.message);
                }
            }
            await pool.end();
        } catch (err) {
            console.warn('⚠️ Skipping MySQL update (connection failed):', err.message);
        }
    }

    // 2. Update SQLite (local dev)
    const sqlitePath = './database.sqlite';
    if (fs.existsSync(sqlitePath)) {
        console.log('🔄 Checking SQLite schema...');
        const db = new Database(sqlitePath);
        
        try {
            // Check if column exists
            const tableInfo = db.pragma('table_info(match_comments)');
            const hasColumn = tableInfo.some(col => col.name === 'cover_image');

            if (hasColumn) {
                console.log('✅ SQLite `match_comments.cover_image` already exists.');
            } else {
                console.log('➕ Adding `cover_image` column to SQLite `match_comments`...');
                db.prepare('ALTER TABLE match_comments ADD COLUMN cover_image TEXT DEFAULT NULL').run();
                console.log('✅ SQLite schema updated.');
            }
        } catch (err) {
            console.error('❌ SQLite update failed:', err.message);
        } finally {
            db.close();
        }
    } else {
        console.log('ℹ️ No SQLite database found at ./database.sqlite');
    }
}

main();
