import React from 'react';
import { AuthForm } from '../../components/auth/auth-form';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <GraduationCap className="h-12 w-12 text-blue-600" />
        </Link>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthForm type="register" />
        </div>
      </div>
    </div>
  );
}