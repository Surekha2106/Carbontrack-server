import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [inviteInfo, setInviteInfo] = useState<{ email: string; organizationName: string } | null>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No invitation token found.');
      setLoadingInfo(false);
      return;
    }
    
    // Fetch invite info
    const fetchInviteInfo = async () => {
      try {
        const response = await apiClient.get(`/auth/invite-info?token=${token}`);
        setInviteInfo(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load invitation. It may be expired or invalid.');
      } finally {
        setLoadingInfo(false);
      }
    };
    
    fetchInviteInfo();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await apiClient.post('/auth/accept-invite', {
        token,
        fullName: formData.fullName,
        password: formData.password
      });
      
      const data = response.data;
      
      setSuccess(true);
      
      // Auto-login
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while setting up your account.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1712] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#121c16] rounded-2xl shadow-xl dark:shadow-black/50 border border-slate-200 dark:border-emerald-900/30 overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Join CarbonTrack
            </h1>
            <p className="text-slate-500 dark:text-emerald-400/70 mt-2">
              Setup your employee account
            </p>
          </div>
          
          {loadingInfo ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Verifying invitation...</p>
            </div>
          ) : error && !success ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-900/30 mb-6">
              {error}
            </div>
          ) : success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Account Created Successfully!
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Redirecting you to your dashboard...
              </p>
            </motion.div>
          ) : (
            <>
              {inviteInfo && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-6 border border-emerald-100 dark:border-emerald-800/30">
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    You've been invited to join <span className="font-semibold">{inviteInfo.organizationName}</span>.
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-1">
                    Registering with: {inviteInfo.email}
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-emerald-900/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-emerald-900/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-emerald-900/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptInvite;
