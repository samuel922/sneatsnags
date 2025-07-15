import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  Grid,
  Avatar,
  RadioGroup,
  FormControl,
  FormLabel,
  Radio,
  Paper,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, Business } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { UserRole } from '../../types/auth';
import type { ApiError } from '../../types/api';
import SweetAlert from '../../utils/sweetAlert';
import { Mail, Lock, User } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['BUYER', 'SELLER', 'BROKER']),
  agreeToTerms: z.boolean().refine(val => val, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [apiError, setApiError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
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
      
      const user = await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });
      SweetAlert.success('Welcome to SneatSnags!', 'Your account has been created successfully');
      
      // Navigate to role-specific dashboard
      if (user.role === UserRole.BUYER) {
        navigate('/buyer/dashboard');
      } else if (user.role === UserRole.SELLER) {
        navigate('/seller/dashboard');
      } else if (user.role === UserRole.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const apiErr = error as ApiError;
      const errorMessage = apiErr.message || 'Registration failed';
      setApiError(errorMessage);
      SweetAlert.error('Registration Failed', errorMessage);
    }
  };

  const roleOptions = [
    { value: UserRole.BUYER, label: 'Buyer', desc: 'I want to buy tickets', icon: '🎫' },
    { value: UserRole.SELLER, label: 'Seller', desc: 'I want to sell tickets', icon: '💰' },
    { value: UserRole.BROKER, label: 'Broker', desc: 'I\'m a ticket broker', icon: '🤝' },
  ];

  return (
    <Card variant="glass" sx={{ maxWidth: '100%', mx: 'auto', position: 'relative' }}>
      <CardHeader>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
              background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <PersonAdd sx={{ fontSize: 32, color: 'white' }} />
          </Avatar>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e293b 0%, #64748b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Join SneatSnags
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your account and start trading tickets
          </Typography>
        </Box>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                '& .MuiAlert-icon': {
                  color: '#ef4444',
                }
              }}
            >
              {apiError}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              placeholder="John"
              variant="outlined"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              {...register('firstName')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} color="#64748b" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  minHeight: '48px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-error fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error:hover fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error.Mui-focused fieldset': {
                    borderColor: '#ef4444',
                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                    fontWeight: 600,
                  },
                  '&.Mui-error': {
                    color: '#ef4444',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Last Name"
              placeholder="Doe"
              variant="outlined"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              {...register('lastName')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} color="#64748b" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  minHeight: '48px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-error fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error:hover fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error.Mui-focused fieldset': {
                    borderColor: '#ef4444',
                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                    fontWeight: 600,
                  },
                  '&.Mui-error': {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} color="#64748b" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  minHeight: '48px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-error fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error:hover fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error.Mui-focused fieldset': {
                    borderColor: '#ef4444',
                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                    fontWeight: 600,
                  },
                  '&.Mui-error': {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </Box>

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'text.primary', fontWeight: 600 }}>
              <Business sx={{ mr: 1, fontSize: 18 }} />
              Account Type
            </FormLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  {roleOptions.map((option) => (
                    <Paper
                      key={option.value}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        border: '2px solid transparent',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                        '&:has(input:checked)': {
                          borderColor: 'primary.main',
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        },
                      }}
                    >
                      <FormControlLabel
                        value={option.value}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" component="span">
                              {option.icon}
                            </Typography>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {option.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {option.desc}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.role && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.role.message}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} color="#64748b" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  minHeight: '48px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-error fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error:hover fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error.Mui-focused fieldset': {
                    borderColor: '#ef4444',
                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                    fontWeight: 600,
                  },
                  '&.Mui-error': {
                    color: '#ef4444',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              variant="outlined"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} color="#64748b" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  minHeight: '48px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-error fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error:hover fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-error.Mui-focused fieldset': {
                    borderColor: '#ef4444',
                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                    fontWeight: 600,
                  },
                  '&.Mui-error': {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  {...register('agreeToTerms')}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      color: 'primary.main',
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  I agree to the{' '}
                  <Typography
                    component={Link}
                    to="/terms"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Terms of Service
                  </Typography>
                  {' '}and{' '}
                  <Typography
                    component={Link}
                    to="/privacy"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Privacy Policy
                  </Typography>
                </Typography>
              }
              sx={{ alignItems: 'flex-start', ml: 0 }}
            />
            {errors.agreeToTerms && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.agreeToTerms.message}
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            sx={{ width: '100%' }}
            isLoading={isSubmitting}
          >
            {!isSubmitting ? (
              <>
                <PersonAdd sx={{ mr: 1, fontSize: 20 }} />
                Create Account
              </>
            ) : (
              'Creating Account...'
            )}
          </Button>
        </form>
      </CardContent>

      <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Typography
            component={Link}
            to="/login"
            variant="body2"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Sign in here
          </Typography>
        </Typography>
      </Box>
    </Card>
  );
};