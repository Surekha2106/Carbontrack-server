import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Car, Leaf, Zap, ShoppingBag, Loader2 } from 'lucide-react';
import { activityService } from '../../services/activityService';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await activityService.getActivities();
        setActivities(res);
      } catch (error) {
        console.error('Failed to fetch activities', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'transport': return <Car size={18} />;
      case 'food': return <Leaf size={18} />;
      case 'energy': return <Zap size={18} />;
      case 'shopping': return <ShoppingBag size={18} />;
      default: return <Activity size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Activities</h1>
          <p className="text-text-secondary mt-1">A detailed log of all your tracked carbon footprint activities.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/30 text-text-secondary text-sm">
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Quantity</th>
                <th className="px-6 py-4 font-medium text-right">Emissions (kg CO₂)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Array.isArray(activities) && activities.length > 0 ? activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary">
                        {getActivityIcon(activity.activityType || '')}
                      </div>
                      <span className="font-medium capitalize">{activity.activityType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{activity.category}</td>
                  <td className="px-6 py-4 text-text-secondary">{activity.logDate}</td>
                  <td className="px-6 py-4 text-right">{activity.quantity} {activity.unit}</td>
                  <td className="px-6 py-4 text-right font-medium text-accent">
                    {activity.emission ? Number(activity.emission).toFixed(2) : '0.00'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                    No activities logged yet. Head over to the dashboard to log your first activity!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
