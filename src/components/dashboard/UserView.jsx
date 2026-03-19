import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function UserView({ currentUser }) {
  const { t } = useTranslation();
  const [showEditor, setShowEditor] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [profileImage, setProfileImage] = useState(
    currentUser.profile_image_path 
    ? `http://localhost:3000/${currentUser.profile_image_path}` 
    : null
  );
  const fileInputRef = useRef(null);

  const handleSavePost = async () => {
    if (!postContent.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, post: postContent })
      });
      if (!response.ok) throw new Error('Error al guardar la publicación');
      setMessage({ type: 'success', text: '¡Publicación compartida con éxito! 🚀' });
      setPostContent('');
      setShowEditor(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
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

      if (!response.ok) throw new Error('Error al subir la imagen');
      
      const data = await response.json();
      const newPath = `http://localhost:3000/${data.path}`;
      setProfileImage(newPath);
      
      // Update local storage to persist the image path for this session
      const updatedUser = { ...currentUser, profile_image_path: data.path };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Foto de perfil actualizada ✨' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card bg-primary text-primary-content shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative group">
              <div className="avatar">
                <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl font-bold text-base-content/30">
                      {currentUser.username?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
              >
                <span className="text-xs font-bold text-white">Cambiar</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
              />
            </div>
            <div>
              <h2 className="card-title text-2xl font-bold">¡Bienvenido de nuevo!</h2>
              <span className="badge badge-secondary badge-sm">{currentUser.role}</span>
            </div>
          </div>

          <p className="opacity-80">Aquí puedes expresarte y ver tu actividad reciente.</p>
          
          <div className="mt-6 p-4 bg-primary-focus/30 rounded-xl border border-white/10">
            {!showEditor ? (
              <button onClick={() => setShowEditor(true)} className="btn btn-secondary w-full gap-2 shadow-lg">
                <span className="text-xl">+</span> Nueva publicación
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <textarea 
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content text-lg min-h-[120px]" 
                  placeholder="¿Qué tienes en mente? (puedes usar emojis 😊)"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                ></textarea>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowEditor(false)} className="btn btn-ghost btn-sm" disabled={loading}>Cancelar</button>
                  <button onClick={handleSavePost} className={`btn btn-secondary btn-sm ${loading ? 'loading' : ''}`} disabled={loading || !postContent.trim()}>Guardar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          <h2 className="card-title flex justify-between">
            Resumen de Cuenta
            {message && (
              <span className={`text-xs px-2 py-1 rounded animate-pulse ${message.type === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                {message.text}
              </span>
            )}
          </h2>
          <div className="stats stats-vertical shadow mt-4">
            <div className="stat">
              <div className="stat-title text-base-content/60">Edad Registrada</div>
              <div className="stat-value text-2xl">{currentUser.age || 'N/A'} {t('common.years')}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-base-content/60">Género</div>
              <div className="stat-value text-2xl uppercase">{currentUser.gender || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserView;
