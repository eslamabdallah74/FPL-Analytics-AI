import React from 'react';
import { Zap, Activity } from 'lucide-react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Processing FPL Analytical Matrix...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6">
      {/* Animated Tactical Radar Pulse Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Rings */}
        <div className="w-24 h-24 rounded-full bg-[#38ef7d]/10 border border-[#38ef7d]/30 animate-ping opacity-75"></div>
        <div className="w-20 h-20 rounded-full bg-[#11998e]/20 border border-[#11998e]/40 animate-pulse absolute"></div>
        
        {/* Center Glowing Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#11998e] to-[#38ef7d] flex items-center justify-center text-[#04120a] shadow-xl shadow-[#38ef7d]/30 z-10 animate-bounce">
          <Zap className="w-8 h-8 fill-current" />
        </div>
      </div>

      {/* Loading Text & Progress Bar */}
      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-base font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 text-[#38ef7d] animate-pulse" />
          <span>FPL Analytics Engine</span>
        </h3>
        <p className="text-xs font-mono text-gray-400">{message}</p>
        
        {/* Animated Gradient Bar */}
        <div className="w-full bg-white/5 border border-white/10 h-1.5 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-[#11998e] via-[#38ef7d] to-[#8b5cf6] w-full animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton Loading Cards Placeholder */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 opacity-50">
        <div className="glass-card h-28 animate-pulse bg-white/5"></div>
        <div className="glass-card h-28 animate-pulse bg-white/5"></div>
        <div className="glass-card h-28 animate-pulse bg-white/5"></div>
      </div>
    </div>
  );
};
