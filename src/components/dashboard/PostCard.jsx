import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LinkifiedText from '../shared/LinkifiedText';

function PostCard({ post, currentUser, onlineUsers, onLike, onComment, onDelete, language }) {
  const { t } = useTranslation();
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
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
              </div>
              <div className="text-[10px] opacity-40">{new Date(post.posted_date).toLocaleString(language)}</div>
            </div>
          </div>
          {post.user_id === currentUser.id && <button onClick={() => onDelete(post.id)} className="btn btn-ghost btn-xs text-error opacity-30 hover:opacity-100">{t('common.actions.delete')}</button>}
        </div>
        <p className="text-base mb-4 whitespace-pre-wrap"><LinkifiedText text={post.content} isPrimary={true} /></p>
        <div className="flex items-center gap-6 border-t border-base-200 pt-3">
          <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 group hover:text-error transition-colors">
            <span className="text-xl">❤</span> <span className="text-sm font-semibold">{post.likes_count}</span>
          </button>
          <div className="flex items-center gap-1.5"><span className="text-xl">💬</span> <span className="text-sm font-semibold">{post.comments.length}</span></div>
        </div>
        {post.comments.length > 0 && (
          <div className="mt-4 space-y-2 bg-base-200/40 p-3 rounded-lg border border-base-200">
            {post.comments.map(c => (
              <div key={c.id} className="text-xs leading-relaxed"><span className="font-bold text-primary mr-1.5">{c.commenter_name}:</span><span className="opacity-80"><LinkifiedText text={c.comment} /></span></div>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <input type="text" className="input input-bordered input-sm flex-1 bg-base-50" placeholder={t('social.commentPlaceholder')} value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyPress={handleCommentSubmit} />
          <button onClick={handleCommentSubmit} className="btn btn-primary btn-sm px-4">{t('common.send')}</button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
