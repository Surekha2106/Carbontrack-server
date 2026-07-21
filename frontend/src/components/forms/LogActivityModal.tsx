import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity?: (activity: any) => void;
}

interface ActivityFormValues {
  transportAmount?: number;
  energyAmount?: number;
  foodType?: string;
  foodAmount?: number;
  shoppingAmount?: number;
  date: string;
  notes?: string;
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({ isOpen, onClose, onAddActivity }) => {
  const { register, handleSubmit, reset } = useForm<ActivityFormValues>();

  const onSubmit = async (data: ActivityFormValues) => {
    try {
      if (onAddActivity) {
        await onAddActivity(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to add activity", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-panel p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white hover:bg-gray-100 text-text-secondary hover:text-text-primary transition-colors border border-border"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-1">Log Activity</h2>
              <p className="text-sm text-text-secondary">Track a new action to reduce your carbon footprint.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-1 mb-2">
                <label className="text-sm text-text-secondary pl-1">Date</label>
                <input
                  {...register('date', { required: true })}
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="glass-input"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary pl-1">🚗 Transport (km)</label>
                  <input
                    {...register('transportAmount', { min: 0 })}
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15"
                    className="glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary pl-1">⚡ Home Energy (kWh)</label>
                  <input
                    {...register('energyAmount', { min: 0 })}
                    type="number"
                    step="0.1"
                    placeholder="e.g. 10"
                    className="glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary pl-1">🥗 Food & Diet (meals)</label>
                  <div className="flex gap-2">
                    <select {...register('foodType')} className="glass-input w-1/2 text-xs" style={{ colorScheme: 'light' }}>
                      <option value="food">General</option>
                      <option value="chicken_biryani">Chicken Biryani</option>
                      <option value="mutton_biryani">Mutton Biryani</option>
                      <option value="tiffin">Tiffin</option>
                      <option value="veg_meals">Veg Meals</option>
                      <option value="dosa">Dosa</option>
                      <option value="pizza">Pizza</option>
                      <option value="burger">Burger</option>
                      <option value="tea_coffee">Tea / Coffee</option>
                    </select>
                    <input
                      {...register('foodAmount', { min: 0 })}
                      type="number"
                      step="0.1"
                      placeholder="e.g. 3"
                      className="glass-input w-1/2"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary pl-1">🛍️ Shopping (items)</label>
                  <input
                    {...register('shoppingAmount', { min: 0 })}
                    type="number"
                    step="1"
                    placeholder="e.g. 2"
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-text-secondary pl-1">Additional Notes (Optional)</label>
                <textarea
                  {...register('notes')}
                  placeholder="e.g., Rode the bus to work today instead of driving."
                  className="glass-input min-h-[100px] resize-y"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Activity <Plus size={18} className="ml-2" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
