import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/6 left-1/3 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-500 rounded-full filter blur-3xl opacity-40 animate-pulse floating"></div>
      <div className="absolute bottom-1/6 right-1/3 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full filter blur-3xl opacity-40 animate-pulse floating" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 left-1/6 w-64 h-64 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full filter blur-3xl opacity-30 animate-pulse floating" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="relative z-10 w-full max-w-lg">
        <RegisterForm />
      </div>
    </div>
  );
};