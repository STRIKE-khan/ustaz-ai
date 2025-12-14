import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Award,
  CalendarCheck,
  LogOut,
  Bell,
  BookOpen
} from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  teacherName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, teacherName }) => {
  const menuItems = [
    { id: 'DASHBOARD' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ADD_CLASS' as AppView, label: 'Manage Classes', icon: Users },
    { id: 'ATTENDANCE' as AppView, label: 'Attendance', icon: CalendarCheck },
    { id: 'CREATE_TEST' as AppView, label: 'Class Test', icon: FileSpreadsheet },
    { id: 'PAPER_RESULT' as AppView, label: 'Exam Result', icon: Award },
    { id: 'NOTICES' as AppView, label: 'Notice Board', icon: Bell },
    { id: 'HOMEWORK' as AppView, label: 'Homework Diary', icon: BookOpen },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white h-screen flex flex-col fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-yellow-400">Ustaz</span>.AI
          <span className="text-xs text-indigo-300 font-normal border border-indigo-300 px-1 rounded">RWS</span>
        </h1>
        <p className="text-indigo-300 text-sm mt-1">Welcome, {teacherName}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${currentView === item.id
              ? 'bg-indigo-700 text-white shadow-lg translate-x-1'
              : 'text-indigo-200 hover:bg-indigo-800 hover:text-white hover:translate-x-1'
              }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/20 hover:text-red-200 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;