import React, { useState } from 'react';

function FriendshipPanel({ currentUser, friendRequests, friendsList, onlineUsers, onStatusUpdate, onAddFriend, onSelectFriend }) {
  const [friendUsername, setFriendUsername] = useState('');

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
          <h3 className="text-sm font-bold">Amigos</h3>
          <div className="space-y-3 mt-2">
            {friendsList.length === 0 && <p className="text-xs opacity-50">Aún no tienes amigos.</p>}
            {friendsList.map(f => (
              <div 
                key={f.friend_id} 
                className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-base-200 cursor-pointer transition-colors group"
                onClick={() => onSelectFriend(f)}
              >
                <div className="flex items-center gap-2">
                  <div className={`avatar avatar-xs ${onlineUsers.includes(f.friend_id) ? 'online' : 'offline'}`}>
                    <div className="w-8 rounded-full bg-base-300">{f.profile_image_path && <img src={`http://localhost:3000/${f.profile_image_path}`} />}</div>
                  </div>
                  <span className="text-xs font-medium group-hover:text-primary transition-colors">{f.username}</span>
                </div>
                <span className={`text-[10px] ${onlineUsers.includes(f.friend_id) ? 'text-success' : 'opacity-40'}`}>
                  {onlineUsers.includes(f.friend_id) ? 'Online' : 'Offline'}
                </span>
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
    </div>
  );
}

export default FriendshipPanel;
