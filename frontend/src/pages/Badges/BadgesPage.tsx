import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Loader2, Flag, Share2, Play } from 'lucide-react';
import { ECertificate } from '../../components/ECertificate';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';

export const BadgesPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [milestonesStarted, setMilestonesStarted] = useState(false);

  useEffect(() => {
    // Check if user has started milestones locally
    const started = localStorage.getItem(`milestonesStarted_${user?.id}`);
    if (started === 'true') {
      setMilestonesStarted(true);
    }

    const fetchAnalyticsData = async () => {
      try {
        const res = await apiClient.get('/analytics/summary');
        setTotalEmissions(res.data.totalEmissions || 0);
      } catch (error) {
        console.error('Failed to fetch user analytics data for gamification', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.email === 'admin@carbontrack.com';
  const effectiveTotal = isAdmin ? 999 : totalEmissions;

  const displayBadges = [
    { 
      id: 101, 
      name: 'Milestone 1', 
      description: 'Reached 15kg Carbon Goal',
      target: 15,
      unlocked: effectiveTotal >= 15, 
      icon: 'flag', 
      color: 'from-amber-400 to-orange-500',
      cornerBadgeSize: 'w-6 h-6' 
    },
    { 
      id: 102, 
      name: 'Milestone 2', 
      description: 'Reached 30kg Carbon Goal',
      target: 30,
      unlocked: effectiveTotal >= 30, 
      icon: 'flag', 
      color: 'from-rose-400 to-red-500',
      cornerBadgeSize: 'w-8 h-8'
    },
    { 
      id: 103, 
      name: 'Milestone 3', 
      description: 'Reached 50kg Carbon Goal',
      target: 50,
      unlocked: effectiveTotal >= 50, 
      icon: 'flag', 
      color: 'from-cyan-400 to-blue-500',
      cornerBadgeSize: 'w-12 h-12'
    },
  ];

  const hasCompletedMilestone3 = effectiveTotal >= 50;

  const handleStartMilestones = () => {
    setMilestonesStarted(true);
    localStorage.setItem(`milestonesStarted_${user?.id}`, 'true');
  };

  const handleShare = (title: string, text: string) => {
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      alert('Social sharing is not natively supported on this desktop browser. You can copy the URL to share!');
    }
  };

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-[#141A17] dark:text-white">
            <Award className="text-accent" /> Milestones & Certificates
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-2">
            Progress is tracked dynamically based on your daily activities recorded in the database.
            <br />
            <span className="text-accent">
              Current Recorded Progress: {isAdmin ? 'Admin Mode (Maxed)' : `${effectiveTotal.toFixed(1)} kg`}
            </span>
          </p>
        </div>
        <div className="glass-panel py-2 px-4 rounded-full flex items-center gap-3 border border-accent/30">
          <span className="font-bold text-xl text-accent">{displayBadges.filter(b => b.unlocked).length}</span>
          <span className="text-sm text-text-secondary uppercase tracking-wider">Unlocked</span>
        </div>
      </div>

      {!milestonesStarted ? (
        <div className="flex flex-col items-center justify-center mt-12 mb-8 glass-panel p-12 text-center max-w-2xl mx-auto rounded-3xl">
          <Flag className="w-16 h-16 text-accent mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Ready to Track Your Eco-Journey?</h2>
          <p className="text-text-secondary mb-6">Start your milestones today to track your progress towards reducing carbon emissions and earning your e-certificate!</p>
          <button onClick={handleStartMilestones} className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
            <Play className="w-5 h-5" /> Start Your Milestones
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
          {displayBadges.map((badge, index) => {
            const progress = Math.min(100, Math.max(0, (effectiveTotal / badge.target) * 100));
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`glass-panel p-6 relative flex flex-col items-center text-center group transition-all duration-300 ${
                  badge.unlocked 
                    ? 'hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(45,106,79,0.3)] border-accent/30' 
                    : 'opacity-80 border-border/20 grayscale-0'
                }`}
              >
                {/* Locked Icon */}
                {!badge.unlocked && (
                  <div className="absolute top-3 right-3 text-text-secondary/50">
                    <Lock size={16} />
                  </div>
                )}

                {/* Share Option */}
                {badge.unlocked && (
                  <button 
                    onClick={() => handleShare(`I unlocked ${badge.name}!`, `I just achieved the ${badge.name} by reducing ${badge.target}kg of CO2 on CarbonTrack!`)}
                    className="absolute top-3 right-3 text-text-secondary hover:text-accent transition-colors z-10"
                    title="Share Badge"
                  >
                    <Share2 size={18} />
                  </button>
                )}

                {/* Corner Gold Badge for Unlocked Milestones */}
                {badge.unlocked && (
                  <div className="absolute top-2 left-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
                    <Award className={`${badge.cornerBadgeSize}`} />
                  </div>
                )}
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mt-4 mb-4 ${
                  badge.unlocked 
                    ? `bg-gradient-to-br ${badge.color} text-white shadow-lg` 
                    : 'bg-surface border-2 border-border text-text-secondary'
                }`}>
                  <Flag size={32} />
                </div>
                
                <h3 className={`font-bold mb-2 ${badge.unlocked ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {badge.description}
                </p>

                {/* Progress Bar */}
                <div className="w-full mt-auto">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">Progress</span>
                    <span className="font-bold text-text-primary">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden border border-border">
                    <div 
                      className={`h-full bg-accent transition-all duration-1000`} 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                {badge.unlocked && (
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* E-Certificate Section */}
      <div className="mt-16 border-t border-border pt-12">
        <div className="text-center mb-8 relative">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2 flex justify-center items-center gap-3">
            {!hasCompletedMilestone3 && <Lock className="text-text-secondary" />}
            Milestone Certificate
          </h2>
          <p className="text-text-secondary">
            {hasCompletedMilestone3 
              ? "You have successfully completed Milestone 3. Download your personalized certificate below."
              : "Complete Milestone 3 (50kg) to unlock your personalized E-Certificate."}
          </p>
          
          {hasCompletedMilestone3 && (
            <button 
              onClick={() => handleShare('My CarbonTrack Certificate', 'I just earned my Eco Champion Certificate on CarbonTrack for reducing 50kg of CO2!')}
              className="absolute right-0 top-0 hidden md:flex items-center gap-2 btn-secondary px-4 py-2"
            >
              <Share2 size={16} /> Share Certificate
            </button>
          )}
        </div>
        
        {hasCompletedMilestone3 ? (
          <div className="relative">
            <ECertificate userName={user?.name || 'Eco Champion'} targetAchieved="Milestone 3 (50kg)" />
            {/* Mobile Share Button */}
            <div className="md:hidden flex justify-center mt-6">
              <button 
                onClick={() => handleShare('My CarbonTrack Certificate', 'I just earned my Eco Champion Certificate on CarbonTrack for reducing 50kg of CO2!')}
                className="flex items-center gap-2 btn-secondary px-6 py-2"
              >
                <Share2 size={16} /> Share Certificate
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-12 text-center max-w-2xl mx-auto flex flex-col items-center justify-center opacity-50">
             <Lock className="w-16 h-16 text-text-secondary mb-4" />
             <p className="text-lg text-text-secondary">Certificate is locked. Keep logging daily activities!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesPage;
