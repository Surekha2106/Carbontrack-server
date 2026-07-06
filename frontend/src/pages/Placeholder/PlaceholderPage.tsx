import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 flex flex-col items-center max-w-md text-center"
      >
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <Construction className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-text-secondary">
          We're working hard to bring you the full {title} experience. This feature will be available in the next update!
        </p>
      </motion.div>
    </div>
  );
};

export default PlaceholderPage;
