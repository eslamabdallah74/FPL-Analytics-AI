import React, { useEffect, useState } from 'react';
import { X, ShieldAlert, Award, TrendingUp, DollarSign, Activity } from 'lucide-react';
import type { Player, PlayerActionVerdict } from '../types';
import { fetchPlayerDeepDive } from '../services/api';
import { PlayerAvatar } from './PlayerAvatar';
import { Loader } from './Loader';
import { useLanguage } from '../context/LanguageContext';

interface PlayerDetailModalProps {
  player: Player | null;
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose }) => {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [actionVerdict, setActionVerdict] = useState<PlayerActionVerdict | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (player) {
      setLoading(true);
      setHistory([]);
      setActionVerdict(null);
      fetchPlayerDeepDive(player.id)
        .then((res) => {
          setHistory(res.history || []);
          if (res.action_verdict) setActionVerdict(res.action_verdict);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [player?.id]);

  if (!player) return null;

  const riskColor = 
    player.rotation_risk === 'Low' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    player.rotation_risk === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-white relative"
      >
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors z-10`}
          title={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-5 mb-4 border-b border-white/10 pb-4">
          <PlayerAvatar player={player} size="xl" showShirt={true} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{player.web_name}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#38ef7d]/20 text-[#38ef7d] border border-[#38ef7d]/30">
                {player.position_name}
              </span>
            </div>
            <p className="text-sm text-gray-400 font-mono mt-0.5">
              {player.first_name} {player.second_name} • <span className="text-white font-semibold">{player.team_name}</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader message={t('loading_player_details')} />
          </div>
        ) : (
          <>
            {/* Action Verdict Banner */}
        {actionVerdict && (
          <div className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            actionVerdict.color === 'green' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
            actionVerdict.color === 'yellow' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
            'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-gray-400">Action Verdict:</span>
                <span className="text-sm font-extrabold font-mono">{actionVerdict.headline}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                <span>Goal Threat: {"🔥".repeat(actionVerdict.threat_stars)}</span>
                <span>• Minutes: {actionVerdict.minutes_security}</span>
                <span>• Fixtures: {actionVerdict.fixture_quality}</span>
              </div>
            </div>
            <div className="text-xs space-y-1 font-mono">
              {actionVerdict.reasons.map((r, i) => (
                <span key={i} className="block">{r}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Price
            </span>
            <span className="text-lg font-bold font-mono text-[#38ef7d]">£{player.price}M</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> Total Pts
            </span>
            <span className="text-lg font-bold font-mono text-white">{player.total_points}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Form Score
            </span>
            <span className="text-lg font-bold font-mono text-amber-400">{player.form_score}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Value Score
            </span>
            <span className="text-lg font-bold font-mono text-cyan-400">{player.value_score}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-3">
            <span className="text-xs text-gray-400 block mb-1">Transfer Rating</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">{player.transfer_score}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-3">
            <span className="text-xs text-gray-400 block mb-1">Captain Rating</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-400 font-mono">{player.captain_score}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-xs text-gray-400 block mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Rotation Risk
            </span>
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${riskColor}`}>
              {player.rotation_risk} Risk
            </span>
          </div>
        </div>

        {/* Advanced Derived Metrics Grid */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Advanced Analytics & Derived Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-gray-400 block uppercase">Expected Pts (xP)</span>
              <span className="text-base font-bold text-emerald-400">{player.expected_points ?? 0} pts</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-gray-400 block uppercase">ICT Index / 90</span>
              <span className="text-base font-bold text-cyan-400">{player.ict_per_90 ?? 0}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-gray-400 block uppercase">Returns / 90 Mins</span>
              <span className="text-base font-bold text-amber-400">{player.returns_per_90 ?? 0}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-gray-400 block uppercase">Set Piece Duty</span>
              <span className="text-xs font-bold text-purple-300 truncate block">{player.set_piece_role || 'None'}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-gray-400 block uppercase">GW Net Transfers</span>
              <span className={`text-xs font-bold ${
                (player.net_transfers_gw || 0) > 0 ? 'text-emerald-400' : (player.net_transfers_gw || 0) < 0 ? 'text-rose-400' : 'text-gray-300'
              }`}>
                {(player.net_transfers_gw || 0) > 0 ? `+${(player.net_transfers_gw || 0).toLocaleString()}` : (player.net_transfers_gw || 0).toLocaleString()}
              </span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-gray-400 block uppercase">Bonus Pts / 90</span>
              <span className="text-base font-bold text-yellow-300">{player.bonus_per_90 ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Upcoming Fixture Run (Next 5 GWs)
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {player.upcoming_fixtures?.map((f, i) => (
              <div
                key={i}
                className={`flex-1 min-w-[70px] text-center p-2 rounded-xl border text-xs font-semibold ${
                  f.difficulty <= 2 ? 'fdr-1' : f.difficulty === 3 ? 'fdr-3' : 'fdr-5'
                }`}
              >
                <span className="block text-[10px] opacity-70">GW {f.event}</span>
                <span className="block font-bold">{f.opponent_short}</span>
                <span className="block text-[10px]">{f.is_home ? '(H)' : '(A)'}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Recent Match Performance
          </h3>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading match history...</p>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="py-2">GW</th>
                    <th className="py-2">Opponent</th>
                    <th className="py-2">Mins</th>
                    <th className="py-2">Pts</th>
                    <th className="py-2">Goals</th>
                    <th className="py-2">Assists</th>
                    <th className="py-2">Bonus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {history.slice(-5).reverse().map((h, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="py-2 font-bold">{h.round}</td>
                      <td className="py-2 text-gray-300">{h.opponent_team_name} ({h.was_home ? 'H' : 'A'})</td>
                      <td className="py-2">{h.minutes}'</td>
                      <td className="py-2 text-[#38ef7d] font-bold">{h.total_points}</td>
                      <td className="py-2">{h.goals_scored}</td>
                      <td className="py-2">{h.assists}</td>
                      <td className="py-2 text-amber-400">{h.bonus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No detailed match history available.</p>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};
