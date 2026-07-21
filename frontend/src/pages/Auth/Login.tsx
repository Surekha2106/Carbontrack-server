import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, Building2, Users, User, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login Mode Selection
  const [portalMode, setPortalMode] = useState<'INDIVIDUAL' | 'ORGANIZATION'>('INDIVIDUAL');

  // OTP States
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleRoleRedirect = (user: any) => {
    const role = user.role;
    const isOrgUser = role === 'ORG_ADMIN' || 
                      role === 'EMPLOYEE' || 
                      role === 'ORG_MANAGER' || 
                      role === 'DEPARTMENT_HEAD' || 
                      user.accountType === 'ORGANIZATION' || 
                      !!user.orgId;

    if (isOrgUser) {
      navigate('/organisation');
    } else {
      navigate('/dashboard');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(data);
      if (response.token && response.user) {
        login(response.token, response.user);
        handleRoleRedirect(response.user);
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to login';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (roleType: 'admin' | 'employee') => {
    setIsLoading(true);
    setError('');
    const email = roleType === 'admin' ? 'orgadmin@carbontrack.com' : 'employee@carbontrack.com';
    const password = 'admin123';
    try {
      const response = await authService.login({ email, password });
      if (response.token && response.user) {
        login(response.token, response.user);
        handleRoleRedirect(response.user);
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your CarbonTrack account. Role & workspace will be detected automatically."
    >
      {/* Account Type / Portal Selector */}
      <div className="mb-6 bg-surface-hover p-1.5 rounded-2xl flex border border-border gap-1">

        <button
          type="button"
          onClick={() => setPortalMode('INDIVIDUAL')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            portalMode === 'INDIVIDUAL'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Individual
        </button>
        <button
          type="button"
          onClick={() => setPortalMode('ORGANIZATION')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            portalMode === 'ORGANIZATION'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Organization
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Quick Demo Credentials Access - Organization Only */}
          {portalMode === 'ORGANIZATION' && (
            <motion.div 
              key="org-demo-cards"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }} 
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 overflow-hidden"
            >
              <div className="flex items-center justify-end">
                <span className="text-[10px] text-accent font-mono uppercase tracking-widest font-bold">Instant Sign-In</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs text-text-primary">Org Admin</span>
                      <span className="text-[9px] text-text-secondary">Full Control</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('employee')}
                  disabled={isLoading}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 hover:border-blue-500/40 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs text-text-primary">Employee</span>
                      <span className="text-[9px] text-text-secondary">Private Dashboard</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- OTP FLOW --- */}
        {loginMethod === 'otp' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-text-secondary pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="glass-input !pl-12 disabled:opacity-50"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  disabled={isOtpSent || isLoading}
                />
              </div>
            </div>

            {isOtpSent && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
                <label className="text-sm text-text-secondary pl-1">6-Digit Code</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="glass-input !pl-12 tracking-widest font-mono text-center"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}

            <button
              type="button"
              onClick={async () => {
                if (!otpEmail) {
                  setError('Please enter your email first.');
                  return;
                }
                setIsLoading(true);
                setError('');
                try {
                  if (!isOtpSent) {
                    await axios.post(`http://${window.location.hostname}:8080/api/auth/otp/send`, { email: otpEmail });
                    setIsOtpSent(true);
                  } else {
                    if (otpCode.length !== 6) {
                      setError('Please enter a valid 6-digit code.');
                      setIsLoading(false);
                      return;
                    }
                    const response = await axios.post(`http://${window.location.hostname}:8080/api/auth/otp/verify`, { email: otpEmail, otp: otpCode });
                    login(response.data.token, response.data.user);
                    handleRoleRedirect(response.data.user);
                  }
                } catch (err: any) {
                  setError(err.response?.data?.message || err.response?.data?.error || 'Authentication failed');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isOtpSent ? (
                'Verify & Sign In'
              ) : (
                'Send Verification Code'
              )}
            </button>
          </motion.div>
        ) : (
          /* --- PASSWORD FLOW --- */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm text-text-secondary pl-1">
                {portalMode === 'ORGANIZATION' ? 'Company Work Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder={portalMode === 'ORGANIZATION' ? 'user@company.com' : 'Enter Your Email'}
                  className="glass-input !pl-12"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs pl-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm text-text-secondary pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Your Password"
                  className="glass-input !pl-12 !pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs pl-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" {...register('rememberMe')} className="mt-0.5 rounded border-border bg-white text-accent focus:ring-accent focus:ring-offset-0 transition-colors" />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-accent hover:text-accent-hover transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 shadow-lg shadow-accent/25"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin font-medium" />
              ) : (
                <>
                  Sign In <LogIn className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </form>

      <div className="mt-4 flex justify-center">
        <button 
          onClick={() => {
            setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
            setError('');
            setIsOtpSent(false);
          }}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors underline decoration-border underline-offset-4"
        >
          {loginMethod === 'password' ? 'Use a One-Time Password (OTP) instead' : 'Log in with Password instead'}
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="border-b border-border w-1/5 lg:w-1/4"></span>
        <span className="text-xs text-center text-text-secondary uppercase tracking-wider">or continue with</span>
        <span className="border-b border-border w-1/5 lg:w-1/4"></span>
      </div>

      <div className="flex gap-4 mt-6">
        <a href={`http://${window.location.hostname}:8080/oauth2/authorization/google`} className="w-full btn-secondary flex justify-center items-center gap-2 py-2.5">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </a>
        <a href={`http://${window.location.hostname}:8080/oauth2/authorization/github`} className="w-full btn-secondary flex justify-center items-center gap-2 py-2.5">
          <svg className="w-5 h-5 text-text-primary" viewBox="0 0 24 24">
            <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          GitHub
        </a>
      </div>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
