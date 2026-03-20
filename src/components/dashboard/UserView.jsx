import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function UserView({ currentUser }) {
  const { t, i18n } = useTranslation();
  const [showEditor, setShowEditor] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [profileImage, setProfileImage] = useState(
    currentUser.profile_image_path 
    ? `http://localhost:3000/${currentUser.profile_image_path}` 
    : null
  );
  const fileInputRef = useRef(null);

  const fetchFriendData = async () => {
    try {
      const [reqRes, listRes] = await Promise.all([
        fetch(`http://localhost:3000/api/friendships/requests/${currentUser.id}`),
        fetch(`http://localhost:3000/api/friendships/list/${currentUser.id}`)
      ]);
      if (reqRes.ok) setFriendRequests(await reqRes.json());
      if (listRes.ok) setFriendsList(await listRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleFriendStatus = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/friendships/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) fetchFriendData();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeed = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/posts');
      if (!response.ok) throw new Error('Error al cargar el feed');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchFriendData();

    // Register user for online status
    socket.emit('register', currentUser.id);

    // Socket listeners
    socket.on('newPost', fetchFeed);
    socket.on('updateLikes', fetchFeed);
    socket.on('newComment', fetchFeed);
    socket.on('friendRequestUpdate', (data) => {
      if (data.to === currentUser.id) fetchFriendData();
    });
    socket.on('userStatusChange', (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });

    return () => {
      socket.off('newPost');
      socket.off('updateLikes');
      socket.off('newComment');
      socket.off('friendRequestUpdate');
      socket.off('userStatusChange');
    };
  }, [currentUser.id]);

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/friendships/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester_id: currentUser.id, addressee_username: friendUsername })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al enviar solicitud');
      setMessage({ type: 'success', text: '¡Solicitud enviada! ✉' });
      setFriendUsername('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSavePost = async () => {
    if (!postContent.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, post: postContent })
      });
      if (response.ok) {
        setPostContent('');
        setShowEditor(false);
        fetchFeed();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id })
    });
  };

  const handleComment = async (postId) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;
    const response = await fetch(`http://localhost:3000/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id, comment })
    });
    if (response.ok) setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Seguro?')) return;
    await fetch(`http://localhost:3000/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id })
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${currentUser.id}/profile-image`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setProfileImage(`http://localhost:3000/${data.path}`);
        localStorage.setItem('user', JSON.stringify({ ...currentUser, profile_image_path: data.path }));
        fetchFeed();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar: Left - Profile & Friends */}
      <div className="space-y-6">
        <div className="card bg-primary text-primary-content shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-4">
              <div className="avatar">
                <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300 relative group">
                  {profileImage ? <img src={profileImage} alt="Profile" /> : <div className="flex items-center justify-center h-full text-xl font-bold">{currentUser.username?.[0].toUpperCase()}</div>}
                  <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white">Cambiar</button>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
              </div>
              <div>
                <h2 className="font-bold">{currentUser.username}</h2>
                <span className="badge badge-secondary badge-xs uppercase">{currentUser.role}</span>
              </div>
            </div>
            <button onClick={() => setShowEditor(true)} className="btn btn-secondary btn-sm w-full">+ Nueva Publicación</button>
          </div>
        </div>

        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-4">
              <h3 className="text-sm font-bold flex items-center gap-2">Solicitudes <span className="badge badge-primary badge-sm">{friendRequests.length}</span></h3>
              <div className="space-y-3 mt-2">
                {friendRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between gap-2 bg-base-200 p-2 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="avatar"><div className="w-8 rounded-full bg-base-300">{req.profile_image_path && <img src={`http://localhost:3000/${req.profile_image_path}`} />}</div></div>
                      <span className="text-xs font-bold truncate">{req.username}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleFriendStatus(req.id, 'accepted')} className="btn btn-success btn-xs">✔</button>
                      <button onClick={() => handleFriendStatus(req.id, 'rejected')} className="btn btn-error btn-xs">✖</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Friends List Section */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-4">
            <h3 className="text-sm font-bold">Amigos</h3>
            <div className="space-y-3 mt-2">
              {friendsList.length === 0 && <p className="text-xs opacity-50">Aún no tienes amigos.</p>}
              {friendsList.map(f => (
                <div key={f.friend_id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`avatar ${onlineUsers.includes(f.friend_id) ? 'online' : 'offline'}`}>
                      <div className="w-8 rounded-full bg-base-300">{f.profile_image_path && <img src={`http://localhost:3000/${f.profile_image_path}`} />}</div>
                    </div>
                    <span className="text-xs font-medium">{f.username}</span>
                  </div>
                  <span className={`text-[10px] ${onlineUsers.includes(f.friend_id) ? 'text-success' : 'opacity-40'}`}>
                    {onlineUsers.includes(f.friend_id) ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-base-200 pt-4">
              <div className="flex gap-1">
                <input type="text" placeholder="Agregar por user..." className="input input-bordered input-xs flex-1" value={friendUsername} onChange={(e) => setFriendUsername(e.target.value)} />
                <button onClick={handleAddFriend} className="btn btn-primary btn-xs" disabled={!friendUsername.trim()}>+</button>
              </div>
              {message && <p className={`text-[10px] mt-1 ${message.type === 'success' ? 'text-success' : 'text-error'}`}>{message.text}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Social Feed */}
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
          {posts.map(post => (
            <div key={post.id} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`avatar ${onlineUsers.includes(post.user_id) ? 'online' : ''}`}>
                      <div className="w-10 rounded-full bg-base-300">
                        {post.profile_image_path ? <img src={`http://localhost:3000/${post.profile_image_path}`} alt={post.username} /> : <div className="flex items-center justify-center h-full font-bold text-base-content/40">{post.username[0].toUpperCase()}</div>}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight flex items-center gap-2">
                        {post.username}
                        {onlineUsers.includes(post.user_id) && <span className="w-2 h-2 rounded-full bg-success"></span>}
                      </div>
                      <div className="text-[10px] opacity-40">{new Date(post.posted_date).toLocaleString(i18n.language)}</div>
                    </div>
                  </div>
                  {post.user_id === currentUser.id && <button onClick={() => handleDeletePost(post.id)} className="btn btn-ghost btn-xs text-error opacity-30 hover:opacity-100">Eliminar</button>}
                </div>
                <p className="text-base mb-4 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-6 border-t border-base-200 pt-3">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 group hover:text-error transition-colors">
                    <span className="text-xl">❤</span> <span className="text-sm font-semibold">{post.likes_count}</span>
                  </button>
                  <div className="flex items-center gap-1.5"><span className="text-xl">💬</span> <span className="text-sm font-semibold">{post.comments.length}</span></div>
                </div>
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-2 bg-base-200/40 p-3 rounded-lg border border-base-200">
                    {post.comments.map(c => (
                      <div key={c.id} className="text-xs leading-relaxed"><span className="font-bold text-primary mr-1.5">{c.commenter_name}:</span><span className="opacity-80">{c.comment}</span></div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <input type="text" className="input input-bordered input-sm flex-1 bg-base-50" placeholder="Escribe un comentario..." value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)} />
                  <button onClick={() => handleComment(post.id)} className="btn btn-primary btn-sm px-4">Enviar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserView;
