import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, ChevronRight, Home } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught telemetry error:", error, errorInfo);
    this.setState({ errorInfo });

    // Log the error to Firestore automatically under `/errors` for telemetry error monitoring
    try {
      addDoc(collection(db, 'system_errors'), {
        errorMessage: error.message || 'Unknown Error',
        stack: error.stack || 'No stack',
        componentStack: errorInfo.componentStack || 'No component stack',
        createdAt: new Date().toISOString(),
        environment: 'Production-Build',
        userAgent: navigator.userAgent
      }).catch(err => console.error('Error logging failsafe:', err));
    } catch (e) {
      console.error('Failed to log error to firestore telemetry:', e);
    }
  }

  private handleReset = () => {
    // Attempt system self-heal
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          {/* Neon error rings */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-rose-500/10 blur-[100px]" />
          
          <div className="z-10 max-w-md w-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/60">
            {/* Critical Shield Indicator */}
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/5">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-extrabold text-white tracking-wider uppercase mb-2">TELEMETRY SYSTEM CRASH</h1>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6 uppercase tracking-wider font-semibold">
              The application encountered an unhandled physical rendering exception. [STATUS code 500]
            </p>

            {/* Micro Debug Console */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-6 text-left text-xs font-mono text-rose-400 overflow-x-auto max-h-[150px] scrollbar-thin">
              <p className="text-zinc-500 font-bold uppercase mb-1">SYSTEM EXCEPTION LOG:</p>
              <p className="font-bold">{this.state.error?.toString()}</p>
              {this.state.errorInfo && (
                <p className="text-[10px] text-zinc-500 mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/15"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>RECALIBRATE & RECOVER SESSION</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>FORCE HARD RELOAD</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
