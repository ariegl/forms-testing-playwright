import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;
    if (!message.trim()) return res.status(400).json({ error: 'Mensaje vacío' });

    const id = uuidv4();
    await pool.execute(
      'INSERT INTO private_messages (id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)',
      [id, sender_id, receiver_id, message]
    );

    const [newMessage] = await pool.query('SELECT * FROM private_messages WHERE id = ?', [id]);
    
    // Notificar al receptor vía Socket
    req.io.emit('privateMessage', newMessage[0]);

    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const [messages] = await pool.query(
      `SELECT * FROM private_messages 
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       AND ((sender_id = ? AND deleted_by_sender IS NULL) OR (receiver_id = ? AND deleted_by_receiver IS NULL))
       ORDER BY created_at ASC`,
      [user1, user2, user2, user1, user1, user1]
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE private_messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND read_at IS NULL',
      [id]
    );
    res.json({ message: 'Leído' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
};
