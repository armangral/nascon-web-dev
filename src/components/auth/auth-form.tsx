import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/auth-store';
import { isValidEmail } from '../../lib/utils';

interface AuthFormProps {
  type: 'login' | 'register';
}

export function AuthForm({ type }: AuthFormProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (type === 'register' && !fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (type === 'login') {
        await signIn(email, password);
        navigate('/dashboard');
      } else {
        await signUp(email, password, fullName, role);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({
        form: 'Authentication failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {type === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {type === 'login' ? (
            <>
              Or{' '}
              <button
                onClick={() => navigate('/auth/register')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                create a new account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {errors.form && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{errors.form}</h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="rounded-md shadow-sm space-y-4">
          {type === 'register' && (
            <Input
              id="fullName"
              name="fullName"
              type="text"
              label="Full Name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              required
            />
          )}
          
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete={type === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          
          {type === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">I am a:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="tutor"
                    checked={role === 'tutor'}
                    onChange={() => setRole('tutor')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tutor</span>
                </label>
              </div>
            </div>
          )}
        </div>
        
        {type === 'login' && (
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          {type === 'login' ? 'Sign in' : 'Sign up'}
        </Button>
      </form>
    </div>
  );
}