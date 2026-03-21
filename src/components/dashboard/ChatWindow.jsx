import React, { useState, useEffect, useRef } from 'react';
import socket from '../../socket';

function ChatWindow({ currentUser, friend, onClose, onMinimize }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setPostText] = useState('');
  const scrollRef = useRef();

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/messages/${currentUser.id}/${friend.friend_id}`);
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchMessages();
    
    const handleNewMessage = (msg) => {
      if ((msg.sender_id === friend.friend_id && msg.receiver_id === currentUser.id) ||
          (msg.sender_id === currentUser.id && msg.receiver_id === friend.friend_id)) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('privateMessage', handleNewMessage);
    return () => socket.off('privateMessage', handleNewMessage);
  }, [friend.friend_id, currentUser.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (!inputText.trim()) return;
      const text = inputText;
      setPostText('');
      await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: currentUser.id, receiver_id: friend.friend_id, message: text })
      });
    }
  };

  return (
    <div className="w-80 h-96 bg-base-100 shadow-2xl rounded-t-xl border border-primary/20 flex flex-col overflow-hidden">
      <div className="bg-primary p-3 text-primary-content flex justify-between items-center shadow-md cursor-pointer" onClick={onMinimize}>
        <div className="flex items-center gap-2">
          <div className="avatar avatar-xs">
            <div className="w-6 rounded-full bg-base-300">
              {friend.profile_image_path && <img src={`http://localhost:3000/${friend.profile_image_path}`} />}
            </div>
          </div>
          <span className="font-bold text-sm">{friend.username}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="btn btn-ghost btn-xs text-white">_</button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="btn btn-ghost btn-xs text-white">✖</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-base-200/30">
        {messages.map(m => (
          <div key={m.id} className={`chat ${m.sender_id === currentUser.id ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
              <div className="w-8 rounded-full bg-base-300 shadow-sm border border-base-100">
                {m.sender_id === currentUser.id ? (
                  currentUser.profile_image_path && <img src={`http://localhost:3000/${currentUser.profile_image_path}`} />
                ) : (
                  friend.profile_image_path && <img src={`http://localhost:3000/${friend.profile_image_path}`} />
                )}
              </div>
            </div>
            <div className={`chat-bubble text-xs min-h-0 py-2 px-3 ${m.sender_id === currentUser.id ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
              {m.message}
            </div>
            <div className="chat-footer opacity-40 text-[9px] mt-1 px-1">
              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-2 bg-base-100 border-t border-base-200 flex gap-2">
        <input 
          type="text" 
          className="input input-bordered input-sm flex-1 text-xs" 
          placeholder="Escribe un mensaje..."
          value={inputText}
          onChange={(e) => setPostText(e.target.value)}
          onKeyPress={handleSend}
        />
        <button onClick={handleSend} className="btn btn-primary btn-sm px-3">🚀</button>
      </div>
    </div>
  );
}

export default ChatWindow;
