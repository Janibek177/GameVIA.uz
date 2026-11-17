import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { fetchAdminStats } from '../../utils/api';

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white p-6">Загрузка...</div>;
  if (!stats) return <div className="text-rose-400 p-6">Ошибка загрузки данных или нет доступа.</div>;

  return (
    <AdminLayout onClose={onClose}>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f1422] p-4 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-sm">Всего пользователей</div>
          <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
        </div>
        <div className="bg-[#0f1422] p-4 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-sm">Активных (7 дней)</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.activeUsers}</div>
        </div>
        <div className="bg-[#0f1422] p-4 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-sm">Заблокированных</div>
          <div className="text-2xl font-bold text-rose-400">{stats.bannedUsers}</div>
        </div>
        <div className="bg-[#0f1422] p-4 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-sm">Открыто кейсов</div>
          <div className="text-2xl font-bold text-amber-400">{stats.totalOpens}</div>
        </div>
      </div>
    </AdminLayout>
  );
};
