import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminCategories } from '../components/admin/AdminCategories';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminVideos } from '../components/admin/AdminVideos';
import { AdminStoreCMS } from '../components/admin/AdminStoreCMS';
import { AdminTheme } from '../components/admin/AdminTheme';
import { AdminMediaLibrary } from '../components/admin/AdminMediaLibrary';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminSystemHealth } from '../components/admin/AdminSystemHealth';

export const AdminView: React.FC = () => {
  const { user, loading } = useAuth();
  const { adminSection, setAdminSection } = useApp();

  // Route protection
  useEffect(() => {
    if (!loading && !user && adminSection !== 'login') {
      setAdminSection('login');
    }
  }, [user, loading, adminSection, setAdminSection]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Authenticating Secure Admin Session...
        </span>
      </div>
    );
  }

  // Section 5.4.1: If unauthenticated, render strict Admin Login
  if (!user || adminSection === 'login') {
    return <AdminLogin />;
  }

  // Render Protected Admin Modules inside AdminLayout
  const renderAdminModule = () => {
    switch (adminSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'categories':
        return <AdminCategories />;
      case 'products':
        return <AdminProducts />;
      case 'videos':
        return <AdminVideos />;
      case 'store':
        return <AdminStoreCMS />;
      case 'theme':
        return <AdminTheme />;
      case 'media':
        return <AdminMediaLibrary />;
      case 'health':
        return <AdminSystemHealth />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return <AdminLayout>{renderAdminModule()}</AdminLayout>;
};
