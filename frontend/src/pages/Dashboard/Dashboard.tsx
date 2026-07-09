import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Leaf, Flame, Car, Zap, Target, ArrowUpRight, ArrowDownRight, ShoppingBag, Loader2 } from 'lucide-react';
import { LogActivityModal } from '../../components/forms/LogActivityModal';
import { activityService, type ActivityData } from '../../services/activityService';
import { goalService } from '../../services/goalService';

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
      <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md ${isPositive ? 'text-accent bg-accent/10' : 'text-red-400 bg-red-400/10'}`}>
        {isPositive ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
        {trend}
      </div>
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm text-text-secondary">{title}</div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, goalsRes] = await Promise.all([
          activityService.getActivities().catch(() => []),
          goalService.getGoals().catch(() => [])
        ]);
        setActivities(activitiesRes);
        setGoals(goalsRes);
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
        const savedActivities = await Promise.all(promises);
        setActivities([...savedActivities.reverse(), ...activities]);
      }
    } catch (error) {
      console.error("Failed to save activities", error);
      throw error;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'transport': return <Car size={18} />;
      case 'food': return <Leaf size={18} />;
      case 'energy': return <Zap size={18} />;
      case 'shopping': return <ShoppingBag size={18} />;
      default: return <Leaf size={18} />;
    }
  };

  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  
  const transportTotal = safeActivities.filter(a => a.activityType === 'transport').reduce((acc, curr) => acc + Number(curr.emission || 0), 0);
  const foodTotal = safeActivities.filter(a => a.activityType === 'food').reduce((acc, curr) => acc + Number(curr.emission || 0), 0);
  const energyTotal = safeActivities.filter(a => a.activityType === 'energy').reduce((acc, curr) => acc + Number(curr.emission || 0), 0);
  const shoppingTotal = safeActivities.filter(a => a.activityType === 'shopping').reduce((acc, curr) => acc + Number(curr.emission || 0), 0);
  
  const totalEmissions = transportTotal + foodTotal + energyTotal + shoppingTotal;

  const chartData = [
    { name: 'Transport', emissions: transportTotal, fill: '#3b82f6' },
    { name: 'Home Energy', emissions: energyTotal, fill: '#22c55e' },
    { name: 'Food & Diet', emissions: foodTotal, fill: '#eab308' },
    { name: 'Shopping', emissions: shoppingTotal, fill: '#8b5cf6' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full min-h-[500px]">
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-6 pb-12 relative">
      <LogActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddActivity={handleAddActivity} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-text-secondary mt-1">Here's your clear, unified carbon footprint analysis.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary py-2 text-sm">Log Activity</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Emissions (kg CO₂)" 
          value={Number(totalEmissions).toFixed(1)} 
          icon={<Flame className="text-orange-400" />} 
          trend="Real-time" 
          isPositive={false} 
          delay={0.1} 
        />
        <StatCard 
          title="Transport Impact" 
          value={Number(transportTotal).toFixed(1)} 
          icon={<Car className="text-blue-400" />} 
          trend="Real-time" 
          isPositive={false} 
          delay={0.2} 
        />
        <StatCard 
          title="Energy Impact" 
          value={Number(energyTotal).toFixed(1)} 
          icon={<Zap className="text-yellow-400" />} 
          trend="Real-time" 
          isPositive={true} 
          delay={0.3} 
        />
        <StatCard 
          title="Food Impact" 
          value={Number(foodTotal).toFixed(1)} 
          icon={<Leaf className="text-accent" />} 
          trend="Real-time" 
          isPositive={true} 
          delay={0.4} 
        />
      </div>

      {/* Unified Analysis Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Impact Analysis by Category</h3>
          <div className="text-sm text-text-secondary">Dynamically updated based on your logs</div>
        </div>
        <div className="h-[350px] w-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <button className="text-sm text-accent hover:text-accent-hover">View All</button>
          </div>
          <div className="space-y-4">
            {safeActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary">
                  {getActivityIcon(activity.activityType || '')}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.category} - {activity.activityType}</div>
                  <div className="text-xs text-text-secondary">{activity.logDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-text-primary">{activity.quantity} {activity.unit}</div>
                  <div className="text-xs text-text-secondary">{activity.emission ? `${Number(activity.emission).toFixed(2)} kg CO2` : 'Pending'}</div>
                </div>
              </div>
            ))}
            {safeActivities.length === 0 && (
              <div className="text-center text-sm text-text-secondary py-4">No activities logged yet.</div>
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
            <h3 className="text-lg font-semibold">Goals</h3>
            <button className="text-sm text-text-secondary hover:text-white"><Target size={18} /></button>
          </div>
          <div className="space-y-6">
            {safeGoals.map((goal, i) => {
              const progress = Math.min(((Number(goal.currentValue) || 0) / Number(goal.targetValue)) * 100, 100);
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.goalName}</span>
                    <span className="text-text-secondary">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                      className={`h-full bg-accent rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
            {safeGoals.length === 0 && (
              <div className="text-center text-sm text-text-secondary py-4">No goals set yet.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

