import React from 'react';
import { 
  Compass, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Target, 
  Crown, 
  CheckCircle, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

interface RoadmapViewProps {
  onNavigate: (tab: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="glass-card p-6 border-l-4 border-l-[#38ef7d] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#38ef7d]/20 text-[#38ef7d] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#38ef7d]/30">
              Top 10k FPL Strategy Report
            </span>
            <span className="text-xs text-gray-400 font-mono">• Product Roadmap</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-[#38ef7d]" />
            <span>FPL Manager Strategic Recommendations</span>
          </h1>
          <p className="text-sm text-gray-300 mt-1 max-w-2xl">
            A comprehensive roadmap written from the perspective of an experienced Fantasy Premier League strategist to elevate this platform into an essential daily manager hub.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shrink-0 border border-white/10"
        >
          <span>Explore Live Dashboard</span>
          <ArrowRight className="w-4 h-4 text-[#38ef7d]" />
        </button>
      </div>

      {/* 5 Key Strategic Recommendations Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#38ef7d]" />
          <span>Core Manager Recommendations at a Glance</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="glass-card p-5 border-t-4 border-t-emerald-400 space-y-3 hover:border-[#38ef7d] transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PHASE 2 • SQUAD HUB
              </span>
            </div>
            <h3 className="text-base font-bold text-white">1. Personalized "My Team" Squad Sync</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>FPL Team ID Import:</strong> Instantly fetch starting 11, bench, £ bank balance, and remaining chips without login.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Interactive Pitch View:</strong> Drag & drop pitch view showing captaincy (C) and bench order with rotation risk flags.</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-5 border-t-4 border-t-indigo-400 space-y-3 hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PHASE 2 • PLANNER
              </span>
            </div>
            <h3 className="text-base font-bold text-white">2. Multi-GW Transfer & Wildcard Planner</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>5-GW Transfer Rolling Simulator:</strong> Model transfers across GW+1 to GW+5 while tracking bank funds and free transfer roll.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Optimal Wildcard Generator:</strong> Algorithmic £100.0M squad generator based on xP and fixture difficulty runs.</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-5 border-t-4 border-t-amber-400 space-y-3 hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PHASE 4 • MATCHDAY
              </span>
            </div>
            <h3 className="text-base font-bold text-white">3. Live Matchday & BPS Tracker</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Live BPS Tracker:</strong> Real-time match BPS scores during live Saturday–Monday games showing projected 3, 2, 1 bonus points.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Live Rank & Auto-Subs:</strong> Real-time rank changes calculated automatically with provisional bench auto-subs.</span>
              </li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-5 border-t-4 border-t-cyan-400 space-y-3 hover:border-cyan-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Target className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PHASE 3 • UNDERLYING
              </span>
            </div>
            <h3 className="text-base font-bold text-white">4. Underlying Stats & Luck Detector</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>xG / xA & Box Touches:</strong> Expected Goals, Expected Assists, Shots Inside Box, and Big Chances Created per 90 mins.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Regression & Luck Detector:</strong> Identify overperforming assets (lucky finish) vs underperforming assets (ready to explode).</span>
              </li>
            </ul>
          </div>

          {/* Card 5 */}
          <div className="glass-card p-5 border-t-4 border-t-purple-400 space-y-3 hover:border-purple-300 transition-all md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <Crown className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                PHASE 4 • RIVALS & EO
              </span>
            </div>
            <h3 className="text-base font-bold text-white">5. Effective Ownership & Rival Matrix</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Effective Ownership (EO):</strong> Overall & Top 10k EO to measure relative rank impact ("Haaland goal = -120 pts rank impact if unowned").</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Mini-League Rival Matrix:</strong> Track mini-league rivals' remaining chips, captain choices, and unique differentials.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Phased Roadmap Timeline */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Implementation Timeline & Phase Milestones</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
              Phase 2 • Immediate
            </span>
            <h4 className="text-sm font-bold text-white font-sans">Personalization & Squad Planning</h4>
            <p className="text-gray-400 text-[11px] font-sans">
              FPL Team ID import, interactive pitch view, 5-GW rolling transfer planner, and set-piece takers directory.
            </p>
          </div>

          <div className="bg-white/5 border border-cyan-500/30 rounded-2xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] uppercase">
              Phase 3 • Deep Analytics
            </span>
            <h4 className="text-sm font-bold text-white font-sans">Underlying Stats & Rotation Tools</h4>
            <p className="text-gray-400 text-[11px] font-sans">
              xG/xA per 90 mins, overperformance luck detector, £4.5M defender/GKP rotation pair finder, and CSV export.
            </p>
          </div>

          <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase">
              Phase 4 • Live Matchday
            </span>
            <h4 className="text-sm font-bold text-white font-sans">Live BPS & Mini-League Matrix</h4>
            <p className="text-gray-400 text-[11px] font-sans">
              Real-time live BPS matchday tracker, provisional auto-sub calculator, Top 10k EO engine, and mini-league rival tracker.
            </p>
          </div>
        </div>
      </div>

      {/* Full Artifact Callout Card */}
      <div className="glass-card p-6 bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-500/20 text-purple-300 rounded-2xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest block">
              Full Technical Document Available
            </span>
            <h3 className="text-lg font-bold text-white">FPL Analytics Platform Roadmap Report</h3>
            <p className="text-xs text-gray-300 mt-0.5">
              Includes detailed architectural diagrams, math models, and user experience specs.
            </p>
          </div>
        </div>

        <a
          href="file:///home/eslam/.gemini/antigravity/brain/b3c51376-6f49-43c5-8b65-1dc7778e5c3a/fpl_platform_roadmap_report.md"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-lg shadow-purple-500/25 flex items-center gap-2 font-mono"
        >
          <FileText className="w-4 h-4" />
          <span>View Markdown Report</span>
        </a>
      </div>
    </div>
  );
};
