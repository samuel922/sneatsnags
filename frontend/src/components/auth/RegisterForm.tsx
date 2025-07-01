import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { UserRole } from '../../types/auth';
import type { ApiError } from '../../types/api';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Briefcase } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.string(),
  agreeToTerms: z.boolean().refine(val => val, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.BUYER,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setApiError('');
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
      });
      navigate('/dashboard');
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr.message || 'Registration failed');
    }
  };

  const roleOptions = [
    { value: UserRole.BUYER, label: 'Buyer', desc: 'I want to buy tickets', icon: '🎫' },
    { value: UserRole.SELLER, label: 'Seller', desc: 'I want to sell tickets', icon: '💰' },
    { value: UserRole.BROKER, label: 'Broker', desc: 'I\'m a ticket broker', icon: '🤝' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      {/* Animated background */}
      <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob floating"></div>
      <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob floating" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob floating" style={{ animationDelay: '4s' }}></div>

      <Card variant="glass" className="backdrop-blur-xl border-white/30 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Join AutoMatch
            </h2>
            <p className="text-gray-600">Create your account and start trading tickets</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {apiError && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-3 animate-pulse"></div>
                  {apiError}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                variant="glass"
                icon={<User className="h-5 w-5" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                variant="glass"
                icon={<User className="h-5 w-5" />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              variant="glass"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Account Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Briefcase className="h-4 w-4 inline mr-2" />
                Account Type
              </label>
              <div className="grid gap-3">
                {roleOptions.map((option) => (
                  <label key={option.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      value={option.value}
                      {...register('role')}
                      className="sr-only peer"
                    />
                    <div className="glass rounded-xl p-4 border-2 border-transparent peer-checked:border-blue-500 peer-checked:bg-blue-50/30 hover:bg-white/40 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="text-sm text-red-600 animate-pulse">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  variant="glass"
                  icon={<Lock className="h-5 w-5" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  variant="glass"
                  icon={<Lock className="h-5 w-5" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-10 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-white/50 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                  {...register('agreeToTerms')}
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600 animate-pulse">{errors.agreeToTerms.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              {!isSubmitting && (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <div className="text-center pt-6 border-t border-white/20">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};