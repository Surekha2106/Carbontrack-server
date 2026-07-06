import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const PasswordStrength: React.FC<{ password?: string }> = ({ password = '' }) => {
  let strength = 0;
  if (password.length > 5) strength += 1;
  if (password.length > 7) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-border';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-accent';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    return 'Strong';
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level} 
            className={`flex-1 rounded-full transition-colors ${
              strength >= level ? getStrengthColor() : 'bg-border/30'
            }`} 
          />
        ))}
      </div>
      <div className="text-right">
        <span className="text-[10px] text-text-secondary uppercase tracking-wider">{getStrengthLabel()}</span>
      </div>
    </div>
  );
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password
      };
      const response = await authService.register(payload);
      if (response.token && response.user) {
        login(response.token, response.user);
        navigate('/dashboard');
      } else {
        setError('Registration failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to register';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an Account" subtitle="Join CarbonTrack to monitor your footprint">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </motion.div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-text-secondary pl-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              {...register('fullName')}
              type="text"
              placeholder="John Doe"
              className="glass-input pl-12"
            />
          </div>
          {errors.fullName && <p className="text-red-400 text-xs pl-1">{errors.fullName.message}</p>}
        </div>

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
          <PasswordStrength password={passwordValue} />
          {errors.password && <p className="text-red-400 text-xs pl-1 mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-text-secondary pl-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="glass-input pl-12 pr-12"
            />
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs pl-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="pt-2 pb-2">
          <label className="flex items-start space-x-2 cursor-pointer group">
            <input type="checkbox" {...register('terms')} className="mt-0.5 rounded border-border bg-black/40 text-accent focus:ring-accent focus:ring-offset-0 transition-colors" />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              I agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="text-red-400 text-xs pl-1 mt-1">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Create Account <UserPlus className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
