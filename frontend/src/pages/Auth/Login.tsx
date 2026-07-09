import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(data);
      if (response.token && response.user) {
        login(response.token, response.user);
        navigate('/dashboard');
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

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue to CarbonTrack">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </motion.div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-text-secondary pl-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="glass-input pl-12"
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
              placeholder="••••••••"
              className="glass-input pl-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs pl-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input type="checkbox" {...register('rememberMe')} className="mt-0.5 rounded border-border bg-black/40 text-accent focus:ring-accent focus:ring-offset-0 transition-colors" />
            <span className="text-text-secondary group-hover:text-text-primary transition-colors">Remember me</span>
          </label>
          <a href="#" className="text-accent hover:text-accent-hover transition-colors">Forgot password?</a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full mt-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In <LogIn className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>



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
