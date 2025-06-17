import React from 'react';

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: string | null;
  isLoading?: boolean;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, onSubmit, error, isLoading, children, footerContent }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-slate-200 mb-8 text-center">{title}</h1>
        {error && (
          <div className="bg-red-700 border border-red-600 text-red-100 px-4 py-3 rounded-md mb-6 text-sm" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : title}
          </button>
        </form>
        {footerContent && (
          <div className="mt-8 text-center text-sm text-slate-400">
            {footerContent}
          </div>
        )}
      </div>
       <footer className="text-center text-xs text-slate-500 mt-8">
        <p>&copy; {new Date().getFullYear()} Dense AI. Server interactions are simulated using localStorage.</p>
      </footer>
    </div>
  );
};

export default AuthForm;
