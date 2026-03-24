import React, { useState, useRef } from 'react';
import ImageCropper from '../shared/ImageCropper';

function ProfileCard({ currentUser, onPostCreate }) {
  const [profileImage, setProfileImage] = useState(
    currentUser.profile_image_path ? `http://localhost:3000/${currentUser.profile_image_path}` : null
  );
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setTempImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setTempImage(null);
    const formData = new FormData();
    formData.append('image', croppedBlob, 'profile.jpg');
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${currentUser.id}/profile-image`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProfileImage(`http://localhost:3000/${data.path}`);
        localStorage.setItem('user', JSON.stringify({ ...currentUser, profile_image_path: data.path }));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="card bg-primary text-primary-content shadow-xl">
      <div className="card-body p-6">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300 relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              {profileImage ? <img src={profileImage} alt="Profile" className="object-cover" /> : <div className="flex items-center justify-center h-full text-xl font-bold">{currentUser.username?.[0].toUpperCase()}</div>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white transition-opacity">Cambiar</div>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-lg">{currentUser.username}</h2>
            <span className="badge badge-secondary badge-xs uppercase font-bold">{currentUser.role}</span>
          </div>
        </div>
        <button onClick={onPostCreate} className="btn btn-secondary btn-sm w-full mt-4 shadow-lg">+ Nueva Publicación</button>
      </div>

      {tempImage && (
        <ImageCropper 
          image={tempImage} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setTempImage(null)} 
        />
      )}
    </div>
  );
}

export default ProfileCard;
