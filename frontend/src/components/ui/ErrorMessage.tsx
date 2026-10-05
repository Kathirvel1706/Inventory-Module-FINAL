import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Failed to load data',
  message = 'An error occurred while connecting to the server. Please verify your connection or try again.',
  onRetry,
}) => {
  return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-4">
      <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
        <p className="text-xs text-rose-700 mt-1 leading-relaxed">{message}</p>
        {onRetry && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="bg-white border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              Retry Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
