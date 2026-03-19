import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'simple_crud'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database (simple_crud)!');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
})();

// --- AUTH Endpoints ---

// LOGIN: Verify user credentials
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.age, u.gender, r.name as role 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.username = ? AND u.password = ? AND u.deleted_at IS NULL`,
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or account deleted' });
    }

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error during login' });
  }
});

// --- CRUD Endpoints for 'users' ---

// CREATE: Add a new user (Assign default 'user' role if none provided)
app.post('/api/usuarios', async (req, res) => {
  try {
    const { username, age, gender, password, role_id } = req.body;
    
    if (!username || !age || !gender || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Default to 'user' role (ID 5 based on database check) if not provided
    const finalRoleId = role_id || 5; 
    const registeredAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.execute(
      'INSERT INTO users (username, age, gender, password, registered_date, role_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username, age, gender, password, registeredAt, finalRoleId]
    );

    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// READ: Get all users (Exclude deleted ones)
app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.age, u.gender, u.registered_date, r.name as role 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.deleted_at IS NULL`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// DELETE: Logical delete a user by ID
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.execute(
      'UPDATE users SET deleted_at = ? WHERE id = ?', 
      [deletedAt, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User logically deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
