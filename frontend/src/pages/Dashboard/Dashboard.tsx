import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Leaf, Flame, Car, Zap, Target, ArrowUpRight, ArrowDownRight, ShoppingBag, Loader2 } from 'lucide-react';
import { LogActivityModal } from '../../components/forms/LogActivityModal';
import { activityService, type ActivityData } from '../../services/activityService';
import { goalService } from '../../services/goalService';
import { userService } from '../../services/userService';
import { benchmarkService } from '../../services/benchmarkService';

const StatCard = ({ title, value, icon, trend, isPositive, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="glass-panel p-6 flex flex-col hover:bg-white/5 transition-colors cursor-default"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-surface border border-border">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md ${isPositive ? 'text-accent bg-accent/10' : 'text-rose-400 bg-rose-400/10'}`}>
        {isPositive ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
        {trend}
      </div>
    </div>
    <div className="text-3xl font-bold mb-1 text-text-primary">{value}</div>
    <div className="text-sm text-text-secondary">{title}</div>
  </motion.div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <div className="w-1.5 h-6 bg-accent rounded-full flex-shrink-0" />
    <h3 className="text-xl font-bold text-text-primary tracking-tight">{children}</h3>
  </div>
);

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, goalsRes, analyticsRes, profileRes, benchmarkRes, recommendationsRes] = await Promise.all([
          activityService.getActivities().catch(() => []),
          goalService.getGoals().catch(() => []),
          activityService.getAnalyticsSummary().catch(() => null),
          userService.getProfile().catch(() => null),
          benchmarkService.getPeerBenchmark().catch(() => null),
          activityService.getRecommendations().catch(() => [])
        ]);
        setActivities(activitiesRes);
        setGoals(goalsRes);
        setAnalytics(analyticsRes);
        setProfile(profileRes);
        setBenchmark(benchmarkRes);
        setRecommendations(recommendationsRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddActivity = async (data: any) => {
    try {
      const promises: Promise<ActivityData>[] = [];
      const date = data.date;

      if (data.transportAmount && Number(data.transportAmount) > 0) {
        promises.push(activityService.logActivity({
          category: 'Transport',
          activityType: 'transport',
          quantity: Number(data.transportAmount),
          unit: 'km',
          logDate: date
        }));
      }

      if (data.energyAmount && Number(data.energyAmount) > 0) {
        promises.push(activityService.logActivity({
          category: 'Electricity',
          activityType: 'energy',
          quantity: Number(data.energyAmount),
          unit: 'kWh',
          logDate: date
        }));
      }

      if (data.foodAmount && Number(data.foodAmount) > 0) {
        promises.push(activityService.logActivity({
          category: 'Food',
          activityType: data.foodType || 'food',
          quantity: Number(data.foodAmount),
          unit: 'meal',
          logDate: date
        }));
      }

      if (data.shoppingAmount && Number(data.shoppingAmount) > 0) {
        promises.push(activityService.logActivity({
          category: 'Shopping',
          activityType: 'shopping',
          quantity: Number(data.shoppingAmount),
          unit: 'item',
          logDate: date
        }));
      }

      if (promises.length > 0) {
        const savedActivities = [];
        for (const p of promises) {
          savedActivities.push(await p);
        }
        setActivities([...savedActivities.reverse(), ...activities]);
        activityService.getAnalyticsSummary().then(res => setAnalytics(res)).catch(() => {});
      }
    } catch (error) {
      console.error("Failed to save activities", error);
      throw error;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'transport': return <Car size={16} strokeWidth={1.5} />;
      case 'food': return <Leaf size={16} strokeWidth={1.5} />;
      case 'energy': return <Zap size={16} strokeWidth={1.5} />;
      case 'shopping': return <ShoppingBag size={16} strokeWidth={1.5} />;
      default: return <Leaf size={16} strokeWidth={1.5} />;
    }
  };

  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  
  const transportTotal = analytics?.byCategory?.Transport || 0;
  const foodTotal = analytics?.byCategory?.Food || 0;
  const energyTotal = analytics?.byCategory?.Electricity || 0;
  const shoppingTotal = analytics?.byCategory?.Shopping || 0;
  
  const totalEmissions = analytics?.totalEmissions || 0;

  const chartData = [
    { name: 'Transport', emissions: transportTotal, fill: '#3b82f6' },
    { name: 'Home Energy', emissions: energyTotal, fill: '#22c55e' },
    { name: 'Food & Diet', emissions: foodTotal, fill: '#eab308' },
    { name: 'Shopping', emissions: shoppingTotal, fill: '#8b5cf6' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative">
      <LogActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddActivity={handleAddActivity} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Overview</h1>
          <p className="text-text-secondary mt-1">A comprehensive analysis of your environmental impact, beautifully distilled.</p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 rounded-full text-amber-400 font-bold text-sm"
            >
              <Flame size={18} fill="currentColor" />
              <span>{profile.currentStreak} Day Streak!</span>
            </motion.div>
          )}

          <button onClick={() => setIsModalOpen(true)} className="btn-primary py-2.5 px-6 text-sm">
            Log Activity
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Impact" 
          value={`${Number(totalEmissions).toFixed(1)}kg`} 
          icon={<Flame className="text-orange-400" />} 
          trend="Real-time" 
          isPositive={false} 
          delay={0.1} 
        />
        <StatCard 
          title="Transport Impact" 
          value={`${Number(transportTotal).toFixed(1)}kg`} 
          icon={<Car className="text-blue-400" />} 
          trend="Real-time" 
          isPositive={false} 
          delay={0.2} 
        />
        <StatCard 
          title="Energy Impact" 
          value={`${Number(energyTotal).toFixed(1)}kg`} 
          icon={<Zap className="text-yellow-400" />} 
          trend="Real-time" 
          isPositive={true} 
          delay={0.3} 
        />
        <StatCard 
          title="Food Impact" 
          value={`${Number(foodTotal).toFixed(1)}kg`} 
          icon={<Leaf className="text-emerald-400" />} 
          trend="Real-time" 
          isPositive={true} 
          delay={0.4} 
        />
      </div>

      {/* Unified Analysis Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <SectionHeading>Categorical Analysis</SectionHeading>
          <div className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Impact by Sector</div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: '#161616', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="emissions" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Ledger & Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities — Ledger */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <SectionHeading>Ledger</SectionHeading>
            <Link to="/activities" className="text-xs font-bold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors">
              View History
            </Link>
          </div>
          <div className="space-y-3">
            {safeActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-border/40">
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-accent">
                  {getActivityIcon(activity.activityType || '')}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-text-primary">{activity.category}</div>
                  <div className="text-xs text-text-secondary uppercase font-medium">{activity.activityType}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-text-primary">{activity.quantity} {activity.unit}</div>
                  <div className="text-xs text-text-secondary">{activity.emission ? `${Number(activity.emission).toFixed(2)} kg CO₂` : 'Pending'}</div>
                </div>
              </div>
            ))}
            {safeActivities.length === 0 && (
              <div className="text-center text-sm text-text-secondary py-6">No activities logged yet.</div>
            )}
          </div>
        </motion.div>

        {/* Goals Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <SectionHeading>Targets</SectionHeading>
            <Link to="/goals" className="text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors">
              Manage Objectives
            </Link>
          </div>
          <div className="space-y-6">
            {safeGoals.map((goal, i) => {
              const progress = Math.min(((Number(goal.currentValue) || 0) / Number(goal.targetValue)) * 100, 100);
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-text-primary">{goal.goalName}</span>
                    <span className="text-text-secondary font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>
              );
            })}
            {safeGoals.length === 0 && (
              <div className="text-center text-sm text-text-secondary py-6">No targets set yet. Navigate to Goals to create your first target.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Insights & Peer Benchmarking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <SectionHeading>AI Insights</SectionHeading>
          </div>
          <div className="space-y-3">
            {(Array.isArray(recommendations) ? recommendations : []).length > 0 ? (
              (Array.isArray(recommendations) ? recommendations : []).map((rec: any, i) => (
                <div key={i} className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col gap-2">
                  <div className="flex gap-3 items-center">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(rec.activity || '')}
                    </div>
                    <span className="font-semibold text-sm text-text-primary capitalize">{rec.activity}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed ml-10">{rec.tip}</p>
                </div>
              ))
            ) : (
              <div className="text-sm text-text-secondary py-4">No AI recommendations available yet. Log more activities to generate custom insights.</div>
            )}
          </div>
        </motion.div>

        {/* Peer Benchmarking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <SectionHeading>Community Benchmark</SectionHeading>
          </div>
          {benchmark ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary">Top {100 - (benchmark.percentile || 0)}%</h4>
                  <p className="text-xs text-text-secondary mt-0.5">{benchmark.message || "Of eco-friendly users."}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">Your Impact</div>
                  <div className="text-xl font-bold text-text-primary">
                    {Number(benchmark.userEmission || 0).toFixed(1)} <span className="text-xs text-text-secondary font-medium">kg</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">Platform Avg</div>
                  <div className="text-xl font-bold text-text-primary">
                    {Number(benchmark.platformAverage || 0).toFixed(1)} <span className="text-xs text-text-secondary font-medium">kg</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-text-secondary py-4">Benchmarking data unavailable.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
