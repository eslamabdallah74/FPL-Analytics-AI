import React from 'react';
import { Zap, ShieldCheck, Database } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-white/10 bg-[#070a12] pt-12 pb-8 px-4 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#11998e] to-[#38ef7d] flex items-center justify-center text-[#04120a] font-extrabold shadow-md shadow-[#38ef7d]/20">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                FPL <span className="text-[#38ef7d]">Analytics</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Algorithmic intelligence for Fantasy Premier League managers. Derived metrics, fixture difficulty matrix, and automated transfer recommendations.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-[#38ef7d] uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Dashboard Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('players')} className="hover:text-white transition-colors cursor-pointer">
                  Player Analytics Matrix
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('fixtures')} className="hover:text-white transition-colors cursor-pointer">
                  Fixture Run Planner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('transfers')} className="hover:text-white transition-colors cursor-pointer">
                  Transfer Targets Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('captains')} className="hover:text-white transition-colors cursor-pointer">
                  Captain Rankings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('differentials')} className="hover:text-white transition-colors cursor-pointer">
                  Under-Owned Differentials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('compare')} className="hover:text-white transition-colors cursor-pointer">
                  Head-to-Head Comparator
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Analytics Engine */}
          <div>
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
              Analytical Metrics
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 font-mono">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Value Score (Points / £M)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Form Score (Last 3-5 GWs)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consistency & Rotation Risk</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Composite Transfer Rating</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Composite Captain Rating</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Data Source Note */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              Data Integrity
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-400 space-y-2">
              <div className="flex items-center gap-2 text-gray-300 font-semibold">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Official FPL Data</span>
              </div>
              <p className="text-[11px] leading-normal">
                Real-time data ingested directly from Fantasy Premier League public APIs. Metrics update after every gameweek.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
          <p>© 2026 FPL Analytics Platform. All rights reserved.</p>
          <p>Built with React, TypeScript, FastAPI & Pandas</p>
        </div>
      </div>
    </footer>
  );
};
