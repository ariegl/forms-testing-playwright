import React from 'react';
import { useTranslation } from 'react-i18next';

function UserView({ currentUser }) {
  const { t } = useTranslation();

  return (
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
  );
}

export default UserView;
