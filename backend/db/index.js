const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'conduccionapp_db',
  password: '1234',
  port: 5432,
});

// ✅ Exportamos el pool completo
module.exports = pool;