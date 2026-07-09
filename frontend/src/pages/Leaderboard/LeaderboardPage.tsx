import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  // Mock data for MVP
  const leaderboardData = [
    { rank: 1, name: 'EcoWarrior99', score: 15420, avatar: 'https://ui-avatars.com/api/?name=EcoWarrior99&background=f59e0b&color=fff' },
    { rank: 2, name: 'GreenLife', score: 14200, avatar: 'https://ui-avatars.com/api/?name=GreenLife&background=10b981&color=fff' },
    { rank: 3, name: 'CarbonNinja', score: 13500, avatar: 'https://ui-avatars.com/api/?name=CarbonNinja&background=8b5cf6&color=fff' },
    { rank: 4, name: 'EarthDefender', score: 12100, avatar: 'https://ui-avatars.com/api/?name=EarthDefender&background=3b82f6&color=fff' },
    { rank: 5, name: 'SustainableMe', score: 11800, avatar: 'https://ui-avatars.com/api/?name=SustainableMe&background=ec4899&color=fff' },
    { rank: 6, name: 'TreeHugger', score: 10900, avatar: 'https://ui-avatars.com/api/?name=TreeHugger&background=14b8a6&color=fff' },
    { rank: 7, name: 'You (Surekha)', score: 9500, avatar: 'https://ui-avatars.com/api/?name=Surekha&background=22c55e&color=fff', isUser: true },
    { rank: 8, name: 'NatureLover', score: 8400, avatar: 'https://ui-avatars.com/api/?name=NatureLover&background=06b6d4&color=fff' },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="font-bold text-text-secondary text-lg w-6 text-center">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 relative max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Trophy className="text-accent" /> Community Leaderboard
          </h1>
          <p className="text-text-secondary mt-1">See how you rank against other eco-warriors this month.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel overflow-hidden mt-8"
      >
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border text-sm font-medium text-text-secondary uppercase tracking-wider">
            <span>Rank & User</span>
            <span>Carbon Saved (kg)</span>
          </div>
          
          <div className="space-y-3">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 md:p-4 rounded-2xl transition-colors ${
                  user.isUser ? 'bg-accent/10 border border-accent/30' : 'bg-surface/30 hover:bg-surface/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(user.rank)}
                  </div>
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-surface shadow-md" />
                  <span className={`font-bold text-lg ${user.isUser ? 'text-accent' : 'text-text-primary'}`}>
                    {user.name}
                  </span>
                </div>
                <div className="font-mono font-bold text-lg tracking-tight">
                  {user.score.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;
