import React, { useState, useEffect, useRef } from 'react';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);

  const emojiGroups = [
    { label: 'Caras', emojis: ['😀', '😂', '😍', '🥰', '😎', '🤔', '😊', '🥳', '🤩', '🙄', '😏', '😴'] },
    { label: 'Gestos', emojis: ['👍', '🙌', '👏', '🤝', '👊', '✌️', '🤞', '🙏', '💪', '👋', '🤳', '📍'] },
    { label: 'Corazones', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕'] },
    { label: 'Otros', emojis: ['🔥', '✨', '🎉', '🚀', '💯', '✅', '🌈', '⭐', '🎈', '🎁', '⚡', '💡'] }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowEmojiPicker(false);
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

  const addEmoji = (emoji) => {
    setPostContent(prev => prev + emoji);
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
          onDeleteFriends={social.handleDeleteFriends}
        />
        {msg && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} text-white text-xs p-2`}>{msg.text}</div>}
      </div>

      <div className="lg:col-span-2 space-y-6">
        {showEditor && (
          <div className="card bg-base-100 shadow-xl border border-primary/10 overflow-visible animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="card-body p-4 relative">
              <textarea 
                className="textarea textarea-bordered w-full text-lg h-32 focus:outline-none focus:border-primary transition-colors" 
                placeholder="¿Qué tienes en mente?" 
                value={postContent} 
                onChange={(e) => setPostContent(e.target.value)} 
                autoFocus
              />
              
              <div className="flex justify-between items-center mt-3 border-t border-base-200 pt-3">
                <div className="relative" ref={pickerRef}>
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    className={`btn btn-circle btn-ghost btn-sm text-xl transition-transform hover:scale-110 ${showEmojiPicker ? 'bg-base-200 text-primary' : ''}`}
                    title="Añadir emoji"
                  >
                    😊
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute left-0 top-full mt-3 bg-base-100 shadow-2xl border border-base-300 rounded-2xl p-4 z-[100] w-64 animate-in zoom-in-95 duration-200 origin-top-left">
                      <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {emojiGroups.map(group => (
                          <div key={group.label} className="mb-4 last:mb-0">
                            <p className="text-[10px] uppercase font-bold text-base-content/50 mb-2 px-1 tracking-wider">{group.label}</p>
                            <div className="grid grid-cols-6 gap-1">
                              {group.emojis.map(e => (
                                <button 
                                  key={e} 
                                  onClick={() => addEmoji(e)}
                                  className="btn btn-ghost btn-square btn-xs text-lg hover:bg-primary/20 hover:scale-110 transition-all p-0 h-8 w-8"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Arrow indicator */}
                      <div className="absolute -top-2 left-4 w-4 h-4 bg-base-100 border-l border-t border-base-300 rotate-45"></div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setShowEditor(false); setShowEmojiPicker(false); }} className="btn btn-ghost btn-sm rounded-lg px-4">Cancelar</button>
                  <button onClick={handleSavePost} className="btn btn-primary btn-sm rounded-lg px-6 shadow-md shadow-primary/20" disabled={!postContent.trim()}>Publicar</button>
                </div>
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
