import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PieChart, Activity, Download } from 'lucide-react';
import { activityService } from '../../services/activityService';

export const AnalyticsPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await activityService.getActivities();
        setActivities(res);
      } catch (error) {
        console.error('Failed to fetch activities', error);
      }
    };
    fetchActivities();
  }, []);

  // Apply date filters to activities
  const filteredActivities = React.useMemo(() => {
    if (!activities) return [];
    const now = new Date();
    return activities.filter(act => {
      const actDate = new Date(act.logDate);
      if (filterType === 'All Time') return true;
      if (filterType === 'Last Week') {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        return actDate >= lastWeek;
      }
      if (filterType === 'Last Month') {
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        return actDate >= lastMonth;
      }
      if (filterType === 'Last Year') {
        const lastYear = new Date(now);
        lastYear.setFullYear(now.getFullYear() - 1);
        return actDate >= lastYear;
      }
      if (filterType === 'Custom') {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return actDate >= start && actDate <= end;
      }
      return true;
    });
  }, [activities, filterType, customStartDate, customEndDate]);

  // Generate live timeline data grouped by Month-Year
  const timelineData = React.useMemo(() => {
    if (!filteredActivities || filteredActivities.length === 0) return [];
    
    const grouped = filteredActivities.reduce((acc, act) => {
      const date = new Date(act.logDate);
      const monthYear = date.toLocaleString('default', { month: 'short' });
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear] += Number(act.emission || 0);
      return acc;
    }, {} as Record<string, number>);

    // Activities are typically returned newest first, so we might want to reverse them
    // but a better way is to sort by actual date
    const sortedMonths = Object.keys(grouped).sort((a, b) => {
      return new Date(a + ' 1, 2026').getTime() - new Date(b + ' 1, 2026').getTime(); 
    });

    return sortedMonths.map(month => ({
      month,
      emissions: Number(grouped[month].toFixed(2))
    }));
  }, [filteredActivities]);

  // Generate live category data
  const categoryData = React.useMemo(() => {
    if (!filteredActivities || filteredActivities.length === 0) return [];

    const grouped = filteredActivities.reduce((acc, act) => {
      const cat = act.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Number(act.emission || 0);
      return acc;
    }, {} as Record<string, number>);

    const colorMap: Record<string, string> = {
      'Transport': '#3b82f6',
      'Food': '#22c55e',
      'Electricity': '#eab308',
      'Shopping': '#a855f7'
    };

    return Object.entries(grouped).map(([name, emissions]) => ({
      name,
      emissions: Number((emissions as number).toFixed(2)),
      fill: colorMap[name] || '#8b5cf6'
    })).sort((a, b) => b.emissions - a.emissions);
  }, [filteredActivities]);

  const topCategory = categoryData.length > 0 ? categoryData[0] : null;
  const totalEmissions = categoryData.reduce((sum, item) => sum + item.emissions, 0);
  const averageEmissions = timelineData.length > 0 ? (totalEmissions / timelineData.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PieChart className="text-accent" /> Detailed Analytics
          </h1>
          <p className="text-text-secondary mt-1">Deep dive into your emission trends and category breakdowns.</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-surface/30 p-4 rounded-2xl border border-border">
        <span className="text-sm font-bold text-text-secondary">Filter by:</span>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:border-accent"
        >
          <option value="All Time">All Time</option>
          <option value="Last Week">Last Week</option>
          <option value="Last Month">Last Month</option>
          <option value="Last Year">Last Year</option>
          <option value="Custom">Custom Range</option>
        </select>

        {filterType === 'Custom' && (
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:border-accent"
            />
            <span className="text-text-secondary">to</span>
            <input 
              type="date" 
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:border-accent"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card flex flex-col"
        >
          <h3 className="text-lg font-bold mb-6 text-[#141A17] dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Emissions Over Time
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-base)" />
                <XAxis dataKey="month" stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(34,197,94,0.3)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="emissions" stroke="#22c55e" strokeWidth={3} dot={{ r: 6, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 8, fill: '#fff', stroke: '#22c55e', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card flex flex-col"
        >
          <h3 className="text-lg font-bold mb-6 text-[#141A17] dark:text-white">Emissions by Category</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-base)" />
                <XAxis type="number" stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="var(--color-text-secondary)" fontSize={12} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="emissions" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card mt-6"
      >
        <h3 className="text-lg font-bold mb-4">Carbon Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface/30 border border-border">
            <p className="text-text-secondary text-sm">Top Contributor</p>
            <p className="text-xl font-bold text-yellow-500 mt-1">
              {topCategory ? `${topCategory.name} (${topCategory.emissions} kg)` : 'N/A'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface/30 border border-border">
            <p className="text-text-secondary text-sm">Monthly Average</p>
            <p className="text-xl font-bold text-accent mt-1">{averageEmissions} kg CO₂</p>
          </div>
          <div className="p-4 rounded-xl bg-surface/30 border border-border">
            <p className="text-text-secondary text-sm">Total Activities</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{filteredActivities.length} logs</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
