import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function AdminView({ users, onConfirmDelete }) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover">
                <th className="pl-6 font-mono opacity-50">#{u.id}</th>
                <td className="font-semibold text-base">{u.username}</td>
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
    </div>
  );
}

export default AdminView;
