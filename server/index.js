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
  password: '', // Assuming no password based on previous command
  database: 'forms-testing-playwright'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database!');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
})();

// --- CRUD Endpoints for 'usuarios' ---

// CREATE: Add a new user
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombreCompleto, edad, sexo, password } = req.body;
    
    // Validation: Ensure required fields are present
    if (!nombreCompleto || !edad || !sexo || !password) {
      return res.status(400).json({ error: 'Missing required fields: nombreCompleto, edad, sexo, password' });
    }

    const registeredDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre_completo, edad, sexo, password, registered_date) VALUES (?, ?, ?, ?, ?)',
      [nombreCompleto, edad, sexo, password, registeredDate]
    );

    res.status(201).json({ id: result.insertId, message: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// READ: Get all users
app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// READ: Get a single user by ID
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// UPDATE: Update a user by ID
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, edad, sexo, password } = req.body;

    // Check if user exists first
    const [check] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await pool.execute(
      'UPDATE usuarios SET nombre_completo = ?, edad = ?, sexo = ?, password = ? WHERE id = ?',
      [nombreCompleto, edad, sexo, password, id]
    );

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// DELETE: Delete a user by ID
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
