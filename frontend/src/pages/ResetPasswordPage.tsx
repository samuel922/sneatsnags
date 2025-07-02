import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { authService } from '../services/authService';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid reset token. Please try requesting a new reset link.');
      return;
    }

    try {
      setError('');
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto animate-fade-in">
          <Card variant="glass" className="backdrop-blur-xl border-white/30 shadow-2xl text-center">
            <CardHeader className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Invalid Reset Link
                </h2>
                <p className="text-gray-600">
                  This password reset link is invalid or has expired.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <Link to="/forgot-password">
                  <Button variant="gradient" className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto animate-fade-in">
          <Card variant="glass" className="backdrop-blur-xl border-white/30 shadow-2xl text-center">
            <CardHeader className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Password Reset Successful!
                </h2>
                <p className="text-gray-600">
                  Your password has been successfully reset. You will be redirected to the login page shortly.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <Link to="/login">
                <Button variant="gradient" className="w-full">
                  Continue to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <Card variant="glass" className="backdrop-blur-xl border-white/30 shadow-2xl">
          <CardHeader className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Reset Password
              </h2>
              <p className="text-gray-600">
                Enter your new password below
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-3 animate-pulse"></div>
                    {error}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    variant="glass"
                    icon={<Lock className="h-5 w-5" />}
                    iconPosition="left"
                    error={errors.password?.message}
                    className="pr-12"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[calc(50%+12px)] transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    variant="glass"
                    icon={<Lock className="h-5 w-5" />}
                    iconPosition="left"
                    error={errors.confirmPassword?.message}
                    className="pr-12"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-[calc(50%+12px)] transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
                <p className="text-sm">
                  Password requirements:
                </p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                </ul>
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
                    <Lock className="h-5 w-5 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <div className="text-center pt-6 border-t border-white/20">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};