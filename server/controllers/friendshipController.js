import pool from '../config/db.js';
import { getProfilePath } from '../utils/profileHelper.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const { requester_id, addressee_username } = req.body;

    if (!addressee_username) return res.status(400).json({ error: 'Username required' });

    // 1. Find addressee by username
    const [users] = await pool.query('SELECT id FROM users WHERE username = ? AND deleted_at IS NULL', [addressee_username]);
    if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const addressee_id = users[0].id;

    // 2. Prevent adding yourself
    if (requester_id === addressee_id) return res.status(400).json({ error: 'No puedes enviarte una solicitud a ti mismo' });

    // 3. Check for existing friendship in any direction
    const [existing] = await pool.query(
      `SELECT id, status, deleted_at FROM friendships 
       WHERE (requester_id = ? AND addressee_id = ?) 
       OR (requester_id = ? AND addressee_id = ?)`,
      [requester_id, addressee_id, addressee_id, requester_id]
    );

    if (existing.length > 0) {
      const friendship = existing[0];
      if (friendship.deleted_at === null) {
        return res.status(400).json({ error: `Ya existe una relación con estado: ${friendship.status}` });
      } else {
        // Reactivate if deleted
        await pool.execute(
          'UPDATE friendships SET status = "pending", requester_id = ?, addressee_id = ?, deleted_at = NULL WHERE id = ?',
          [requester_id, addressee_id, friendship.id]
        );
      }
    } else {
      // 4. Create new request
      await pool.execute(
        'INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, "pending")',
        [requester_id, addressee_id]
      );
    }

    // Emit socket event to notify addressee
    req.io.emit('friendRequestUpdate', { to: addressee_id });

    res.status(201).json({ message: 'Solicitud de amistad enviada' });
  } catch (err) {
    if (err.sqlState === '45000') {
      return res.status(400).json({ error: 'Ya existe una solicitud pendiente en la dirección opuesta' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al enviar solicitud' });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await pool.query(
      `SELECT f.id, f.requester_id, u.username, u.profile_image_path 
       FROM friendships f 
       JOIN users u ON f.requester_id = u.id 
       WHERE f.addressee_id = ? AND f.status = 'pending' AND f.deleted_at IS NULL`,
      [user_id]
    );

    const processed = rows.map(r => ({
      ...r,
      profile_image_path: getProfilePath(r.requester_id, r.profile_image_path)
    }));

    res.json(processed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

export const updateFriendshipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const [friendship] = await pool.query('SELECT requester_id, addressee_id FROM friendships WHERE id = ?', [id]);
    if (friendship.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

    if (status === 'accepted') {
      await pool.execute('UPDATE friendships SET status = "accepted" WHERE id = ?', [id]);
    } else {
      await pool.execute('UPDATE friendships SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    }

    // Notify both users
    req.io.emit('friendRequestUpdate', { to: friendship[0].requester_id });
    req.io.emit('friendRequestUpdate', { to: friendship[0].addressee_id });

    res.json({ message: `Solicitud ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar solicitud' });
  }
};

export const getFriendsList = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END as friend_id,
        u.username, u.profile_image_path
       FROM friendships f
       JOIN users u ON (CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END) = u.id
       WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted' AND f.deleted_at IS NULL`,
      [user_id, user_id, user_id, user_id]
    );

    const processed = rows.map(r => ({
      ...r,
      profile_image_path: getProfilePath(r.friend_id, r.profile_image_path)
    }));

    res.json(processed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener lista de amigos' });
  }
};
