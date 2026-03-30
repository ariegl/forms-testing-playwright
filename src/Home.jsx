import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUsers } from './hooks/useUsers';
import { useSocial } from './hooks/useSocial';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminView from './components/dashboard/AdminView';
import UserView from './components/dashboard/UserView';
import ConfirmModal from './components/shared/ConfirmModal';

function Home() {
  const { t } = useTranslation();
  const { users, loading, deleteUser } = useUsers();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const { onlineUsers } = useSocial(currentUser);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const modalRef = useRef(null);

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  const confirmDelete = (id) => {
    setDeleteId(id);
    if (modalRef.current) modalRef.current.showModal();
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId);
      setToast({ type: 'success', message: t('home.deleteSuccess') });
    } catch (err) {
      setToast({ type: 'error', message: t('home.deleteError') + err.message });
    } finally {
      setDeleteId(null);
      if (modalRef.current) modalRef.current.close();
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <span className="loading loading-dots loading-lg text-primary"></span>
    </div>
  );

  return (
    <DashboardLayout currentUser={currentUser} isAdmin={isAdmin}>
      {isAdmin ? (
        <AdminView users={users} onlineUsers={onlineUsers} onConfirmDelete={confirmDelete} />
      ) : (
        <UserView currentUser={currentUser} />
      )}

      <ConfirmModal 
        ref={modalRef} 
        onConfirm={handleDelete} 
        onCancel={() => setDeleteId(null)} 
      />

      {toast && (
        <div className="toast toast-end">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} text-white`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Home;
