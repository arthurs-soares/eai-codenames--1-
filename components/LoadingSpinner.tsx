
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
        <p className="mt-4 text-xl text-slate-300 font-semibold">Preparando o jogo...</p>
    </div>
  );
};
