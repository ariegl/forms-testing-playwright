import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../ThemeToggle';
import LanguageSelector from '../../LanguageSelector';

function DashboardLayout({ children, currentUser, isAdmin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
