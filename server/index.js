import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/storage', express.static(path.join(__dirname, '../storage')));

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

// --- STORAGE CONFIG ---
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no soportado. Solo JPG, JPEG y PNG.'));
    }
  }
});

// --- AUTH Endpoints ---

// LOGIN: Verify user credentials (now reconstructing profile path)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.age, u.gender, r.name as role, u.profile_image_path 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.username = ? AND u.password = ? AND u.deleted_at IS NULL`,
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or account deleted' });
    }

    const user = rows[0];
    if (user.profile_image_path) {
      const partition = Math.ceil(user.id / 1000);
      user.profile_image_path = `storage/profiles/${partition}/${user.profile_image_path}.webp`;
    }

    res.json({ message: 'Login successful', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error during login' });
  }
});

// --- PROFILE IMAGE Endpoint ---

app.post('/api/usuarios/:id/profile-image', upload.single('image'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });

    // 1. Get current image UUID to delete old file
    const [userRows] = await pool.query('SELECT profile_image_path FROM users WHERE id = ?', [userId]);
    const oldUuid = userRows[0]?.profile_image_path;

    // 2. Calculate Partition: ceil(userId / 1000)
    const partition = Math.ceil(userId / 1000);
    const partitionDir = path.join(__dirname, `../storage/profiles/${partition}`);
    
    if (!fs.existsSync(partitionDir)) {
      fs.mkdirSync(partitionDir, { recursive: true });
    }

    const newUuid = uuidv4();
    const fullPath = path.join(partitionDir, `${newUuid}.webp`);

    // 3. Convert to WebP and Resize
    await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .resize(400, 400, { fit: 'cover' })
      .toFile(fullPath);

    // 4. Delete old image if it exists (reconstructing path)
    if (oldUuid) {
      const oldFullPath = path.join(__dirname, `../storage/profiles/${partition}/${oldUuid}.webp`);
      if (fs.existsSync(oldFullPath)) {
        fs.unlinkSync(oldFullPath);
      }
    }

    // 5. Update Database with ONLY the UUID
    await pool.execute(
      'UPDATE users SET profile_image_path = ? WHERE id = ?',
      [newUuid, userId]
    );

    const dbPath = `storage/profiles/${partition}/${newUuid}.webp`;
    res.json({ message: 'Imagen de perfil actualizada', path: dbPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error procesando la imagen' });
  }
});

// --- CRUD Endpoints for 'users' ---

// READ: Get all users (reconstructing profile path)
app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.age, u.gender, u.registered_date, r.name as role, u.profile_image_path 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.deleted_at IS NULL`
    );

    const usersWithPaths = rows.map(u => {
      if (u.profile_image_path) {
        const partition = Math.ceil(u.id / 1000);
        u.profile_image_path = `storage/profiles/${partition}/${u.profile_image_path}.webp`;
      }
      return u;
    });

    res.json(usersWithPaths);
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

// --- POSTS Endpoints ---

// CREATE: Add a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { user_id, post } = req.body;

    if (!user_id || !post) {
      return res.status(400).json({ error: 'Missing user_id or post content' });
    }

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, post) VALUES (?, ?)',
      [user_id, post]
    );

    res.status(201).json({ id: result.insertId, message: 'Post created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating post' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
