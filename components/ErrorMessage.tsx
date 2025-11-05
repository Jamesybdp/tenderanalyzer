import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative flex flex-col items-center justify-center text-center" role="alert">
      <strong className="font-bold block mb-2">Analysis Failed</strong>
      <span className="block sm:inline text-sm">{message}</span>
    </div>
  );
};
