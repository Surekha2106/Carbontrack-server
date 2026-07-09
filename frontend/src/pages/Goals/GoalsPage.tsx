import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { goalService } from '../../services/goalService';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await goalService.getGoals();
        setGoals(res);
      } catch (error) {
        console.error('Failed to fetch goals', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // Mocking goals if none exist yet for the UI to look good
  const displayGoals = goals.length > 0 ? goals : [
    { id: 1, title: 'Reduce Transport Emissions', description: 'Cut weekly driving distance by 20%', targetValue: 50, currentValue: 25, unit: 'kg CO2', deadline: '2027-12-31', status: 'IN_PROGRESS' },
    { id: 2, title: 'Plant 10 Trees', description: 'Contribute to the reforestation project', targetValue: 10, currentValue: 10, unit: 'trees', deadline: '2026-10-15', status: 'COMPLETED' },
    { id: 3, title: 'Go Vegan for a Month', description: 'Zero meat consumption for 30 days', targetValue: 30, currentValue: 12, unit: 'days', deadline: '2026-08-01', status: 'IN_PROGRESS' },
  ];

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="text-accent" /> Your Goals
          </h1>
          <p className="text-text-secondary mt-1">Set, track, and crush your carbon reduction targets.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Create New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {displayGoals.map((goal, index) => {
          const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          const isCompleted = goal.status === 'COMPLETED' || progress >= 100;
          
          return (
            <motion.div 
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isCompleted ? 'bg-accent/20 text-accent' : 'bg-surface/50 text-text-primary'}`}>
                  {isCompleted ? <CheckCircle size={24} /> : <Target size={24} />}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  isCompleted ? 'bg-accent/20 text-accent' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {isCompleted ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
              <p className="text-text-secondary text-sm mb-6 flex-grow">{goal.description}</p>
              
              <div className="space-y-3 mt-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Progress</span>
                  <span className="font-medium">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                </div>
                
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${isCompleted ? 'bg-accent' : 'bg-gradient-to-r from-accent to-emerald-400'}`}
                  />
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-text-secondary pt-2">
                  <Clock size={14} />
                  <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsPage;
