import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Car, Leaf, Zap, ShoppingBag, Loader2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { activityService } from '../../services/activityService';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedActivities = React.useMemo(() => {
    if (!Array.isArray(activities)) return [];
    let sortableItems = [...activities];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'emission' || sortConfig.key === 'quantity') {
          aValue = Number(aValue || 0);
          bValue = Number(bValue || 0);
        } else if (sortConfig.key === 'logDate') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [activities, sortConfig]);

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={14} className="ml-1 text-accent" /> : 
      <ChevronDown size={14} className="ml-1 text-accent" />;
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-[#141A17] dark:text-white">All Activities</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">A detailed log of all your tracked carbon footprint activities.</p>
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
                <th 
                  className="px-6 py-4 font-medium cursor-pointer group hover:text-white transition-colors select-none"
                  onClick={() => handleSort('activityType')}
                >
                  <div className="flex items-center">Type {getSortIcon('activityType')}</div>
                </th>
                <th 
                  className="px-6 py-4 font-medium cursor-pointer group hover:text-white transition-colors select-none"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">Category {getSortIcon('category')}</div>
                </th>
                <th 
                  className="px-6 py-4 font-medium cursor-pointer group hover:text-white transition-colors select-none"
                  onClick={() => handleSort('logDate')}
                >
                  <div className="flex items-center">Date {getSortIcon('logDate')}</div>
                </th>
                <th 
                  className="px-6 py-4 font-medium text-right cursor-pointer group hover:text-white transition-colors select-none"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center justify-end">Quantity {getSortIcon('quantity')}</div>
                </th>
                <th 
                  className="px-6 py-4 font-medium text-right cursor-pointer group hover:text-white transition-colors select-none"
                  onClick={() => handleSort('emission')}
                >
                  <div className="flex items-center justify-end">Emissions (kg CO₂) {getSortIcon('emission')}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sortedActivities.length > 0 ? sortedActivities.map((activity) => (
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
