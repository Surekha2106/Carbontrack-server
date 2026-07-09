import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Leaf, Activity, BarChart3, Globe, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none bg-black/50">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/50">
          <Leaf className="w-5 h-5 text-accent" />
        </div>
        <span className="text-xl font-bold tracking-tight">CarbonTrack</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
        <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium hover:text-white transition-colors">Log In</Link>
        <Link to="/register" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="pt-32 pb-20 px-6 min-h-screen flex items-center relative overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
    
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          The Future of Sustainability
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
          Track Your Carbon. <br />
          <span className="text-gradient">Reduce Your Impact.</span>
        </h1>
        <p className="text-lg text-text-secondary mb-8 max-w-xl leading-relaxed">
          A smart carbon footprint tracking platform that allows you to monitor daily emissions, set sustainability goals, earn eco badges, and visualize your environmental impact.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/register" className="btn-primary text-lg px-8 py-4">
            Start Tracking Free <ArrowRight className="w-5 h-5 ml-2 inline" />
          </Link>
          <a href="#demo" className="btn-secondary text-lg px-8 py-4">
            View Live Demo
          </a>
        </div>
        
        <div className="mt-12 flex items-center gap-6 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Data Encrypted
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" /> Real-time Analytics
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative"
      >
        <div className="relative w-full aspect-square max-w-[600px] mx-auto">
          {/* Abstract Globe Representation */}
          <div className="absolute inset-0 rounded-full border border-border/50 animate-[spin_60s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-accent/20 border-dashed animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-accent/5 to-blue-500/5 backdrop-blur-3xl border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden">
            <Globe className="w-32 h-32 text-accent/50" />
          </div>
          
          {/* Floating Stat Cards */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-8 glass-panel p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-xs text-text-secondary">Trees Saved</div>
              <div className="text-xl font-bold">1,248</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/3 -right-4 glass-panel p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-text-secondary">CO₂ Reduced</div>
              <div className="text-xl font-bold">4.2 Tons</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="py-24 px-6 relative z-10">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful tracking features</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">Everything you need to monitor and reduce your environmental impact in one beautiful dashboard.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <BarChart3 className="w-6 h-6" />, title: "Real-time Analytics", desc: "Monitor your emissions daily with beautiful, interactive charts and insights." },
          { icon: <Globe className="w-6 h-6" />, title: "Global Benchmarks", desc: "Compare your footprint with global averages and see where you stand." },
          { icon: <Activity className="w-6 h-6" />, title: "Smart Goals", desc: "Set reduction targets and let our AI suggest actionable steps to achieve them." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 group hover:bg-white/5 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border py-12 px-6">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-accent" />
        <span className="font-semibold">CarbonTrack</span>
      </div>
      <p className="text-sm text-text-secondary">© 2026 CarbonTrack. All rights reserved.</p>
      <div className="flex gap-4 text-sm text-text-secondary">
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
        <a href="#" className="hover:text-white transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
