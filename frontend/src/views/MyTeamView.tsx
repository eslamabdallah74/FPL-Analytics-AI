import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Crown, 
  ArrowRightLeft, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  UserCheck,
  Coins,
  Award,
  Loader2
} from 'lucide-react';
import { fetchMyTeam } from '../services/api';
import type { MyTeamResponse, EnrichedSquadPlayer, Player } from '../types';

interface MyTeamViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const MyTeamView: React.FC<MyTeamViewProps> = ({ onSelectPlayer }) => {
  const [teamId, setTeamId] = useState<string>('1');
  const [data, setData] = useState<MyTeamResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSyncTeam = (idToFetch: string) => {
    if (!idToFetch || isNaN(Number(idToFetch))) {
      setError('Please enter a valid numeric FPL Team ID');
      return;
    }
    setLoading(true);
    setError(null);
    fetchMyTeam(Number(idToFetch))
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to fetch squad data for this Team ID');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    handleSyncTeam('1');
  }, []);

  // Group starting 11 by position for pitch layout
  const gkpList = data?.starting_xi.filter(p => p.position_name === 'GKP') || [];
  const defList = data?.starting_xi.filter(p => p.position_name === 'DEF') || [];
  const midList = data?.starting_xi.filter(p => p.position_name === 'MID') || [];
  const fwdList = data?.starting_xi.filter(p => p.position_name === 'FWD') || [];

  return (
    <div className="space-y-8">
      {/* Header & FPL Team ID Sync Section */}
      <div className="glass-card p-6 border-l-4 border-l-[#38ef7d] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#38ef7d]/20 text-[#38ef7d] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#38ef7d]/30">
                Squad Hub & AI Assistant
              </span>
              <span className="text-xs text-gray-400 font-mono">• Instant Team Sync</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-[#38ef7d]" />
              <span>Personalized Squad Analyzer</span>
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Enter your public FPL Team ID to load your 15-man squad, inspect your tactical pitch setup, and receive AI-driven advice for Captaincy, Lineup Swaps, and Transfers.
            </p>
          </div>

          {/* Quick Demo Selector */}
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 shrink-0">
            <span>Quick Demos:</span>
            <button 
              onClick={() => { setTeamId('1'); handleSyncTeam('1'); }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
            >
              ID: 1
            </button>
            <button 
              onClick={() => { setTeamId('12345'); handleSyncTeam('12345'); }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
            >
              ID: 12345
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSyncTeam(teamId); }} 
          className="flex flex-col sm:flex-row items-center gap-3 pt-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="number"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Enter FPL Team ID (e.g. 123456)..."
              className="w-full bg-[#070a12]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#38ef7d] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] font-bold rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#38ef7d]/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing Team...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Sync Team & AI Advice</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {data && (
        <div className="space-y-8">
          {/* Manager Stats Bar */}
          <div className="glass-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Manager & Team</span>
              <h3 className="text-base font-bold text-white font-sans truncate">{data.manager_info.manager_name}</h3>
              <p className="text-xs text-[#38ef7d] font-sans truncate">{data.manager_info.team_name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Overall Rank</span>
              <div className="flex items-center gap-1.5 text-base font-extrabold text-amber-400">
                <Award className="w-4 h-4" />
                <span>#{data.manager_info.overall_rank.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">{data.manager_info.overall_points} Total Pts</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Bank Balance</span>
              <div className="flex items-center gap-1.5 text-base font-extrabold text-emerald-400">
                <Coins className="w-4 h-4" />
                <span>£{data.manager_info.bank.toFixed(1)}M</span>
              </div>
              <p className="text-xs text-gray-400">Available Budget</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Squad Value</span>
              <div className="flex items-center gap-1.5 text-base font-extrabold text-cyan-400">
                <UserCheck className="w-4 h-4" />
                <span>£{data.manager_info.team_value.toFixed(1)}M</span>
              </div>
              <p className="text-xs text-gray-400">15-Man Team Value</p>
            </div>
          </div>

          {/* AI Manager Recommendations Suite */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Card 1: Captain & Armband Advice */}
            <div className="glass-card p-5 border-t-4 border-t-amber-400 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Crown className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                    Armband Advice
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">Captain & Vice-Captain Selection</h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {data.ai_advice.captain_advice_text}
                </p>

                {data.ai_advice.recommended_captain && (
                  <div className="bg-white/5 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shrink-0">
                        <img 
                          src={data.ai_advice.recommended_captain.photo_url || data.ai_advice.recommended_captain.shirt_url} 
                          alt={data.ai_advice.recommended_captain.web_name}
                          className="w-full h-full object-cover rounded-full bg-black/40"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{data.ai_advice.recommended_captain.web_name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{data.ai_advice.recommended_captain.team_name} • {data.ai_advice.recommended_captain.position_name}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-extrabold text-amber-400 block">{data.ai_advice.recommended_captain.captain_score}</span>
                      <span className="text-[9px] text-gray-400 uppercase">C-Score</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center gap-1.5">
                {data.ai_advice.is_captain_optimal ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{data.ai_advice.is_captain_optimal ? "Armband is currently optimal!" : "Swap (C) armband before deadline!"}</span>
              </div>
            </div>

            {/* Card 2: Lineup & Bench Optimizer */}
            <div className="glass-card p-5 border-t-4 border-t-indigo-400 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    Bench Optimizer
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">Starting XI vs Bench Swaps</h3>

                {data.ai_advice.lineup_swaps.length > 0 ? (
                  <div className="space-y-2">
                    {data.ai_advice.lineup_swaps.map((swap, idx) => (
                      <div key={idx} className="bg-white/5 border border-indigo-500/30 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="text-emerald-400 font-mono">BENCH: {swap.bench_player.web_name}</span>
                          <span className="text-rose-400 font-mono">OUT: {swap.starting_player.web_name}</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-normal">{swap.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Your current starting 11 is mathematically optimal. No bench swaps needed.</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center gap-1.5 font-mono">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lineup optimized for max Expected Points (xP)</span>
              </div>
            </div>

            {/* Card 3: Buy & Sell Transfer Recommender */}
            <div className="glass-card p-5 border-t-4 border-t-emerald-400 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    Transfer Target
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">Who to Sell & Who to Buy</h3>

                {data.ai_advice.transfer_recommendation ? (
                  <div className="bg-white/5 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-rose-400 font-bold">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-mono">SELL</span>
                        <span>{data.ai_advice.transfer_recommendation.sell_player.web_name} (£{data.ai_advice.transfer_recommendation.sell_player.price}M)</span>
                      </div>
                      <span className="text-gray-400 font-mono">➔</span>
                      <div className="text-emerald-400 font-bold text-right">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-mono">BUY</span>
                        <span>{data.ai_advice.transfer_recommendation.buy_player.web_name} (£{data.ai_advice.transfer_recommendation.buy_player.price}M)</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-normal">
                      {data.ai_advice.transfer_recommendation.reason}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-300">Your squad metrics are solid across all positions!</p>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center gap-1.5 font-mono">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fits available budget (£{data.manager_info.bank.toFixed(1)}M bank)</span>
              </div>
            </div>
          </div>

          {/* Tactical 3D Football Pitch View */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#38ef7d]" />
                <span>Tactical Starting 11 Pitch Setup</span>
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-[#38ef7d] text-xs font-mono font-bold border border-[#38ef7d]/30 shadow-sm">
                  GW {data.manager_info.gameweek_fetched || 3} Squad Loaded
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#38ef7d] shrink-0" />
                <span>Official FPL deadline-locked squad picks loaded (GW {data.manager_info.gameweek_fetched || 3}).</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                FPL locks upcoming transfers until GW deadline passes
              </span>
            </div>

            {/* Pitch Container */}
            <div className="relative w-full rounded-3xl p-6 md:p-8 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-emerald-500/40 shadow-2xl overflow-hidden min-h-[580px] flex flex-col justify-between">
              {/* Tactical Pitch Lines overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38ef7d_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="absolute inset-x-8 top-0 h-24 border-b-2 border-emerald-400/30 rounded-b-3xl pointer-events-none"></div>
              <div className="absolute inset-x-8 bottom-0 h-24 border-t-2 border-emerald-400/30 rounded-t-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/30 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-emerald-400/30 rounded-full pointer-events-none"></div>

              {/* Pitch Row 1: Goalkeeper */}
              <div className="relative z-10 flex justify-center gap-4 py-2">
                {gkpList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Pitch Row 2: Defenders */}
              <div className="relative z-10 flex justify-around gap-2 md:gap-6 py-2">
                {defList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Pitch Row 3: Midfielders */}
              <div className="relative z-10 flex justify-around gap-2 md:gap-6 py-2">
                {midList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Pitch Row 4: Forwards */}
              <div className="relative z-10 flex justify-center gap-6 md:gap-12 py-2">
                {fwdList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} onSelect={onSelectPlayer} />
                ))}
              </div>
            </div>

            {/* Bench Strip Container */}
            <div className="glass-card p-5 space-y-3 border-t-4 border-t-gray-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Substitutes Bench (4 Players)
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Ordered 1 ➔ 2 ➔ 3</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.bench.map((player, idx) => (
                  <div
                    key={player.id}
                    onClick={() => onSelectPlayer(player)}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-[#38ef7d] transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <span className="w-5 h-5 rounded-full bg-white/10 text-gray-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <img 
                      src={player.photo_url || player.shirt_url} 
                      alt={player.web_name}
                      className="w-10 h-10 object-contain drop-shadow group-hover:scale-105 transition-transform" 
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white truncate block">{player.web_name}</span>
                      <span className="text-[10px] text-gray-400 font-mono block">{player.position_name} • £{player.price}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Helper Card for Pitch Rendering */
const PitchPlayerCard: React.FC<{ player: EnrichedSquadPlayer; onSelect: (player: Player) => void }> = ({ player, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(player)}
      className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 select-none"
    >
      {/* Player Image / Shirt with Badges */}
      <div className="relative">
        {/* Armband Badges */}
        {player.is_captain && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-[#04120a] font-extrabold font-mono text-[10px] flex items-center justify-center shadow-lg border border-amber-300 z-20">
            C
          </span>
        )}
        {player.is_vice_captain && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-300 text-[#04120a] font-extrabold font-mono text-[10px] flex items-center justify-center shadow-lg border border-white z-20">
            V
          </span>
        )}

        <img 
          src={player.photo_url || player.shirt_url} 
          alt={player.web_name}
          className="w-12 h-14 md:w-16 md:h-18 object-contain drop-shadow-xl filter group-hover:brightness-110 transition-all"
        />
      </div>

      {/* Name & Metric Tag */}
      <div className="mt-1 px-2.5 py-1 bg-[#070a12]/90 backdrop-blur-md border border-white/20 rounded-xl text-center shadow-lg min-w-[70px] md:min-w-[90px]">
        <span className="text-[11px] md:text-xs font-extrabold text-white block truncate leading-tight">
          {player.web_name}
        </span>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span className="text-[9px] font-mono text-gray-300">£{player.price}M</span>
          <span className="text-[9px] font-mono font-bold text-[#38ef7d]">{player.expected_points || player.form_score} xP</span>
        </div>
      </div>
    </div>
  );
};
