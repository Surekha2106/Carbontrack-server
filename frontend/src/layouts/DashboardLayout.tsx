import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Activity, 
  Award, 
  BarChart3, 
  Users, 
  User, 
  Settings, 
  LogOut,
  Menu,
  Target,
  Trophy,
  Search,
  Bell,
  Leaf,
  Building2,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AIAssistantWidget } from '../components/AIAssistantWidget';

const SIDEBAR_ITEMS = [
  { icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Activity size={18} strokeWidth={1.5} />, label: 'Activities', path: '/activities' },
  { icon: <Target size={18} strokeWidth={1.5} />, label: 'Goals', path: '/goals' },
  { icon: <Award size={18} strokeWidth={1.5} />, label: 'Badges', path: '/badges' },
  { icon: <BarChart3 size={18} strokeWidth={1.5} />, label: 'Analytics', path: '/analytics' },
  { icon: <Trophy size={18} strokeWidth={1.5} />, label: 'Leaderboard', path: '/leaderboard' },
  { icon: <Users size={18} strokeWidth={1.5} />, label: 'Community', path: '/community' },
  { icon: <Building2 size={18} strokeWidth={1.5} />, label: 'Organisation', path: '/organisation' },
];

const BOTTOM_ITEMS = [
  { icon: <User size={18} strokeWidth={1.5} />, label: 'Profile', path: '/profile' },
  { icon: <Settings size={18} strokeWidth={1.5} />, label: 'Settings', path: '/settings' },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'linear-gradient(180deg, var(--moss-900) 0%, var(--moss-950) 100%)',
        borderRight: '1px solid rgba(149,213,178,0.08)',
      }}
    >
      {/* Logo & Corporate Branding Header */}
      <div className="h-24 flex items-center px-8 border-b border-emerald-950/40">
        <div className="flex items-center gap-3">
          {user?.logoUrl ? (
            <img
              src={user.logoUrl}
              alt={user.organisationName || 'Logo'}
              className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1 border border-white/20"
            />
          ) : (
            <div
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: user?.primaryColor ? `${user.primaryColor}25` : 'rgba(149,213,178,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${user?.primaryColor || 'rgba(149,213,178,0.3)'}`
              }}
            >
              <Leaf size={18} color={user?.primaryColor || "var(--leaf-400)"} strokeWidth={1.8} />
            </div>
          )}
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: 17,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              CarbonTrack
            </span>
            {user?.organisationName && (
              <span className="text-[10px] text-emerald-400/90 font-medium tracking-wider uppercase truncate max-w-[140px] flex items-center gap-1">
                <Building2 size={10} /> {user.organisationName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-0.5">
        <div
          style={{
            fontSize: 10,
            fontFamily: 'Mulish, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(213,239,223,0.40)',
            padding: '0 12px',
            marginBottom: 10,
          }}
        >
          Menu
        </div>

        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2.5 group transition-all duration-200 ease-out rounded-xl relative overflow-hidden ${
                isActive
                  ? 'ct-nav-active'
                  : 'ct-nav-inactive'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    transition={{ ease: [0.22, 1, 0.36, 1] as any, duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 28,
                      background: user?.primaryColor || 'var(--leaf-400)',
                      borderRadius: '0 4px 4px 0',
                    }}
                  />
                )}

                <div
                  style={{
                    opacity: isActive ? 1 : 0.75,
                    color: isActive ? (user?.primaryColor || 'var(--leaf-400)') : 'var(--leaf-200)',
                    transition: 'opacity 0.2s, color 0.2s',
                    flexShrink: 0,
                    marginLeft: isActive ? 6 : 2,
                  }}
                  className="group-hover:!opacity-100"
                >
                  {item.icon}
                </div>

                <span
                  style={{
                    fontFamily: 'Mulish, sans-serif',
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#fff' : 'rgba(213,239,223,0.62)',
                    transition: 'color 0.2s, font-weight 0.1s',
                    letterSpacing: '0.01em',
                  }}
                  className="group-hover:!text-[var(--leaf-200)]"
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <div
          style={{
            fontSize: 10,
            fontFamily: 'Mulish, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(213,239,223,0.40)',
            padding: '0 12px',
            marginTop: 32,
            marginBottom: 10,
          }}
        >
          System
        </div>

        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2.5 group transition-all duration-200 ease-out rounded-xl relative overflow-hidden ${
                isActive
                  ? 'ct-nav-active'
                  : 'ct-nav-inactive'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNavSystem"
                    transition={{ ease: [0.22, 1, 0.36, 1] as any, duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 28,
                      background: user?.primaryColor || 'var(--leaf-400)',
                      borderRadius: '0 4px 4px 0',
                    }}
                  />
                )}

                <div
                  style={{
                    opacity: isActive ? 1 : 0.75,
                    color: isActive ? (user?.primaryColor || 'var(--leaf-400)') : 'var(--leaf-200)',
                    transition: 'opacity 0.2s, color 0.2s',
                    flexShrink: 0,
                    marginLeft: isActive ? 6 : 2,
                  }}
                  className="group-hover:!opacity-100"
                >
                  {item.icon}
                </div>

                <span
                  style={{
                    fontFamily: 'Mulish, sans-serif',
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#fff' : 'rgba(213,239,223,0.62)',
                    transition: 'color 0.2s',
                    letterSpacing: '0.01em',
                  }}
                  className="group-hover:!text-[var(--leaf-200)]"
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Sign Out */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(149,213,178,0.10)',
        }}
      >
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-3 py-2.5 w-full rounded-xl group transition-all duration-200"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <LogOut
            size={18}
            strokeWidth={1.5}
            style={{ color: 'rgba(213,239,223,0.55)', flexShrink: 0 }}
            className="group-hover:!text-red-400 group-hover:-translate-x-0.5 transition-transform duration-300"
          />
          <span
            style={{
              fontFamily: 'Mulish, sans-serif',
              fontSize: 13.5,
              fontWeight: 500,
              color: 'rgba(213,239,223,0.55)',
              letterSpacing: '0.01em',
            }}
            className="group-hover:!text-red-400 transition-colors duration-200"
          >
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .ct-nav-active {
          background: rgba(149,213,178,0.16);
        }
        .ct-nav-inactive {
          background: transparent;
        }
        .ct-nav-inactive:hover {
          background: rgba(149,213,178,0.08);
        }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-[#F7F5EF] dark:bg-[#0f1712] text-[#141A17] dark:text-slate-100">
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1] as any, duration: 0.4 }}
              className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
              style={{ background: 'rgba(11,31,21,0.5)' }}
              onClick={() => setIsMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <SidebarContent />
        </aside>

        <main
          className="flex-1 flex flex-col h-screen overflow-hidden w-full relative bg-gradient-to-br from-[#F7F5EF] to-[#ffffff] dark:from-[#0f1712] dark:to-[#000000]"
        >
          {/* Top Navigation Bar */}
          <header
            className="h-20 flex-shrink-0 flex items-center justify-between px-6 lg:px-10 z-30 dark:bg-[#121c16] border-b border-[#141A17]/10 dark:border-white/10"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 lg:hidden transition-colors text-[#141A17] dark:text-slate-100"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
              <div className="hidden md:flex items-center gap-2.5 w-72">
                <Search size={15} strokeWidth={1.5} className="text-[#5A6660] dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search activities, goals, reports..."
                  className="bg-transparent border-none outline-none text-sm w-full tracking-wide text-[#141A17] dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  style={{ fontFamily: 'Mulish, sans-serif' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              {user?.organisationName && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Tenant: <strong>{user.organisationName}</strong></span>
                  {user.department && (
                    <span className="bg-emerald-200/60 dark:bg-emerald-800/60 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-emerald-900 dark:text-emerald-200">
                      {user.department}
                    </span>
                  )}
                </div>
              )}

              <button 
                onClick={toggleDarkMode} 
                className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[#5A6660] dark:text-slate-400" 
              >
                {isDark ? <Sun size={19} strokeWidth={1.5} /> : <Moon size={19} strokeWidth={1.5} />}
              </button>

              <button className="relative text-[#5A6660] dark:text-slate-400">
                <Bell size={19} strokeWidth={1.5} />
                <span
                  className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: user?.primaryColor || 'var(--leaf-400)' }}
                />
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div
                    className="text-[#141A17] dark:text-slate-100"
                    style={{
                      fontSize: 13.5,
                      fontFamily: 'Mulish, sans-serif',
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {user?.name || 'Guest'}
                  </div>
                  <div
                    className={user?.role === 'ORG_ADMIN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#5A6660] dark:text-slate-400'}
                    style={{
                      fontSize: 10,
                      fontFamily: 'Mulish, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {user?.accountType === 'INDIVIDUAL' ? 'Individual User' : user?.role === 'ORG_ADMIN' ? 'Org Admin' : user?.role === 'ADMIN' ? 'System Admin' : (user?.role === 'INDIVIDUAL' || user?.role === 'USER' ? 'User' : (user?.role ? user.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Employee'))}
                  </div>
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-emerald-900"
                  style={{
                    background: user?.primaryColor ? `${user.primaryColor}20` : 'rgba(149,213,178,0.2)',
                    border: `1.5px solid ${user?.primaryColor || 'rgba(45,106,79,0.25)'}`,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} strokeWidth={1.5} />}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-24 pt-8">
            <Outlet />
          </div>
          <AIAssistantWidget />
        </main>
      </div>
    </>
  );
};
