import { Pool } from 'pg';

// Thay đổi các biến môi trường này cho phù hợp với Neon.tech của bạn
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@host:port/dbname',
  ssl: { rejectUnauthorized: false },
});

export default pool; 