import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Eye, Monitor, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

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
          <button className="w-full text-left px-4 py-3 rounded-xl bg-accent/10 text-accent font-medium flex items-center gap-3">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-text-secondary hover:bg-surface/50 transition-colors flex items-center gap-3">
            <Lock size={18} /> Security
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-text-secondary hover:bg-surface/50 transition-colors flex items-center gap-3">
            <Eye size={18} /> Privacy
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-text-secondary hover:bg-surface/50 transition-colors flex items-center gap-3">
            <Monitor size={18} /> Display
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-3 space-y-6"
        >
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
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary px-8 py-3 flex items-center gap-2">
              <Save size={18} /> Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
