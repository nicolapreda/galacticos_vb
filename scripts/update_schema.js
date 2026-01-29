const { db } = require('../src/lib/db');

// The db initialization in src/lib/db.ts already runs the exec() with CREATE TABLE IF NOT EXISTS.
// So just requiring it should trigger the table creation if they don't exist.
// We force a query to ensure connection is active.
console.log("Applying database schema updates...");
try {
    db.prepare("SELECT count(*) FROM orders").get();
    console.log("Orders table exists.");
} catch (e) {
    console.log("Error checking orders table:", e.message);
}

console.log("Schema check complete.");
