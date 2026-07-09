import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PieChart, Activity, Download } from 'lucide-react';
import { activityService } from '../../services/activityService';

export const AnalyticsPage: React.FC = () => {
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        await activityService.getActivities();
        // setActivities(res); // Aggregation logic here
      } catch (error) {
        console.error('Failed to fetch activities', error);
      }
    };
    fetchActivities();
  }, []);

  // Prepare mocked or aggregated data for charts
  const categoryData = [
    { name: 'Transport', emissions: 120, fill: '#3b82f6' },
    { name: 'Food', emissions: 85, fill: '#22c55e' },
    { name: 'Energy', emissions: 150, fill: '#eab308' },
    { name: 'Shopping', emissions: 45, fill: '#a855f7' },
  ];

  const timelineData = [
    { month: 'Jan', emissions: 400 },
    { month: 'Feb', emissions: 300 },
    { month: 'Mar', emissions: 350 },
    { month: 'Apr', emissions: 200 },
    { month: 'May', emissions: 280 },
    { month: 'Jun', emissions: 180 },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card flex flex-col"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Emissions Over Time
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
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
          <h3 className="text-lg font-bold mb-6">Emissions by Category</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" />
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
            <p className="text-xl font-bold text-yellow-500 mt-1">Energy (150 kg)</p>
          </div>
          <div className="p-4 rounded-xl bg-surface/30 border border-border">
            <p className="text-text-secondary text-sm">Monthly Average</p>
            <p className="text-xl font-bold text-accent mt-1">285 kg CO₂</p>
          </div>
          <div className="p-4 rounded-xl bg-surface/30 border border-border">
            <p className="text-text-secondary text-sm">Trend</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">-12% vs last month</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
