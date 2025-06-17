

import React, { useState } from 'react';
import AuthForm from './AuthForm';
import * as AuthService from '../authService';
import { User } from '../types';

interface SignInPageProps {
  onSignInSuccess: (user: User) => void;
  onNavigateToSignUp: () => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onSignInSuccess, onNavigateToSignUp, authError, setAuthError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null); 
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
        setAuthError("Email and password are required.");
        setIsLoading(false);
        return;
    }

    const result = await AuthService.signIn(email, password);
    setIsLoading(false);

    if (result.success && result.user) {
      onSignInSuccess(result.user);
    } else {
      setAuthError(result.message);
    }
  };

  return (
    <AuthForm
      title="Sign In"
      onSubmit={handleSubmit}
      error={authError}
      isLoading={isLoading}
      footerContent={
        <p>
          Don't have an account?{' '}
          <button 
            onClick={() => {
              setAuthError(null); 
              onNavigateToSignUp();
            }} 
            className="font-semibold text-gray-300 hover:text-gray-400"
          >
            Sign Up
          </button>
        </p>
      }
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none placeholder-slate-400"
          placeholder="you@example.com"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none placeholder-slate-400"
          placeholder="Your Password"
          disabled={isLoading}
        />
      </div>
    </AuthForm>
  );
};

export default SignInPage;