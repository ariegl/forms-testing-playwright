import React, { useState, useRef } from 'react';
import ConfirmModal from '../shared/ConfirmModal';

function FriendshipPanel({ currentUser, friendRequests, friendsList, onlineUsers, onStatusUpdate, onAddFriend, onSelectFriend, onDeleteFriends }) {
  const [friendUsername, setFriendUsername] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [deleteCandidate, setDeleteCandidate] = useState(null); // Array of objects { friend_id, username }
  const modalRef = useRef(null);

  const toggleSelect = (e, friendId) => {
    e.stopPropagation();
    setSelectedFriends(prev => 
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  };

  const handleDeleteClick = (e, friend) => {
    e.stopPropagation();
    setDeleteCandidate([{ friend_id: friend.friend_id, username: friend.username }]);
    if (modalRef.current) modalRef.current.showModal();
  };

  const handleBulkDeleteClick = () => {
    const selectedList = friendsList.filter(f => selectedFriends.includes(f.friend_id))
      .map(f => ({ friend_id: f.friend_id, username: f.username }));
    setDeleteCandidate(selectedList);
    if (modalRef.current) modalRef.current.showModal();
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      onDeleteFriends(deleteCandidate.map(f => f.friend_id));
      if (deleteCandidate.length > 1) setSelectedFriends([]);
    }
    setDeleteCandidate(null);
    if (modalRef.current) modalRef.current.close();
  };

  const cancelDelete = () => {
    setDeleteCandidate(null);
    if (modalRef.current) modalRef.current.close();
  };

  return (
    <div className="space-y-6">
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
                    <button onClick={() => onStatusUpdate(req.id, 'accepted')} className="btn btn-success btn-xs">✔</button>
                    <button onClick={() => onStatusUpdate(req.id, 'rejected')} className="btn btn-error btn-xs">✖</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold">Amigos</h3>
            {selectedFriends.length > 0 && (
              <button onClick={handleBulkDeleteClick} className="btn btn-error btn-xs">Eliminar ({selectedFriends.length})</button>
            )}
          </div>
          <div className="space-y-3 mt-2">
            {friendsList.length === 0 && <p className="text-xs opacity-50">Aún no tienes amigos.</p>}
            {friendsList.map(f => (
              <div 
                key={f.friend_id} 
                data-testid={`friend-item-${f.username}`}
                className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-base-200 cursor-pointer transition-colors group"
                onClick={() => onSelectFriend(f)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-xs" 
                    checked={selectedFriends.includes(f.friend_id)}
                    onChange={(e) => toggleSelect(e, f.friend_id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className={`avatar avatar-xs ${onlineUsers.includes(f.friend_id) ? 'online' : 'offline'}`}>
                    <div className="w-8 rounded-full bg-base-300">{f.profile_image_path && <img src={`http://localhost:3000/${f.profile_image_path}`} />}</div>
                  </div>
                  <span className="text-xs font-medium group-hover:text-primary transition-colors truncate">{f.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${onlineUsers.includes(f.friend_id) ? 'text-success' : 'opacity-40'}`}>
                    {onlineUsers.includes(f.friend_id) ? 'Online' : 'Offline'}
                  </span>
                  <button 
                    onClick={(e) => handleDeleteClick(e, f)} 
                    className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 px-1"
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-base-200 pt-4">
            <div className="flex gap-1">
              <input type="text" placeholder="User..." className="input input-bordered input-xs flex-1" value={friendUsername} onChange={(e) => setFriendUsername(e.target.value)} />
              <button onClick={() => { onAddFriend(friendUsername); setFriendUsername(''); }} className="btn btn-primary btn-xs">+</button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        ref={modalRef} 
        onConfirm={confirmDelete} 
        onCancel={cancelDelete}
        title="¿Eliminar de tu lista de amigos?"
      >
        <div className="space-y-3 text-sm">
          <p>
            Estás a punto de eliminar a 
            <span className="font-bold text-primary mx-1">
              {deleteCandidate?.length === 1 ? deleteCandidate[0].username : `${deleteCandidate?.length} amigos`}
            </span> 
            de tu lista de contactos.
          </p>
          <div className="bg-base-200/50 p-3 rounded-lg space-y-2 border border-base-200">
            <p className="flex gap-2"><span>•</span> <span>Se eliminará de tu lista de amigos actual.</span></p>
            <p className="flex gap-2"><span>•</span> <span>El historial de chat se conservará intacto.</span></p>
            <p className="flex gap-2 font-medium"><span>•</span> <span>Podrás volver a enviar una solicitud en cualquier momento.</span></p>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}

export default FriendshipPanel;
