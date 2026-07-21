import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, CheckCircle, Clock, Loader2, Trash2, Edit3 } from 'lucide-react';
import { goalService } from '../../services/goalService';
import { CreateGoalModal } from '../../components/forms/CreateGoalModal';
import { useAuth } from '../../context/AuthContext';

export const GoalsPage: React.FC = () => {
  const { } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGoalsAndData = useCallback(async () => {
    try {
      const [goalsRes] = await Promise.all([
        goalService.getGoals().catch(() => [])
      ]);
      setGoals(goalsRes);
    } catch (error) {
      console.error('Failed to fetch goals data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (goalId: number) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await goalService.deleteGoal(goalId);
        fetchGoalsAndData();
      } catch (error) {
        console.error("Failed to delete goal");
        alert("Failed to delete goal");
      }
    }
  };

  useEffect(() => {
    fetchGoalsAndData();
  }, [fetchGoalsAndData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const displayGoals = goals;

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-[#141A17] dark:text-white">
            <Target className="text-accent" /> Your Goals
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-2">Set, track, and crush your carbon reduction targets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" /> Create New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {displayGoals.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-secondary">
            No goals set yet. Click "Create New Goal" to set your first objective!
          </div>
        ) : (
          displayGoals.map((goal, index) => {
            const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isCompleted = goal.status === 'COMPLETED' || progress >= 100;
            
            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-panel flex flex-col h-full p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${isCompleted ? 'bg-accent/20 text-accent' : 'bg-surface/50 text-text-primary'}`}>
                    {isCompleted ? <CheckCircle size={24} /> : <Target size={24} />}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      isCompleted ? 'bg-accent/20 text-accent' : 
                      goal.trackingStatus === 'Behind Schedule' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {isCompleted ? 'Completed' : (goal.trackingStatus || 'In Progress')}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => handleDelete(goal.id)}
                        className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{goal.title || goal.goalName}</h3>
                <p className="text-text-secondary text-sm mb-4 flex-grow">{goal.description}</p>
                
                {goal.alertMessage && !isCompleted && (
                  <div className={`p-3 rounded-xl text-xs font-medium mb-4 ${
                    goal.trackingStatus === 'Behind Schedule' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {goal.alertMessage}
                  </div>
                )}
                
                <div className="space-y-3 mt-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Progress</span>
                    <span className="font-medium">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                  </div>
                  
                  <div className="h-2 w-full bg-surface border border-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full ${isCompleted ? 'bg-accent' : 'bg-gradient-to-r from-accent to-emerald-400'}`}
                    />
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary pt-2">
                    <Clock size={14} />
                    <span>Deadline: {goal.endDate || goal.deadline ? new Date(goal.endDate || goal.deadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <CreateGoalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGoalCreated={fetchGoalsAndData}
      />
    </div>
  );
};

export default GoalsPage;
