import React from 'react';
import { 
  TrendingUp, 
  Crown, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Activity 
} from 'lucide-react';
import type { DashboardResponse, Player } from '../types';
import { PlayerAvatar } from '../components/PlayerAvatar';

interface DashboardViewProps {
  data: DashboardResponse;
  onSelectPlayer: (player: Player) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onSelectPlayer, onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-l-4 border-l-[#38ef7d] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#38ef7d] uppercase tracking-wider block mb-1">
            FPL Analytics Platform • GW {data.current_gameweek} Overview
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Algorithmic Intelligence for Fantasy Premier League
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Derived metrics, fixture run detection, transfer scoring, and captain rankings computed in real time from public FPL data.
          </p>
        </div>
        <div className="flex gap-3 font-mono">
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-center">
            <span className="text-xs text-gray-400 block">Total Players</span>
            <span className="text-xl font-bold text-white">{data.total_players}</span>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-center">
            <span className="text-xs text-gray-400 block">Current GW</span>
            <span className="text-xl font-bold text-[#38ef7d]">{data.current_gameweek}</span>
          </div>
        </div>
      </div>

      {data.easy_fixture_runs?.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-300">🔥 Easy Fixture Runs Detected</h3>
              <p className="text-xs text-gray-300">
                {data.easy_fixture_runs.map(r => r.reason).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('fixtures')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>View Planner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Top Transfer Targets</h2>
            </div>
            <button
              onClick={() => onNavigate('transfers')}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {data.transfer_targets.slice(0, 4).map((target) => (
              <div
                key={target.player.id}
                onClick={() => onSelectPlayer(target.player)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    #{target.rank}
                  </span>
                  <PlayerAvatar player={target.player} size="sm" />
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#38ef7d] transition-colors">
                      {target.player.web_name}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {target.player.team_name} • {target.player.position_name} • £{target.player.price}M
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-emerald-400 block">
                    {target.transfer_score} pts
                  </span>
                  <span className="text-[10px] text-gray-400 block max-w-[140px] truncate">
                    {target.primary_reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <Crown className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Captain Candidates</h2>
            </div>
            <button
              onClick={() => onNavigate('captains')}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {data.captain_candidates.slice(0, 4).map((candidate) => (
              <div
                key={candidate.player.id}
                onClick={() => onSelectPlayer(candidate.player)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    #{candidate.rank}
                  </span>
                  <PlayerAvatar player={candidate.player} size="sm" />
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {candidate.player.web_name}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {candidate.player.team_name} • £{candidate.player.price}M • Form: {candidate.player.form_score}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-purple-400 block">
                    {candidate.captain_score} pts
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    FDR: {candidate.player.upcoming_fdr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Peak Form Players</h2>
            </div>
            <button
              onClick={() => onNavigate('players')}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {data.top_form.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPlayer(p)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all flex items-center gap-3"
              >
                <PlayerAvatar player={p} size="sm" />
                <div className="overflow-hidden">
                  <span className="text-[10px] text-gray-400 font-semibold block">{p.team_name}</span>
                  <h4 className="text-xs font-bold text-white truncate">{p.web_name}</h4>
                  <div className="mt-0.5 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-amber-400 font-bold">Form {p.form_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Differentials (&lt; 10% Ownership)</h2>
            </div>
            <button
              onClick={() => onNavigate('differentials')}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>See Differentials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {data.differentials.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPlayer(p)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all flex items-center gap-3"
              >
                <PlayerAvatar player={p} size="sm" />
                <div className="overflow-hidden">
                  <span className="text-[10px] text-gray-400 font-semibold block">{p.team_name}</span>
                  <h4 className="text-xs font-bold text-white truncate">{p.web_name}</h4>
                  <div className="mt-0.5 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-cyan-400 font-bold">{p.selected_by_percent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
