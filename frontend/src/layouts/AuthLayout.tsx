import React from 'react';
import { motion } from 'framer-motion';
import LeafCanvas from '../components/ui/LeafCanvas';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-border shadow-sm mb-6"
          >
            {/* 3D Leaf Particles */}
            <div className="w-12 h-12">
              <LeafCanvas />
            </div>
          </motion.div>
          <h2 className="text-3xl font-semibold mb-2">{title}</h2>
          <p className="text-text-secondary">{subtitle}</p>
        </div>

        <div className="glass-panel p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
