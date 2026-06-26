import React from 'react';
import { 
  Home, 
  PlusCircle, 
  FileText, 
  Users, 
  Map, 
  User, 
  LogOut, 
  SlidersHorizontal, 
  Bot, 
  LineChart, 
  Bell 
} from 'lucide-react';
import { User as UserType, Notification } from '../types';

interface SidebarProps {
  user: UserType | null;
  currentView: string;
  notifications: Notification[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ 
  user, 
  currentView, 
  notifications,
  onNavigate, 
  onLogout 
}: SidebarProps) {
  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const citizenItems = [
    { id: 'citizen-dashboard', label: 'Dashboard', icon: Home },
    { id: 'report-issue', label: 'Report Issue', icon: PlusCircle },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
    { id: 'community-feed', label: 'Community Feed', icon: Users },
    { id: 'live-map', label: 'Live Map', icon: Map },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const authorityItems = [
    { id: 'authority-dashboard', label: 'Dashboard', icon: Home },
    { id: 'manage-issues', label: 'Issue Management', icon: SlidersHorizontal },
    { id: 'analytics', label: 'Analytics Insights', icon: LineChart },
    { id: 'copilot', label: 'Civix Copilot AI', icon: Bot },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminItems = [
    { id: 'admin', label: 'Admin Panel', icon: SlidersHorizontal },
    { id: 'authority-dashboard', label: 'Authority View', icon: Home },
    { id: 'analytics', label: 'Analytics Insights', icon: LineChart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const getMenuItems = () => {
    if (user.role === 'admin') return adminItems;
    if (user.role === 'authority') return authorityItems;
    return citizenItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] fixed left-0 top-16 bottom-0 z-40 hidden md:block py-6 px-4" id="sidebar">
      {/* User Stats Short Card */}
      <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#BFDBFE] text-[#1E3A8A] font-bold flex items-center justify-center text-sm">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#0F172A] leading-tight truncate">{user.name}</h4>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold uppercase tracking-wider rounded-full">
              {user.badge}
            </span>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center text-xs border-t border-[#E2E8F0] pt-3">
          <span className="text-[#64748B] font-medium">Points Balance:</span>
          <span className="font-bold text-[#2563EB] font-mono">{user.points} PTS</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 group ${
                isActive 
                  ? 'bg-[#EFF6FF] text-[#2563EB]' 
                  : 'text-[#475569] hover:bg-gray-50 hover:text-[#0F172A]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 transition-colors duration-150 ${isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-[#475569]'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* Global Notifications sidebar shortcut */}
        <button
          onClick={() => onNavigate('notifications')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 group ${
            currentView === 'notifications' 
              ? 'bg-[#EFF6FF] text-[#2563EB]' 
              : 'text-[#475569] hover:bg-gray-50 hover:text-[#0F172A]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Bell className={`w-5 h-5 transition-colors duration-150 ${currentView === 'notifications' ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-[#475569]'}`} />
            <span>Notifications</span>
          </div>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </nav>

      {/* Logout button at bottom */}
      <div className="absolute bottom-6 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors duration-150"
        >
          <LogOut className="w-5 h-5 text-rose-500" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
