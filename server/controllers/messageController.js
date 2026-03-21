import prisma from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const formatMessage = (msg) => ({
  id: msg.id,
  sender_id: msg.senderId,
  receiver_id: msg.receiverId,
  message: msg.message,
  read_at: msg.readAt,
  deleted_by_sender: msg.deletedBySender,
  deleted_by_receiver: msg.deletedByReceiver,
  created_at: msg.createdAt
});

export const sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;
    if (!message.trim()) return res.status(400).json({ error: 'Mensaje vacío' });

    const id = uuidv4();
    const newMessage = await prisma.privateMessage.create({
      data: {
        id,
        senderId: parseInt(sender_id),
        receiverId: parseInt(receiver_id),
        message
      }
    });
    
    const formatted = formatMessage(newMessage);

    // Notificar al receptor vía Socket
    req.io.emit('privateMessage', formatted);

    res.status(201).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const u1 = parseInt(user1);
    const u2 = parseInt(user2);

    const messages = await prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId: u1, receiverId: u2 },
          { senderId: u2, receiverId: u1 }
        ],
        AND: [
          {
            OR: [
              { senderId: u1, deletedBySender: null },
              { receiverId: u1, deletedByReceiver: null }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages.map(formatMessage));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.privateMessage.updateMany({
      where: {
        id,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });
    res.json({ message: 'Leído' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
};
