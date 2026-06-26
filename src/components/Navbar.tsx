import React, { useState } from 'react';
import { 
  Building2, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Clock 
} from 'lucide-react';
import { User as UserType, Notification } from '../types';

interface NavbarProps {
  user: UserType | null;
  notifications: Notification[];
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onMarkNotificationsRead: () => void;
}

export default function Navbar({ 
  user, 
  notifications, 
  onLogout, 
  onNavigate,
  onMarkNotificationsRead 
}: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  const handleNotificationClick = (n: Notification) => {
    setShowNotifMenu(false);
    onNavigate('my-reports'); // navigate to details
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'escalation':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'verification_request':
        return <Flame className="w-5 h-5 text-amber-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E2E8F0] z-50 shadow-sm" id="navbar">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-[#2563EB] text-white p-2 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-[#0F172A] tracking-tight">CIVIX <span className="text-[#2563EB]">AI</span></span>
        </div>

        {/* Desktop Links & Controls */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <button 
                onClick={() => onNavigate(user.role === 'citizen' ? 'citizen-dashboard' : 'authority-dashboard')}
                className="text-sm font-semibold text-[#475569] hover:text-[#2563EB] transition-colors duration-150"
              >
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate('community-feed')}
                className="text-sm font-semibold text-[#475569] hover:text-[#2563EB] transition-colors duration-150"
              >
                Community Feed
              </button>
              <button 
                onClick={() => onNavigate('live-map')}
                className="text-sm font-semibold text-[#475569] hover:text-[#2563EB] transition-colors duration-150"
              >
                Live Map
              </button>
              {user.role === 'citizen' && (
                <button 
                  onClick={() => onNavigate('report-issue')}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
                >
                  Report Issue
                </button>
              )}

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    setShowProfileMenu(false);
                    if (!showNotifMenu && unreadCount > 0) {
                      onMarkNotificationsRead();
                    }
                  }}
                  className="relative p-2 text-[#475569] hover:text-[#0F172A] rounded-full hover:bg-slate-50 transition-colors duration-150"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-xs text-blue-600 font-semibold cursor-pointer" onClick={onMarkNotificationsRead}>
                          Mark all as read
                        </span>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        You're all caught up! 🎉
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex space-x-3 transition ${!n.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifMenu(false);
                  }}
                  className="flex items-center space-x-2 border border-slate-200 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-700 hidden lg:inline">{user.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{user.role}</p>
                    </div>
                    <button 
                      onClick={() => { setShowProfileMenu(false); onNavigate('profile'); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button 
                      onClick={() => { setShowProfileMenu(false); onLogout(); }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('landing')}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
              >
                Features
              </button>
              <button 
                onClick={() => onNavigate('auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          {user && (
            <button 
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                if (!showNotifMenu && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="relative p-2 text-slate-500 rounded-full hover:bg-slate-100 transition"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 rounded-xl hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-md">
          {user ? (
            <>
              <div className="pb-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate(user.role === 'citizen' ? 'citizen-dashboard' : 'authority-dashboard'); }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                Dashboard
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate('community-feed'); }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                Community Feed
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate('live-map'); }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                Live Map
              </button>
              {user.role === 'citizen' && (
                <button 
                  onClick={() => { setMobileMenuOpen(false); onNavigate('report-issue'); }}
                  className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  Report Issue
                </button>
              )}
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate('profile'); }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                My Profile
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="block w-full text-left py-2 text-sm font-bold text-rose-600"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate('landing'); }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Features
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate('auth'); }}
                className="w-full bg-blue-600 text-white font-bold text-center py-2.5 rounded-xl block"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
