import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * mysql2 connection pool using promise-based API.
 * Pool reuses connections, avoiding the overhead of creating
 * a new connection for every query.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,       // max simultaneous connections
  queueLimit: 0,             // unlimited queued requests
});

export { pool };
