const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
  });

  try {
    console.log('🔌 Connessione al database...');
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.MYSQL_DATABASE]);
    
    console.log('✅ Connessione riuscita!\n');
    console.log('📊 Tabelle nel database:');
    for (const row of tables) {
      console.log(`  • ${row.TABLE_NAME}`);
    }
    
    console.log('\n');
    for (const row of tables) {
      const [columns] = await pool.query(`SELECT COUNT(*) as cnt FROM ??`, [row.TABLE_NAME]);
      console.log(`  ${row.TABLE_NAME.padEnd(20)}: ${columns[0].cnt} righe`);
    }
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
  } finally {
    await pool.end();
  }
})();
