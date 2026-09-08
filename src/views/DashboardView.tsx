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
import { useLanguage } from '../context/LanguageContext';

interface DashboardViewProps {
  data: DashboardResponse;
  onSelectPlayer: (player: Player) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onSelectPlayer, onNavigate }) => {
  const { t, language } = useLanguage();

  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
      {/* Premier League Broadcast Hero Section */}
      <div className="relative glass-card-hero p-6 md:p-8 border-l-4 border-l-[#00e676] overflow-hidden">
        {/* Subtle GW Watermark Background */}
        <div className="absolute right-4 bottom-0 text-7xl md:text-9xl font-black text-[#00e676]/[0.06] select-none pointer-events-none tracking-tighter">
          GW 0{data.current_gameweek}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-[#00e676]/15 text-[#39ff88] text-[10px] font-black uppercase tracking-wider border border-[#00e676]/30">
                {t('gw_overview', { gw: data.current_gameweek })}
              </span>
              <span className="text-xs text-gray-400 font-mono">• 2026/27 SEASON</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
              {isAr ? 'ابنِ فريقك المثالي في الفانتسي' : 'BUILD YOUR PERFECT FPL TEAM'}
            </h1>

            <p className="text-sm text-gray-300">
              {t('hero_description')}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('generator')}
                className="angular-btn px-6 py-3 bg-[#00e676] hover:bg-[#39ff88] text-[#07110d] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-[#00e676]/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{isAr ? 'ابنِ فريقي الآن' : 'BUILD MY TEAM'}</span>
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="bg-[#07110d]/80 border border-[#1a2a22] px-4 py-3 rounded-xl text-center min-w-[90px]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{t('total_players')}</span>
              <span className="text-2xl font-black text-white">{data.total_players}</span>
            </div>
            <div className="bg-[#07110d]/80 border border-[#00e676]/30 px-4 py-3 rounded-xl text-center min-w-[90px]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{t('current_gw')}</span>
              <span className="text-2xl font-black text-[#39ff88]">GW {data.current_gameweek}</span>
            </div>
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
              <h3 className="text-sm font-bold text-emerald-300">{t('easy_fixture_runs_detected')}</h3>
              <p className="text-xs text-gray-300">
                {data.easy_fixture_runs.map(r => {
                  if (isAr) {
                    return `${r.team_name} لديه واحدة من أسهل الجداول في الـ 5 جولات القادمة (معدل FDR ${r.avg_fdr}).`;
                  }
                  return r.reason;
                }).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('fixtures')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>{t('view_planner')}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
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
              <h2 className="text-lg font-bold text-white">{t('top_transfer_targets')}</h2>
            </div>
            <button
              onClick={() => onNavigate('transfers')}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{t('see_all')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
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
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400 block">
                    {target.transfer_score} {t('pts')}
                  </span>
                  <span className="text-[10px] text-gray-400 block max-w-[160px] truncate">
                    {isAr && target.primary_reason.includes('Strong recent form') 
                      ? `مستوى قوي مؤخراً (${target.player.form_score} نقطة/جولة)` 
                      : target.primary_reason}
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
              <h2 className="text-lg font-bold text-white">{t('captain_candidates')}</h2>
            </div>
            <button
              onClick={() => onNavigate('captains')}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{t('see_all')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
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
                      {candidate.player.team_name} • £{candidate.player.price}M • {t('form')}: {candidate.player.form_score}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-purple-400 block">
                    {candidate.captain_score} {t('pts')}
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
              <h2 className="text-lg font-bold text-white">{t('peak_form_players')}</h2>
            </div>
            <button
              onClick={() => onNavigate('players')}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{t('browse_all')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
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
                  <div className="mt-0.5 flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-bold">{t('form')} {p.form_score}</span>
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
              <h2 className="text-lg font-bold text-white">{t('differentials_under_10')}</h2>
            </div>
            <button
              onClick={() => onNavigate('differentials')}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{t('see_differentials')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
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
                  <div className="mt-0.5 flex items-center justify-between text-[10px]">
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
