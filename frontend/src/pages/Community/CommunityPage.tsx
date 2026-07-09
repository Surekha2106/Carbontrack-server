import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Heart, Share2, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CommunityPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const posts = [
    {
      id: 1,
      user: 'GreenLife',
      avatar: 'https://ui-avatars.com/api/?name=GreenLife&background=10b981&color=fff',
      time: '2 hours ago',
      content: 'Just hit my goal of biking to work every day this week! Saved about 15kg of CO2. 🚲🌍',
      likes: 24,
      comments: 5,
      hasLiked: true
    },
    {
      id: 2,
      user: 'CarbonNinja',
      avatar: 'https://ui-avatars.com/api/?name=CarbonNinja&background=8b5cf6&color=fff',
      time: '5 hours ago',
      content: 'Did you know that switching to LED bulbs can reduce your lighting energy consumption by up to 80%? I just swapped out my whole house!',
      likes: 42,
      comments: 12,
      hasLiked: false
    },
    {
      id: 3,
      user: 'EcoWarrior99',
      avatar: 'https://ui-avatars.com/api/?name=EcoWarrior99&background=f59e0b&color=fff',
      time: '1 day ago',
      content: 'Just unlocked the "Carbon Neutral" badge for this month! Thank you CarbonTrack for keeping me accountable. 🌱',
      likes: 89,
      comments: 21,
      hasLiked: true
    }
  ];

  return (
    <div className="space-y-6 pb-12 relative max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="text-accent" /> Community Hub
          </h1>
          <p className="text-text-secondary mt-1">Connect, share, and get inspired by others.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card flex gap-4 mt-6"
      >
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.name || 'You')}&background=22c55e&color=fff`} alt="You" className="w-12 h-12 rounded-full border-2 border-accent" />
        <div className="flex-1">
          <textarea 
            placeholder="Share your latest eco-win..."
            className="w-full bg-surface/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent/50 resize-none h-24"
          ></textarea>
          <div className="flex justify-end mt-2">
            <button className="btn-primary text-sm py-2 px-6">Post</button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6 mt-8">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
            className="glass-panel p-5 rounded-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full" />
                <div>
                  <h4 className="font-bold text-sm">{post.user}</h4>
                  <p className="text-xs text-text-secondary">{post.time}</p>
                </div>
              </div>
              {post.id === 3 && <Award className="text-accent w-5 h-5" />}
            </div>
            
            <p className="text-text-primary leading-relaxed text-sm mb-4">
              {post.content}
            </p>
            
            <div className="flex items-center gap-6 pt-4 border-t border-border/50 text-text-secondary">
              <button className={`flex items-center gap-2 hover:text-red-400 transition-colors ${post.hasLiked ? 'text-red-400' : ''}`}>
                <Heart size={18} className={post.hasLiked ? 'fill-red-400' : ''} />
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-accent transition-colors">
                <MessageSquare size={18} />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-400 transition-colors ml-auto">
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPage;
