const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Initialize database table if it doesn't exist
const initDb = async (retries = 5) => {
  while (retries) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS items (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Database initialized');
      break;
    } catch (err) {
      console.error('Error initializing database, retrying...', err);
      retries -= 1;
      await new Promise(res => setTimeout(res, 2000));
    }
  }
};
initDb();

// 1. Backend Status Endpoint
app.get('/api/status/backend', (req, res) => {
  res.json({ status: 'online', message: 'Backend is running smoothly.' });
});

// 2. Database Status Endpoint
app.get('/api/status/database', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'online', message: 'Database is connected.', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'offline', error: 'Database connection failed' });
  }
});

// 3. Data endpoints
app.post('/api/data', async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO items(content) VALUES($1) RETURNING *',
      [content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert data' });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
