import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocial } from '../../hooks/useSocial';
import ProfileCard from './ProfileCard';
import FriendshipPanel from './FriendshipPanel';
import PostCard from './PostCard';
import ChatWindow from './ChatWindow';

function UserView({ currentUser }) {
  const { i18n } = useTranslation();
  const social = useSocial(currentUser);
  const [showEditor, setShowEditor] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [msg, setMsg] = useState(null);
  const [openChats, setOpenChats] = useState([]); // Array of friends

  const handleFriendStatus = async (id, status) => {
    await fetch(`http://localhost:3000/api/friendships/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    social.fetchFriendData();
  };

  const handleAddFriend = async (username) => {
    const res = await fetch('http://localhost:3000/api/friendships/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requester_id: currentUser.id, addressee_username: username })
    });
    const data = await res.json();
    setMsg({ type: res.ok ? 'success' : 'error', text: res.ok ? 'Solicitud enviada' : data.error });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSavePost = async () => {
    const res = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id, post: postContent })
    });
    if (res.ok) {
      setPostContent('');
      setShowEditor(false);
      social.fetchFeed();
    }
  };

  const openChat = (friend) => {
    if (!openChats.find(c => c.friend_id === friend.friend_id)) {
      setOpenChats(prev => [...prev, { ...friend, isOpen: true }]);
    } else {
      setOpenChats(prev => prev.map(c => c.friend_id === friend.friend_id ? { ...c, isOpen: true } : c));
    }
    social.clearNotification(friend.friend_id);
  };

  const closeChat = (friendId) => {
    setOpenChats(prev => prev.filter(c => c.friend_id !== friendId));
    social.clearNotification(friendId);
  };

  const toggleChatMinimize = (friendId) => {
    setOpenChats(prev => prev.map(c => c.friend_id === friendId ? { ...c, isOpen: !c.isOpen } : c));
  };

  // Logic for incoming notifications
  useEffect(() => {
    social.notifications.forEach(senderId => {
      const friend = social.friendsList.find(f => f.friend_id === senderId);
      if (friend && !openChats.find(c => c.friend_id === senderId)) {
        setOpenChats(prev => [...prev, { ...friend, isOpen: false }]);
      }
    });
  }, [social.notifications, social.friendsList, openChats]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative pb-20">
      <div className="space-y-6">
        <ProfileCard currentUser={currentUser} onPostCreate={() => setShowEditor(true)} />
        <FriendshipPanel 
          currentUser={currentUser} 
          friendRequests={social.friendRequests} 
          friendsList={social.friendsList} 
          onlineUsers={social.onlineUsers} 
          onStatusUpdate={handleFriendStatus} 
          onAddFriend={handleAddFriend} 
          onSelectFriend={openChat}
        />
        {msg && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} text-white text-xs p-2`}>{msg.text}</div>}
      </div>

      <div className="lg:col-span-2 space-y-6">
        {showEditor && (
          <div className="card bg-base-100 shadow-lg border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="card-body p-4">
              <textarea className="textarea textarea-bordered w-full text-lg h-32" placeholder="¿Qué quieres compartir?" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
              <div className="card-actions justify-end mt-2">
                <button onClick={() => setShowEditor(false)} className="btn btn-ghost btn-sm">Cancelar</button>
                <button onClick={handleSavePost} className="btn btn-primary btn-sm" disabled={!postContent.trim()}>Publicar</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {social.posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={currentUser} 
              onlineUsers={social.onlineUsers} 
              onLike={social.handleLike} 
              onComment={social.handleComment} 
              onDelete={social.handleDeletePost} 
              language={i18n.language} 
            />
          ))}
        </div>
      </div>

      {/* Multiple Chat Windows */}
      <div className="fixed bottom-0 right-0 flex flex-row-reverse items-end px-4 gap-2 z-50 pointer-events-none">
        {openChats.map((chat, index) => (
          <div key={chat.friend_id} className="pointer-events-auto">
            {chat.isOpen ? (
              <ChatWindow 
                currentUser={currentUser} 
                friend={chat} 
                onClose={() => closeChat(chat.friend_id)}
                onMinimize={() => toggleChatMinimize(chat.friend_id)}
              />
            ) : (
              <div 
                onClick={() => openChat(chat)}
                className={`bg-primary text-primary-content p-3 rounded-t-lg shadow-lg cursor-pointer flex items-center gap-2 w-48 border-x border-t border-white/20 transition-all hover:-translate-y-1 ${social.notifications.includes(chat.friend_id) ? 'ring-2 ring-secondary shadow-primary/50' : ''}`}
              >
                <div className="avatar avatar-xs">
                  <div className="w-6 rounded-full bg-base-300">
                    {chat.profile_image_path && <img src={`http://localhost:3000/${chat.profile_image_path}`} />}
                  </div>
                </div>
                <span className="text-xs font-bold truncate flex-1">{chat.username}</span>
                {social.notifications.includes(chat.friend_id) && <span className="badge badge-secondary badge-xs">!</span>}
                <button onClick={(e) => { e.stopPropagation(); closeChat(chat.friend_id); }} className="hover:text-error">✖</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserView;
