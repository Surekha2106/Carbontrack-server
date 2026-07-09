import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Loader2, ShieldCheck, Zap, Leaf, Globe } from 'lucide-react';
import { badgeService } from '../../services/badgeService';

export const BadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await badgeService.getBadges();
        setBadges(res);
      } catch (error) {
        console.error('Failed to fetch badges', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // Fallback to mocked badges if the API returns empty
  const displayBadges = badges.length > 0 ? badges : [
    { id: 1, name: 'Eco Starter', description: 'Logged your first activity', unlocked: true, icon: 'leaf', color: 'from-emerald-400 to-accent' },
    { id: 2, name: 'Transport Hero', description: 'Saved 50kg CO2 from transport', unlocked: true, icon: 'zap', color: 'from-blue-400 to-indigo-500' },
    { id: 3, name: 'Global Citizen', description: 'Reached top 10% in your community', unlocked: false, icon: 'globe', color: 'from-purple-400 to-pink-500' },
    { id: 4, name: 'Carbon Neutral', description: 'Offset 100% of your monthly emissions', unlocked: false, icon: 'shield', color: 'from-yellow-400 to-orange-500' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'leaf': return <Leaf size={32} />;
      case 'zap': return <Zap size={32} />;
      case 'globe': return <Globe size={32} />;
      case 'shield': return <ShieldCheck size={32} />;
      default: return <Award size={32} />;
    }
  };

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Award className="text-accent" /> Achievements & Badges
          </h1>
          <p className="text-text-secondary mt-1">Showcase your milestones and environmental impact.</p>
        </div>
        <div className="glass-panel py-2 px-4 rounded-full flex items-center gap-3 border border-accent/30">
          <span className="font-bold text-xl text-accent">{displayBadges.filter(b => b.unlocked).length}</span>
          <span className="text-sm text-text-secondary uppercase tracking-wider">Unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {displayBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`glass-card relative flex flex-col items-center text-center group transition-all duration-300 ${
              badge.unlocked 
                ? 'hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)]' 
                : 'opacity-60 grayscale'
            }`}
          >
            {!badge.unlocked && (
              <div className="absolute top-3 right-3 text-text-secondary/50">
                <Lock size={16} />
              </div>
            )}
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              badge.unlocked 
                ? `bg-gradient-to-br ${badge.color || 'from-accent to-emerald-600'} text-white shadow-lg` 
                : 'bg-surface border-2 border-border text-text-secondary'
            }`}>
              {getIcon(badge.icon)}
            </div>
            
            <h3 className={`font-bold mb-2 ${badge.unlocked ? 'text-white' : 'text-text-secondary'}`}>
              {badge.name}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {badge.description}
            </p>
            
            {badge.unlocked && (
              <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BadgesPage;
