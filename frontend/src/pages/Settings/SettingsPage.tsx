import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Eye, Monitor, Save } from 'lucide-react';
import { ChangePasswordModal } from '../../components/forms/ChangePasswordModal';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  const [publicProfile, setPublicProfile] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);
  
  const [twoFactor, setTwoFactor] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [reduceMotion, setReduceMotion] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'display', label: 'Display', icon: Monitor },
  ];

  return (
    <div className="space-y-6 pb-12 relative max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="text-accent" /> Account Settings
          </h1>
          <p className="text-text-secondary mt-1">Manage your preferences and security settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="md:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${
                  isActive 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text-secondary hover:bg-surface/50'
                }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-3 space-y-6"
        >
          {activeTab === 'notifications' && (
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-6 pb-2 border-b border-border/50">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">Push Notifications</h4>
                    <p className="text-sm text-text-secondary mt-1">Receive daily reminders to log activities.</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-accent' : 'bg-surface border border-border'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 ${notifications ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">Email Alerts</h4>
                    <p className="text-sm text-text-secondary mt-1">Receive weekly carbon footprint reports.</p>
                  </div>
                  <button 
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${emailAlerts ? 'bg-accent' : 'bg-surface border border-border'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 ${emailAlerts ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-6 pb-2 border-b border-border/50">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">Two-Factor Authentication</h4>
                    <p className="text-sm text-text-secondary mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <button 
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${twoFactor ? 'bg-accent' : 'bg-surface border border-border'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 ${twoFactor ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-medium text-text-primary mb-2">Password</h4>
                  <button 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="text-sm px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface/50 transition-colors"
                  >
                    Change Password
                  </button>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-medium text-text-primary mb-2">Active Sessions</h4>
                  <div className="text-sm text-text-secondary space-y-2">
                    <div className="flex justify-between items-center bg-surface/30 p-3 rounded-lg border border-border/50">
                      <div>
                        <p className="font-medium text-text-primary">Windows • Chrome</p>
                        <p className="text-xs">Active now • IP: 192.168.1.1</p>
                      </div>
                      <span className="text-accent text-xs font-medium px-2 py-1 bg-accent/10 rounded-full">Current</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-6 pb-2 border-b border-border/50">Privacy</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">Public Profile</h4>
                    <p className="text-sm text-text-secondary mt-1">Allow others to see your stats on the leaderboard.</p>
                  </div>
                  <button 
                    onClick={() => setPublicProfile(!publicProfile)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${publicProfile ? 'bg-accent' : 'bg-surface border border-border'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 ${publicProfile ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <h4 className="font-medium text-text-primary">Anonymous Data Sharing</h4>
                    <p className="text-sm text-text-secondary mt-1">Help us improve by sharing anonymous usage data.</p>
                  </div>
                  <button 
                    onClick={() => setDataSharing(!dataSharing)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${dataSharing ? 'bg-accent' : 'bg-surface border border-border'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 ${dataSharing ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-medium text-text-primary mb-2">Download Your Data</h4>
                  <p className="text-sm text-text-secondary mb-3">Get a copy of your activities, goals, and badges.</p>
                  <button className="text-sm px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface/50 transition-colors">
                    Request Data Archive
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-6 pb-2 border-b border-border/50">Display Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-text-primary">Dark Theme</h4>
                    <p className="text-sm text-text-secondary mt-1">Switch between light and dark mode appearance.</p>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-accent' : 'bg-surface border border-border'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 ${isDarkMode ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <h4 className="font-medium text-text-primary">Reduce Motion</h4>
                    <p className="text-sm text-text-secondary mt-1">Minimize UI animations across the application.</p>
                  </div>
                  <button 
                    onClick={() => setReduceMotion(!reduceMotion)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${reduceMotion ? 'bg-accent' : 'bg-surface border border-border'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 ${reduceMotion ? 'right-1' : 'left-1'}`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-medium text-text-primary mb-2">Language</h4>
                  <select className="bg-surface border border-border text-text-primary text-sm rounded-lg block w-full max-w-xs p-2.5 outline-none focus:border-accent">
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button className="btn-primary px-8 py-3 flex items-center gap-2">
              <Save size={18} /> Save Changes
            </button>
          </div>
        </motion.div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default SettingsPage;

