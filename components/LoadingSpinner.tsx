import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-2">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
      <span className="ml-2 text-sm text-slate-400">AI is thinking...</span>
    </div>
  );
};

export default LoadingSpinner;