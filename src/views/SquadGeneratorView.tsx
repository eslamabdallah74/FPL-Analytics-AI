import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Crown, 
  Award, 
  Coins, 
  HelpCircle, 
  Loader2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PitchPlayerCard } from '../components/PitchPlayerCard';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { generateOptimalSquad } from '../services/api';
import type { OptimalSquadResponse, Player } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SquadGeneratorViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const SquadGeneratorView: React.FC<SquadGeneratorViewProps> = ({ onSelectPlayer }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [budget, setBudget] = useState<number>(100.0);
  const [formation, setFormation] = useState<string>('3-4-3');
  const [data, setData] = useState<OptimalSquadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setLoading(true);
    setError(null);
    generateOptimalSquad({ budget, formation })
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to generate optimal squad');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const gkpList = data?.starting_xi.filter(p => p.position_name === 'GKP') || [];
  const defList = data?.starting_xi.filter(p => p.position_name === 'DEF') || [];
  const midList = data?.starting_xi.filter(p => p.position_name === 'MID') || [];
  const fwdList = data?.starting_xi.filter(p => p.position_name === 'FWD') || [];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="glass-card p-6 border-l-4 border-l-[#38ef7d] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#38ef7d]/20 text-[#38ef7d] text-[10px] font-bold uppercase tracking-wider border border-[#38ef7d]/30">
                {t('ai_engine')}
              </span>
              <span className="text-xs text-gray-400">• 15-Man Algorithmic Generator</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-[#38ef7d]" />
              <span>{t('build_best_team')}</span>
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              {t('build_best_team_desc')}
            </p>
          </div>
        </div>

        {/* Generator Controls Bar */}
        <div className="glass-card p-4 bg-white/5 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Budget Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 uppercase tracking-wider">{t('squad_budget')}</span>
              <span className="text-[#38ef7d] font-bold">£{budget.toFixed(1)}M</span>
            </div>
            <input 
              type="range"
              min="90.0"
              max="105.0"
              step="0.5"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-full accent-[#38ef7d] cursor-pointer"
            />
          </div>

          {/* Formation Select */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider block">{t('formation')}:</label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="w-full bg-[#070a12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38ef7d] cursor-pointer"
            >
              <option value="3-4-3">3-4-3 {isAr ? '(هجوم متوازن)' : '(Balanced Attack)'}</option>
              <option value="3-5-2">3-5-2 {isAr ? '(خط وسط قوي)' : '(Midfield Heavy)'}</option>
              <option value="4-3-3">4-3-3 {isAr ? '(دفاع صلب)' : '(Solid Backline)'}</option>
              <option value="4-4-2">4-4-2 {isAr ? '(كلاسيكي)' : '(Classic)'}</option>
              <option value="5-3-2">5-3-2 {isAr ? '(تركيز أظهرة)' : '(Wingbacks Focus)'}</option>
            </select>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] font-bold rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#38ef7d]/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('optimizing')}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>{t('generate_optimal')}</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Results */}
      {data && (
        <div className="space-y-8">
          {/* Key Metrics Overview Banner */}
          <div className="glass-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">{t('expected_gw_points')}</span>
              <div className="flex items-center gap-1.5 text-lg font-extrabold text-[#38ef7d]">
                <Zap className="w-5 h-5 fill-current" />
                <span>{data.expected_points_5gw} xP</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">{t('team_rating_score')}</span>
              <div className="flex items-center gap-1.5 text-lg font-extrabold text-amber-400">
                <Award className="w-5 h-5" />
                <span>{data.team_score} / 100</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">{t('budget_used')}</span>
              <div className="flex items-center gap-1.5 text-lg font-extrabold text-emerald-400">
                <Coins className="w-5 h-5" />
                <span>£{data.budget_used.toFixed(1)}M</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">{t('captain_picker')}</span>
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-white truncate">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{data.captain?.web_name} (C)</span>
              </div>
            </div>
          </div>

          {/* Tactical Pitch View */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#38ef7d]" />
              <span>{t('pitch_setup')} ({data.formation})</span>
            </h2>

            {/* Pitch Container */}
            <div className="relative w-full rounded-3xl px-1.5 py-3 sm:p-6 md:p-8 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-emerald-500/40 shadow-2xl overflow-hidden min-h-[480px] sm:min-h-[580px] flex flex-col justify-between">
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38ef7d_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="absolute inset-x-4 sm:inset-x-8 top-0 h-20 sm:h-24 border-b-2 border-emerald-400/30 rounded-b-3xl pointer-events-none"></div>
              <div className="absolute inset-x-4 sm:inset-x-8 bottom-0 h-20 sm:h-24 border-t-2 border-emerald-400/30 rounded-t-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/30 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 border-2 border-emerald-400/30 rounded-full pointer-events-none"></div>

              {/* Pitch GKP */}
              <div className="relative z-10 flex justify-center gap-2 sm:gap-4 py-1.5 sm:py-2">
                {gkpList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} captainId={data.captain?.id} viceId={data.vice_captain?.id} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Pitch DEF */}
              <div className="relative z-10 flex justify-around gap-1 sm:gap-4 md:gap-6 py-1.5 sm:py-2">
                {defList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} captainId={data.captain?.id} viceId={data.vice_captain?.id} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Pitch MID */}
              <div className="relative z-10 flex justify-around gap-1 sm:gap-4 md:gap-6 py-1.5 sm:py-2">
                {midList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} captainId={data.captain?.id} viceId={data.vice_captain?.id} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Pitch FWD */}
              <div className="relative z-10 flex justify-center gap-3 sm:gap-8 md:gap-12 py-1.5 sm:py-2">
                {fwdList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} captainId={data.captain?.id} viceId={data.vice_captain?.id} onSelect={onSelectPlayer} />
                ))}
              </div>
            </div>

            {/* Bench Substitutes */}
            <div className="glass-card p-4 sm:p-5 space-y-3 border-t-4 border-t-gray-500">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {t('bench_substitutes')}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {data.bench.map((player, idx) => (
                  <div
                    key={player.id}
                    onClick={() => onSelectPlayer(player)}
                    className="p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-[#38ef7d] transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 group min-w-0"
                  >
                    <span className="w-5 h-5 rounded-full bg-white/10 text-gray-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <PlayerAvatar player={player} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white truncate block">{player.web_name}</span>
                      <span className="text-[10px] text-gray-400 block truncate">{player.position_name} • £{player.price}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* "Why Each Player Was Selected" Cards Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <span>{t('why_selected')}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {data.selection_reasons.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectPlayer(item.player)}
                  className="glass-card p-4 space-y-2 hover:border-[#38ef7d] transition-all cursor-pointer min-w-0"
                >
                  <div className="flex items-center gap-3">
                    <PlayerAvatar player={item.player} size="md" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{item.player.web_name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">{item.player.team_name} • £{item.player.price}M</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-300 border-t border-white/10 pt-2">
                    {item.all_reasons.map((reason, rIdx) => {
                      let displayReason = reason;
                      if (isAr) {
                        if (reason.includes('Outstanding form')) displayReason = `مستوى ممتاز مؤخراً (${item.player.form_score} نقطة/جولة)`;
                        else if (reason.includes('Easy upcoming fixture run')) displayReason = `مواجهات قادمة سهلة (معدل FDR ${item.player.upcoming_fdr})`;
                        else if (reason.includes('High points-per-million value')) displayReason = `قيمة نقاط عالية مقابل السعر (${item.player.value_score})`;
                        else if (reason.includes('Takes set-pieces')) displayReason = `مسدد للكرات الثابتة (${item.player.set_piece_role})`;
                        else if (reason.includes('Top composite rating')) displayReason = `أعلى تقييم خوارزمي في مركزه`;
                      }
                      return (
                        <div key={rIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                          <span className="leading-snug">{displayReason}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
