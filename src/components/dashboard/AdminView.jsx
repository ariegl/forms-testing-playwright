import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function AdminView({ users, onlineUsers, onConfirmDelete }) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const today = new Date().toISOString().split('T')[0];
  const stats = {
    today: users.filter(u => u.registered_date && u.registered_date.startsWith(today)).length,
    total: users.length,
    online: onlineUsers.length,
    offline: users.length - onlineUsers.length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    standard: users.filter(u => u.role !== 'admin' && u.role !== 'super_admin').length
  };

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 items-center text-center">
            <h3 className="text-xs font-bold text-base-content/60 uppercase">{t('common.stats.todayRegistered')}</h3>
            <p className="text-2xl font-black text-primary">{stats.today}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 items-center text-center">
            <h3 className="text-xs font-bold text-base-content/60 uppercase">{t('common.stats.totalUsers')}</h3>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 items-center text-center">
            <h3 className="text-xs font-bold text-base-content/60 uppercase">{t('common.stats.onlineUsers')}</h3>
            <p className="text-2xl font-black text-success">{stats.online}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 items-center text-center">
            <h3 className="text-xs font-bold text-base-content/60 uppercase">{t('common.stats.offlineUsers')}</h3>
            <p className="text-2xl font-black text-error">{stats.offline}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 items-center text-center">
            <h3 className="text-xs font-bold text-base-content/60 uppercase">{t('common.stats.admins')}</h3>
            <p className="text-2xl font-black text-secondary">{stats.admins}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body p-4 items-center text-center">
            <h3 className="text-xs font-bold text-base-content/60 uppercase">{t('common.stats.standardUsers')}</h3>
            <p className="text-2xl font-black text-accent">{stats.standard}</p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
        <div className="p-4 border-b border-base-200 bg-base-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold px-2">{t('common.listTitle')}</h2>
          <input 
            type="text" 
            placeholder={t('common.searchPlaceholder')} 
            className="input input-bordered input-sm w-full max-w-xs" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
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
              {currentUsers.map((u) => (
                <tr key={u.id} className="hover">
                  <th className="pl-6 font-mono opacity-50">#{u.id}</th>
                  <td className="font-semibold text-base">
                    {u.username}
                    {onlineUsers.includes(u.id) && (
                      <span className="ml-2 badge badge-success badge-xs"></span>
                    )}
                  </td>
                  <td>{u.age} {t('common.years')}</td>
                  <td>
                    <span className="badge badge-sm font-medium py-3 px-3 badge-info bg-blue-100 text-blue-700 border-transparent">
                      {u.gender === 'male' ? t('common.male') : u.gender === 'female' ? t('common.female') : t('common.other')}
                    </span>
                  </td>
                  <td><span className="badge badge-outline badge-xs">{u.role}</span></td>
                  <td>{u.registered_date ? new Date(u.registered_date).toLocaleString(i18n.language) : 'N/A'}</td>
                  <td className="pr-6 text-center">
                    <button onClick={() => onConfirmDelete(u.id)} className="btn btn-ghost btn-sm text-error">
                      {t('common.actions.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-base-200 flex justify-center bg-base-50/30">
            <div className="join">
              <button 
                className="join-item btn btn-sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button className="join-item btn btn-sm pointer-events-none">
                {t('common.page')} {currentPage} {t('common.of')} {totalPages}
              </button>
              <button 
                className="join-item btn btn-sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminView;
