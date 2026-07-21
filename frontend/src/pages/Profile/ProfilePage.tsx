import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Award, Settings, LogOut, Edit3, Activity } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { EditProfileModal } from '../../components/forms/EditProfileModal';

export const ProfilePage: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await userService.getProfile().catch(() => authUser);
        setProfile(res || authUser);
        
        const analyticsRes = await apiClient.get('/analytics/summary').catch(() => null);
        if (analyticsRes && analyticsRes.data) {
          setTotalEmissions(analyticsRes.data.totalEmissions || 0);
        }
      } catch (error) {
        console.error('Failed to fetch profile data', error);
      }
    };
    fetchProfileData();
  }, [authUser]);

  const handleSaveProfile = async (newName: string) => {
    try {
      const updatedUser = await userService.updateProfile({ ...profile, name: newName });
      setProfile(updatedUser);
      // Optional: you could update AuthContext user here if you export a function for it
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  if (!profile) return null;
  
  const calculateLevel = (emissions: number) => {
    if (emissions > 500) return 1;
    if (emissions > 200) return 5;
    if (emissions > 50) return 10;
    return 15;
  };
  
  const calculateBadges = (emissions: number) => {
    let badges = 0;
    if (emissions >= 15) badges++;
    if (emissions >= 30) badges++;
    if (emissions >= 50) badges++;
    return badges;
  };

  return (
    <div className="space-y-6 pb-12 relative max-w-4xl mx-auto">
      <div className="glass-panel overflow-hidden relative">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-accent/20 to-emerald-900/40 w-full absolute top-0 left-0" />
        
        <div className="relative pt-16 px-6 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          <div className="relative">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=22c55e&color=fff`} alt="Avatar" className="w-28 h-28 rounded-full border-4 border-[#0a0a0a] shadow-2xl" />
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-0 right-0 p-2 bg-surface border border-border rounded-full hover:text-accent transition-colors"
            >
              <Edit3 size={14} />
            </button>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{profile.name || 'CarbonTrack User'}</h1>
            <p className="text-accent font-medium mt-1">Level {calculateLevel(totalEmissions)} Eco-Warrior</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
            >
              <Settings size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="col-span-1 space-y-6"
        >
          <div className="glass-card">
            <h3 className="font-bold text-lg mb-4 border-b border-border/50 pb-2">About</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-text-secondary">
                <User size={16} className="text-text-primary" />
                <span>{profile.name}</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Mail size={16} className="text-text-primary" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Shield size={16} className="text-text-primary" />
                <span>{profile.accountType === 'INDIVIDUAL' ? 'Individual User' : profile.role === 'ORG_ADMIN' ? 'Org Admin' : profile.role === 'ADMIN' ? 'System Admin' : (profile.role === 'INDIVIDUAL' || profile.role === 'USER' ? 'User' : (profile.role ? profile.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Active Member'))}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="col-span-1 md:col-span-2 space-y-6"
        >
          <div className="glass-card">
            <h3 className="font-bold text-lg mb-6 border-b border-border/50 pb-2">Impact Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface/30 border border-border flex items-center gap-4">
                <div className="p-3 bg-accent/20 text-accent rounded-lg">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Total Badges</p>
                  <p className="text-2xl font-bold">{calculateBadges(totalEmissions)}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface/30 border border-border flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">CO₂ Logged</p>
                  <p className="text-2xl font-bold">{totalEmissions.toFixed(1)} kg</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={logout}
              className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all font-medium flex items-center gap-2"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </motion.div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={profile.name || ''}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage;
