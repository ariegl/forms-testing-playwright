import { useState, useEffect, useCallback } from 'react';
import socket from '../socket';

export function useSocial(currentUser) {
  const [posts, setPosts] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/posts');
      if (response.ok) setPosts(await response.json());
    } catch (err) { console.error(err); }
  }, []);

  const fetchFriendData = useCallback(async () => {
    try {
      const [reqRes, listRes] = await Promise.all([
        fetch(`http://localhost:3000/api/friendships/requests/${currentUser.id}`),
        fetch(`http://localhost:3000/api/friendships/list/${currentUser.id}`)
      ]);
      if (reqRes.ok) setFriendRequests(await reqRes.json());
      if (listRes.ok) setFriendsList(await listRes.json());
    } catch (err) { console.error(err); }
  }, [currentUser.id]);

  useEffect(() => {
    fetchFeed();
    fetchFriendData();
    socket.connect();
    socket.emit('register', currentUser.id);

    socket.on('newPost', fetchFeed);
    socket.on('updateLikes', fetchFeed);
    socket.on('newComment', fetchFeed);
    socket.on('friendRequestUpdate', (data) => {
      if (data.to === currentUser.id) fetchFriendData();
    });
    socket.on('userStatusChange', setOnlineUsers);

    socket.on('privateMessage', (msg) => {
      if (msg.receiver_id === currentUser.id) {
        setNotifications(prev => {
          if (!prev.includes(msg.sender_id)) return [...prev, msg.sender_id];
          return prev;
        });
      }
    });

    return () => {
      socket.off('newPost');
      socket.off('updateLikes');
      socket.off('newComment');
      socket.off('friendRequestUpdate');
      socket.off('userStatusChange');
      socket.off('privateMessage');
    };
  }, [currentUser.id, fetchFeed, fetchFriendData]);

  const handleLike = (postId) => {
    fetch(`http://localhost:3000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id })
    });
  };

  const handleComment = async (postId, comment) => {
    if (!comment.trim()) return;
    const res = await fetch(`http://localhost:3000/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id, comment })
    });
    return res.ok;
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Seguro?')) return;
    await fetch(`http://localhost:3000/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id })
    });
  };

  const clearNotification = (senderId) => {
    setNotifications(prev => prev.filter(id => id !== senderId));
  };

  return {
    posts, friendRequests, friendsList, onlineUsers, notifications, loading, setLoading,
    fetchFeed, fetchFriendData, handleLike, handleComment, handleDeletePost, clearNotification
  };
}
