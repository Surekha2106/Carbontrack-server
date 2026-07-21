import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Building2, Globe, Hash, Users, Layers, Info, CheckCircle } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const registerSchema = z.object({
  accountType: z.enum(['INDIVIDUAL', 'ORGANIZATION', 'EMPLOYEE']),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  // Enterprise fields
  organisationName: z.string().optional(),
  industry: z.string().optional(),
  orgSize: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  website: z.string().optional(),
  contactNumber: z.string().optional(),
  inviteCode: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === 'ORGANIZATION') {
    return !!data.organisationName && data.organisationName.trim().length > 0;
  }
  return true;
}, {
  message: "Company / Organisation name is required to register a new organization",
  path: ["organisationName"],
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
  const [accountType, setAccountType] = useState<'INDIVIDUAL' | 'ORGANIZATION'>('INDIVIDUAL');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: 'INDIVIDUAL',
      industry: 'Technology & IT Services',
      orgSize: '50-250 Employees',
      country: 'India',
      terms: true
    }
  });

  const passwordValue = watch('password');

  const handleAccountTypeChange = (type: 'INDIVIDUAL' | 'ORGANIZATION') => {
    setAccountType(type);
    setValue('accountType', type);
    setError('');
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        accountType: data.accountType === 'ORGANIZATION' ? 'ORGANIZATION' : 'INDIVIDUAL',
        organisationName: data.accountType === 'ORGANIZATION' ? data.organisationName : undefined,
        industry: data.industry,
        orgSize: data.orgSize,
        country: data.country,
        state: data.state,
        city: data.city,
        address: data.address,
        gstNumber: data.gstNumber,
        website: data.website,
        contactNumber: data.contactNumber
      };

      const response = await authService.register(payload);
      if (response.token && response.user) {
        login(response.token, response.user);
        const role = response.user.role;
        if (role === 'ORG_ADMIN' || role === 'EMPLOYEE' || role === 'ORG_MANAGER' || role === 'DEPARTMENT_HEAD' || response.user.accountType === 'ORGANIZATION') {
          navigate('/organisation');
        } else {
          navigate('/dashboard');
        }
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

  const getLayoutHeader = () => {
    switch (accountType) {
      case 'ORGANIZATION':
        return {
          title: "Create Organization (Admin Account)",
          subtitle: "Register your company or campus workspace to manage GHG emissions and invite employees."
        };
      default:
        return {
          title: "Create Personal Account",
          subtitle: "Join CarbonTrack to calculate personal carbon emissions and compete on global community leaderboards."
        };
    }
  };

  const headerInfo = getLayoutHeader();

  return (
    <AuthLayout title={headerInfo.title} subtitle={headerInfo.subtitle}>
      {/* Account Type Toggle Selector */}
      <div className="mb-6 bg-surface-hover p-1.5 rounded-2xl flex border border-border gap-1">
        <button
          type="button"
          onClick={() => handleAccountTypeChange('INDIVIDUAL')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            accountType === 'INDIVIDUAL'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Individual
        </button>
        <button
          type="button"
          onClick={() => handleAccountTypeChange('ORGANIZATION')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            accountType === 'ORGANIZATION'
              ? 'bg-accent text-white shadow-md shadow-accent/20'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> New Organization
        </button>

      </div>

      {/* Account Type Guidance Banners */}
      {accountType === 'ORGANIZATION' && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-200 font-semibold mb-0.5">Admin Registration Only</strong>
            This form provisions a brand-new corporate tenant workspace. If you are an employee, please switch to <strong>Join as Employee</strong> or sign up using your company email domain.
          </div>
        </div>
      )}



      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </motion.div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-text-secondary pl-1">
            {accountType === 'ORGANIZATION' ? 'Admin Full Name' : 'Full Name'}
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              {...register('fullName')}
              type="text"
              placeholder={accountType === 'ORGANIZATION' ? 'e.g. Jane Doe (Sustainability Director)' : 'Enter Your Full Name'}
              className="glass-input !pl-12"
            />
          </div>
          {errors.fullName && <p className="text-red-400 text-xs pl-1">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-text-secondary pl-1">
            {accountType === 'ORGANIZATION' ? 'Company Work Email' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              {...register('email')}
              type="email"
              placeholder={accountType === 'INDIVIDUAL' ? 'user@example.com' : 'admin@company.com'}
              className="glass-input !pl-12"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs pl-1">{errors.email.message}</p>}
        </div>

        <AnimatePresence mode="wait">
          {/* Organization Creation Form Fields */}
          {accountType === 'ORGANIZATION' && (
            <motion.div
              key="org-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 pt-2 pb-2 border-t border-b border-border/50 overflow-hidden"
            >
              <div className="space-y-1">
                <label className="text-sm text-text-secondary pl-1">Organisation / Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  <input
                    {...register('organisationName')}
                    type="text"
                    placeholder="e.g. Saveetha Institute / Acme Eco Corp"
                    className="glass-input !pl-12 border-accent/40 focus:border-accent"
                  />
                </div>
                {errors.organisationName && <p className="text-red-400 text-xs pl-1">{errors.organisationName.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary pl-1">Industry Sector</label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <select {...register('industry')} className="glass-input !pl-10 text-sm">
                      <option value="Technology & IT Services">Technology & IT Services</option>
                      <option value="Education & Campus">Education & Campus</option>
                      <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                      <option value="Energy & Utilities">Energy & Utilities</option>
                      <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                      <option value="Finance & Banking">Finance & Banking</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary pl-1">Organisation Size</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <select {...register('orgSize')} className="glass-input !pl-10 text-sm">
                      <option value="1-50 Employees">1-50 Employees</option>
                      <option value="50-250 Employees">50-250 Employees</option>
                      <option value="250-1000 Employees">250-1000 Employees</option>
                      <option value="1000+ Enterprise">1000+ Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary pl-1">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input {...register('country')} type="text" placeholder="e.g. India" className="glass-input !pl-10 text-sm" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary pl-1">GST / Tax Registration (Optional)</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input {...register('gstNumber')} type="text" placeholder="e.g. 22AAAAA0000A1Z5" className="glass-input !pl-10 text-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              placeholder="Confirm Your Password"
              className="glass-input !pl-12 !pr-12"
            />
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs pl-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="pt-2 pb-2">
          <label className="flex items-start space-x-2 cursor-pointer group">
            <input type="checkbox" {...register('terms')} className="mt-0.5 rounded border-border bg-white text-accent focus:ring-accent focus:ring-offset-0 transition-colors" />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              I agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="text-red-400 text-xs pl-1 mt-1">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full shadow-lg shadow-accent/25"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {accountType === 'ORGANIZATION'
                ? 'Create Organization & Become Admin'
                : 'Create Personal Account'} <UserPlus className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 flex items-center justify-between">
        <span className="border-b border-border w-1/5 lg:w-1/4"></span>
        <span className="text-xs text-center text-text-secondary uppercase tracking-wider">or sign up with</span>
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
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
