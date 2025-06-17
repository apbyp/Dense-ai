

import React, { useState } from 'react';
import AuthForm from './AuthForm';
import * as AuthService from '../authService'; 

interface SignUpPageProps {
  onSignUpSuccess: () => void; 
  onNavigateToSignIn: () => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUpSuccess, onNavigateToSignIn, authError, setAuthError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    if (!name.trim() || !email.trim() || !password.trim()) {
        setAuthError("All fields are required.");
        setIsLoading(false);
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setAuthError("Please enter a valid email address.");
        setIsLoading(false);
        return;
    }

    if (password.length < 8) {
        setAuthError("Password must be at least 8 characters long.");
        setIsLoading(false);
        return;
    }

    const result = await AuthService.signUp(name, email, password);
    setIsLoading(false);

    if (result.success) {
      onSignUpSuccess(); 
    } else {
      setAuthError(result.message);
    }
  };

  return (
    <AuthForm
      title="Create Account"
      onSubmit={handleSubmit}
      error={authError}
      isLoading={isLoading}
      footerContent={
        <p>
          Already have an account?{' '}
          <button 
            onClick={() => {
                setAuthError(null);
                onNavigateToSignIn();
            }} 
            className="font-semibold text-gray-300 hover:text-gray-400"
          >
            Sign In
          </button>
        </p>
      }
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none placeholder-slate-400"
          placeholder="Your Name"
          disabled={isLoading}
        />
      </div>
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none placeholder-slate-400"
          placeholder="Min. 8 characters"
          disabled={isLoading}
        />
         {password && password.length > 0 && password.length < 8 && (
          <p className="text-xs text-yellow-400 mt-1">Password should be at least 8 characters.</p>
        )}
      </div>
    </AuthForm>
  );
};

export default SignUpPage;