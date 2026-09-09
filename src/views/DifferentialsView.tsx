import React, { useEffect, useState } from 'react';
import { Sparkles, Sliders, Flame, Zap } from 'lucide-react';
import type { Player } from '../types';
import { fetchDifferentials } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { TeamBadge } from '../components/TeamBadge';
import { Loader } from '../components/Loader';
import { useLanguage } from '../context/LanguageContext';

interface DifferentialsViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const DifferentialsView: React.FC<DifferentialsViewProps> = ({ onSelectPlayer }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [differentials, setDifferentials] = useState<Player[]>([]);
  const [maxOwnership, setMaxOwnership] = useState<number>(10.0);
  const [debouncedOwnership, setDebouncedOwnership] = useState<number>(10.0);
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Smooth debounce for slider drag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOwnership(maxOwnership);
    }, 200);
    return () => clearTimeout(timer);
  }, [maxOwnership]);

  // Fetch differentials
  useEffect(() => {
    setLoading(true);
    fetchDifferentials(debouncedOwnership)
      .then((res) => setDifferentials(res.differentials || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedOwnership]);

  // Filter by position
  const filteredList = differentials.filter(p => {
    if (!positionFilter) return true;
    return p.position_name === positionFilter;
  });

  const getRankImpactCategory = (ownership: number) => {
    if (ownership < 3.0) return { label: isAr ? 'فارق نادِر (سقف عالي جداً)' : 'Ultra Differential', color: 'from-purple-500 to-pink-500 text-pink-300 border-pink-500/30' };
    if (ownership < 6.0) return { label: isAr ? 'فارق ممتاز (قفزة ترتيب)' : 'Rare Gem', color: 'from-cyan-500 to-blue-500 text-cyan-300 border-cyan-500/30' };
    return { label: isAr ? 'فارق متوازن' : 'Standard Differential', color: 'from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500/30' };
  };

  return (
    <div className="space-y-8">
      {/* FUTURISTIC HERO BANNER */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-cyan-950/80 via-[#070a12] to-emerald-950/80 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-amber-400" />
                <span>{isAr ? 'رادار الجواهر الخفية' : 'Hidden Gems Radar'}</span>
              </span>
              <span className="text-xs text-gray-400">• {isAr ? 'ملكية أقل من 10%' : 'Under 10% Ownership'}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              <span>{t('differentials_title')}</span>
            </h1>

            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              {t('differentials_desc')}
            </p>
          </div>

          {/* Quick Preset Ownership Chips */}
          <div className="glass-card p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 shrink-0 w-full lg:w-auto">
            <div className="flex items-center justify-between gap-4 text-xs font-bold">
              <span className="text-gray-300 flex items-center gap-1">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'سقف الملكية الأقصى:' : 'Max Ownership Limit:'}</span>
              </span>
              <span className="text-cyan-400 font-mono text-sm font-extrabold">&lt; {maxOwnership}%</span>
            </div>

            <input
              type="range"
              min="2.0"
              max="15.0"
              step="1.0"
              value={maxOwnership}
              onChange={(e) => setMaxOwnership(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/10 rounded-lg"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[3.0, 5.0, 8.0, 10.0, 15.0].map((val) => (
                <button
                  key={val}
                  onClick={() => setMaxOwnership(val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    maxOwnership === val
                      ? 'bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  &lt;{val}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Position Filter Tabs */}
        <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar pb-1 min-w-0">
          <span className="text-xs text-gray-400 font-bold me-1 shrink-0">{isAr ? 'تصفية المركز:' : 'Filter Position:'}</span>
          {['', 'GKP', 'DEF', 'MID', 'FWD'].map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                positionFilter === pos
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-black shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {pos ? pos : (isAr ? 'جميع المراكز' : 'All Positions')}
            </button>
          ))}
        </div>
      </div>


      {/* DIFFERENTIAL CARDS GRID */}
      {loading ? (
        <Loader message={t('loading')} />
      ) : filteredList.length === 0 ? (
        <div className="glass-card p-12 text-center text-sm text-gray-400 space-y-2">
          <Flame className="w-10 h-10 text-cyan-400 mx-auto opacity-50" />
          <p className="font-bold text-white text-base">
            {isAr ? 'لم يتم العثور على لاعبين بهذه المواصفات' : 'No Differential Gems Found'}
          </p>
          <p className="text-xs text-gray-400">
            {isAr ? `لا يوجد لاعبين بنسبة ملكية أقل من ${maxOwnership}%. قم بزيادة السقف أعلاه.` : `No players found with ownership below ${maxOwnership}%. Try increasing the slider limit.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((p, index) => {
            const impact = getRankImpactCategory(p.selected_by_percent);

            return (
              <div
                key={p.id}
                onClick={() => onSelectPlayer(p)}
                className="group relative rounded-3xl p-5 bg-[#070a12]/90 border border-white/10 hover:border-cyan-400/80 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transform hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between"
              >
                {/* Background Shirt Watermark */}
                {p.shirt_url && (
                  <img
                    src={p.shirt_url}
                    alt=""
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="absolute -right-6 -bottom-6 w-44 h-44 object-contain opacity-10 pointer-events-none group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"
                  />
                )}

                <div className="space-y-4 relative z-10">
                  {/* Top Bar: Impact Category Badge & Rank Index */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-gradient-to-r ${impact.color}`}>
                      {impact.label}
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Player Info Header */}
                  <div className="flex items-center gap-3.5">
                    <PlayerAvatar player={p} size="lg" showShirt={true} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <TeamBadge shirtUrl={p.shirt_url} teamCode={p.team} teamName={p.team_name} size="xs" />
                        <span className="text-xs font-bold text-gray-400 truncate">{p.team_name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white/10 text-white">
                          {p.position_name}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors truncate mt-0.5">
                        {p.web_name}
                      </h3>
                      <span className="text-xs font-extrabold text-[#38ef7d] block mt-0.5">
                        £{p.price}M
                      </span>
                    </div>
                  </div>

                  {/* High Impact Ownership & Transfer Score Bar */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{isAr ? 'الملكية الملكية' : 'Ownership'}</span>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-amber-400 fill-current animate-bounce" />
                          <span className="text-xl font-black text-amber-400">{p.selected_by_percent}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{t('transfer_score')}</span>
                        <span className="text-xl font-black text-emerald-400">{p.transfer_score}</span>
                      </div>
                    </div>

                    {/* Rank Opportunity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                        <span>{isAr ? 'فرصة قفزة الترتيب' : 'Rank Climb Boost'}</span>
                        <span className="text-cyan-400 font-bold">{Math.round(p.transfer_score)}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-[#38ef7d] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(p.transfer_score, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 block">{t('xp')}</span>
                      <span className="font-extrabold text-emerald-400">{p.expected_points ?? 0}</span>
                    </div>

                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 block">{t('form')}</span>
                      <span className="font-extrabold text-amber-400">{p.form_score}</span>
                    </div>

                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 block">{t('value')}</span>
                      <span className="font-extrabold text-cyan-400">{p.value_score}</span>
                    </div>
                  </div>

                  {/* Upcoming 3 Fixtures Micro-Strip */}
                  {p.upcoming_fixtures && p.upcoming_fixtures.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                        {isAr ? 'المواجهات الـ 3 القادمة:' : 'Next 3 Fixtures:'}
                      </span>
                      <div className="flex gap-1.5">
                        {p.upcoming_fixtures.slice(0, 3).map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className={`flex-1 p-1.5 rounded-lg text-center font-bold text-[10px] border flex items-center justify-center gap-1 ${
                              f.difficulty <= 2 ? 'fdr-1' : f.difficulty === 3 ? 'fdr-3' : 'fdr-5'
                            }`}
                          >
                            <span>{f.opponent_short}</span>
                            <span className="text-[8px] opacity-80">{f.is_home ? '(H)' : '(A)'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Quick Insight Bar */}
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-300 flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isAr ? 'خيار فارق ممتاز' : 'High Differential Ceiling'}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors">
                    {t('view_details')} ➔
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
