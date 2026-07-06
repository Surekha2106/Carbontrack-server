import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Activity, 
  Target, 
  Award, 
  BarChart3, 
  Trophy, 
  Users, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Activity size={20} />, label: 'Activities', path: '/activities' },
  { icon: <Target size={20} />, label: 'Goals', path: '/goals' },
  { icon: <Award size={20} />, label: 'Badges', path: '/badges' },
  { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/analytics' },
  { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/leaderboard' },
  { icon: <Users size={20} />, label: 'Community', path: '/community' },
];

const BOTTOM_ITEMS = [
  { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface/50 backdrop-blur-xl border-r border-border">
      <div className="h-20 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/50">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CarbonTrack</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 px-2">Menu</div>
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-accent/10 text-accent font-medium border border-accent/20' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className="mt-8 mb-4 px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">System</div>
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-accent/10 text-accent font-medium border border-accent/20' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden text-text-primary">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        {/* Top Navigation */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-4 lg:px-8 bg-surface/30 backdrop-blur-md border-b border-border z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg bg-glass border border-border lg:hidden text-text-secondary hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/40 border border-border rounded-full w-80">
              <Search size={18} className="text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-text-secondary"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-text-secondary hover:text-white">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
                <div className="text-xs text-text-secondary">Level 12 Eco-Warrior</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-blue-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-surface border-2 border-surface flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};
