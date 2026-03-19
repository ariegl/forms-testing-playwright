import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

function Home() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios');
      if (!response.ok) throw new Error('Error fetching users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    if (modalRef.current) modalRef.current.showModal();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${deleteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error deleting user');
      setUsers(users.filter(u => u.id !== deleteId));
      setToast({ type: 'success', message: t('home.deleteSuccess') });
    } catch (err) {
      setToast({ type: 'error', message: t('home.deleteError') + err.message });
    } finally {
      setDeleteId(null);
      if (modalRef.current) modalRef.current.close();
    }
  };

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  if (loading) return <div className="flex justify-center items-center h-screen bg-base-200"><span className="loading loading-dots loading-lg text-primary"></span></div>;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-base-content/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-base-content tracking-tight">
              {t('common.hello')}, {currentUser.username || t('common.username')}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-secondary'} badge-sm uppercase font-bold tracking-wider px-3`}>
                {currentUser.role || 'guest'}
              </span>
              <p className="text-base-content/60">{t('common.dashboardDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button onClick={handleLogout} className="btn btn-ghost text-error">{t('common.logout')}</button>
            {isAdmin && (
              <Link to="/signup" className="btn btn-primary gap-2 shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                {t('common.newUser')}
              </Link>
            )}
          </div>
        </div>

        {isAdmin ? (
          <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
            <div className="p-4 border-b border-base-200 bg-base-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold px-2">{t('common.listTitle')}</h2>
              <input type="text" placeholder={t('common.searchPlaceholder')} className="input input-bordered input-sm w-full max-w-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="overflow-x-auto w-full">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200/50 text-base-content/70 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-4 pl-6">ID</th>
                    <th className="py-4">{t('common.username')}</th>
                    <th className="py-4">{t('common.age')}</th>
                    <th className="py-4">{t('common.gender')}</th>
                    <th className="py-4">Rol</th>
                    <th className="py-4">{t('common.registeredDate')}</th>
                    <th className="py-4 pr-6 text-center">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover">
                      <th className="pl-6 font-mono opacity-50">#{u.id}</th>
                      <td className="font-semibold text-base">{u.username}</td>
                      <td>{u.age} {t('common.years')}</td>
                      <td><span className="badge badge-sm font-medium py-3 px-3 badge-info bg-blue-100 text-blue-700 border-transparent">{u.gender === 'male' ? t('common.male') : u.gender === 'female' ? t('common.female') : t('common.other')}</span></td>
                      <td><span className="badge badge-outline badge-xs">{u.role}</span></td>
                      <td>{u.registered_date ? new Date(u.registered_date).toLocaleString(i18n.language) : 'N/A'}</td>
                      <td className="pr-6 text-center">
                        <button onClick={() => confirmDelete(u.id)} className="btn btn-ghost btn-sm text-error">{t('common.actions.delete')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-primary text-primary-content shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl font-bold">¡Bienvenido de nuevo!</h2>
                <p>Tu cuenta tiene privilegios de <strong>{currentUser.role}</strong>.</p>
                <p className="mt-4 opacity-80">Aquí puedes ver un resumen de tu perfil y actividad reciente.</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-secondary">Editar Perfil</button>
                </div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body">
                <h2 className="card-title">Resumen de Cuenta</h2>
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
        )}
      </div>

      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">{t('common.confirmDelete')}</h3>
          <div className="modal-action">
            <button className="btn btn-ghost mr-2" onClick={() => setDeleteId(null)}>{t('common.cancel')}</button>
            <button className="btn btn-error" onClick={handleDelete}>{t('common.yesDelete')}</button>
          </div>
        </div>
      </dialog>

      {toast && <div className="toast toast-end"><div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} text-white`}><span>{toast.message}</span></div></div>}
    </div>
  );
}

export default Home;
