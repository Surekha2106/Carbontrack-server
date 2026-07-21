import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Save } from 'lucide-react';
import { goalService } from '../../services/goalService';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

interface GoalFormValues {
  goalName: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose, onGoalCreated }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GoalFormValues>();

  const onSubmit = async (data: GoalFormValues) => {
    try {
      await goalService.createGoal({
        ...data,
        targetValue: Number(data.targetValue),
        status: 'IN_PROGRESS',
        currentValue: 0,
      });
      reset();
      onGoalCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create goal', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-border bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 text-accent rounded-lg">
                <Target size={24} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">Create New Goal</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Goal Name</label>
              <input
                {...register('goalName', { required: 'Goal Name is required' })}
                className="glass-input"
                placeholder="e.g. Reduce Car Usage"
              />
              {errors.goalName && <p className="text-red-500 text-sm mt-1">{errors.goalName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Target Value</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('targetValue', { required: 'Target is required', min: 0.1 })}
                  className="glass-input"
                  placeholder="e.g. 50"
                />
                {errors.targetValue && <p className="text-red-500 text-sm mt-1">{errors.targetValue.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Unit</label>
                <select
                  {...register('unit', { required: 'Unit is required' })}
                  className="glass-input appearance-none bg-surface"
                >
                  <option value="kg CO2">kg CO2</option>
                  <option value="kWh">kWh</option>
                  <option value="liters">Liters</option>
                  <option value="km">Kilometers</option>
                </select>
                {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start Date is required' })}
                  className="glass-input"
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
                <input
                  type="date"
                  {...register('endDate', { required: 'End Date is required' })}
                  className="glass-input"
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">Creating...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save size={18} /> Create Goal</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
