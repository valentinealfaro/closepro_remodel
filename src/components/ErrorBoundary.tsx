import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      let errorDetails = null;
      try {
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-8">
              {errorDetails ? 'A database error occurred while loading this page.' : 'An unexpected error occurred. Our team has been notified.'}
            </p>

            {errorDetails && (
              <div className="bg-gray-50 rounded-xl p-4 text-left mb-8 overflow-hidden">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Error Details</p>
                <p className="text-xs font-mono text-red-600 break-all">
                  {errorDetails.operationType?.toUpperCase()} error at {errorDetails.path || 'unknown path'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-electric text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                <RefreshCcw size={18} />
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-navy rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                <Home size={18} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
