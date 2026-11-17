import React, { useState, useEffect } from 'react';
import { Shield, Users, Package, Settings, Logs, BarChart3, Lock, Unlock, AlertCircle, ChevronLeft } from 'lucide-react';
import { AdminPermissions, StoredUserAccount } from '../../server/types';

// Simplified admin layout
export const AdminLayout: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex overflow-hidden">
      <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 font-black text-amber-500 text-xl">DROP CONTROL</div>
        <nav className="flex-1 p-2 space-y-1">
          <button onClick={onClose} className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white mb-4">
            <ChevronLeft className="w-4 h-4" /> На сайт
          </button>
          {/* Menu items will be added here */}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-black p-6">{children}</main>
    </div>
  );
};
