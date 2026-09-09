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
  const { t, isRTL, language } = useLanguage();
  const isAr = language === 'ar';

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

  const getTranslatedHeadline = (verdict: PlayerActionVerdict) => {
    if (!isAr) return verdict.headline;
    if (verdict.verdict === 'BUY') return `شراء مؤكد 🟢 (تقييم ${player.transfer_score})`;
    if (verdict.verdict === 'HOLD') return `احتفاظ / مراقبة 🟡 (تقييم ${player.transfer_score})`;
    return `تجنب / بيع 🔴 (تقييم ${player.transfer_score})`;
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 text-white relative custom-scrollbar"
      >
        <button
          onClick={onClose}
          className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-10`}
          title={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 sm:gap-5 mb-4 border-b border-white/10 pb-4 pr-8">
          <PlayerAvatar player={player} size="lg" showShirt={true} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{player.web_name}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#38ef7d]/20 text-[#38ef7d] border border-[#38ef7d]/30">
                {player.position_name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">
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
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{t('decision_verdict')}:</span>
                    <span className="text-sm font-extrabold">{getTranslatedHeadline(actionVerdict)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                    <span>{t('threat_index')}: {"🔥".repeat(actionVerdict.threat_stars)}</span>
                    <span>• {t('minutes_security')}: {isAr ? (actionVerdict.minutes_security === 'Excellent' ? 'ممتازة' : 'متوسطة') : actionVerdict.minutes_security}</span>
                    <span>• {t('fixture_quality')}: {isAr ? (actionVerdict.fixture_quality === 'Excellent' ? 'ممتازة' : actionVerdict.fixture_quality === 'Good' ? 'جيدة' : 'صعبة') : actionVerdict.fixture_quality}</span>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  {actionVerdict.reasons.map((r, i) => {
                    let displayReason = r;
                    if (isAr) {
                      if (r.includes('Outstanding form')) displayReason = `🔥 مستوى ممتاز (${player.form_score} نقطة/جولة)`;
                      else if (r.includes('Poor recent form')) displayReason = `⚠️ مستوى ضعيف مؤخراً (${player.form_score} نقطة/جولة)`;
                      else if (r.includes('Favorable 5-GW fixture run')) displayReason = `🟢 جدول مباريات سهل (معدل FDR ${player.upcoming_fdr})`;
                      else if (r.includes('Tough upcoming fixtures')) displayReason = `🔴 جدول مباريات صعب (معدل FDR ${player.upcoming_fdr})`;
                      else if (r.includes('Excellent minutes security')) displayReason = `🟢 ضمان مشاركة أساسية عالٍ`;
                    }
                    return (
                      <span key={i} className="block">{displayReason}</span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> {t('price')}
                </span>
                <span className="text-lg font-bold text-[#38ef7d]">£{player.price}M</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {t('total_pts')}
                </span>
                <span className="text-lg font-bold text-white">{player.total_points}</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> {t('form')}
                </span>
                <span className="text-lg font-bold text-amber-400">{player.form_score}</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> {t('value')}
                </span>
                <span className="text-lg font-bold text-cyan-400">{player.value_score}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-3">
                <span className="text-xs text-gray-400 block mb-1">{t('transfer_score')}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">{player.transfer_score}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-3">
                <span className="text-xs text-gray-400 block mb-1">{t('captain_score')}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-purple-400">{player.captain_score}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-xs text-gray-400 block mb-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {t('rotation_risk')}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${
                  player.rotation_risk === 'Low' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' :
                  player.rotation_risk === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-500/10' :
                  'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-rose-500/10'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    player.rotation_risk === 'Low' ? 'bg-emerald-400 animate-pulse' :
                    player.rotation_risk === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
                  }`}></span>
                  <span>{isAr ? (player.rotation_risk === 'Low' ? 'مشاركة مضمونة' : player.rotation_risk === 'Medium' ? 'تدوير متوسط' : 'مخاطرة عالية') : `${player.rotation_risk} Risk`}</span>
                </span>
              </div>
            </div>

            {/* Advanced Derived Metrics Grid */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                {isAr ? 'الإشارات ومعدلات الأداء التفصيلية' : 'Advanced Analytics & Derived Metrics'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[10px] text-gray-400 block uppercase">{t('xp')}</span>
                  <span className="text-base font-bold text-emerald-400">{player.expected_points ?? 0} {t('pts')}</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[10px] text-gray-400 block uppercase">ICT / 90</span>
                  <span className="text-base font-bold text-cyan-400">{player.ict_per_90 ?? 0}</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[10px] text-gray-400 block uppercase">{isAr ? 'المساهمات / 90' : 'Returns / 90 Mins'}</span>
                  <span className="text-base font-bold text-amber-400">{player.returns_per_90 ?? 0}</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[10px] text-gray-400 block uppercase">{isAr ? 'الكرات الثابتة' : 'Set Piece Duty'}</span>
                  <span className="text-xs font-bold text-purple-300 truncate block">{player.set_piece_role || (isAr ? 'لا يوجد' : 'None')}</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[10px] text-gray-400 block uppercase">{isAr ? 'حركة الشراء/البيع' : 'GW Net Transfers'}</span>
                  <span className={`text-xs font-bold ${
                    (player.net_transfers_gw || 0) > 0 ? 'text-emerald-400' : (player.net_transfers_gw || 0) < 0 ? 'text-rose-400' : 'text-gray-300'
                  }`}>
                    {(player.net_transfers_gw || 0) > 0 ? `+${(player.net_transfers_gw || 0).toLocaleString()}` : (player.net_transfers_gw || 0).toLocaleString()}
                  </span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <span className="text-[10px] text-gray-400 block uppercase">{isAr ? 'نقاط البونص/90' : 'Bonus Pts / 90'}</span>
                  <span className="text-base font-bold text-yellow-300">{player.bonus_per_90 ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                {t('fixture_run')}
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
                    <span className="block text-[10px]">{f.is_home ? (isAr ? '(ملعبه)' : '(H)') : (isAr ? '(خارج)' : '(A)')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                {t('gw_history')}
              </h3>
              {loading ? (
                <p className="text-sm text-gray-400 text-center py-4">{t('loading')}</p>
              ) : history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead>
                      <tr className="text-gray-400 border-b border-white/10">
                        <th className="py-2">{t('gw')}</th>
                        <th className="py-2">{isAr ? 'المنافس' : 'Opponent'}</th>
                        <th className="py-2">{isAr ? 'الدقائق' : 'Mins'}</th>
                        <th className="py-2">{t('total_pts')}</th>
                        <th className="py-2">{isAr ? 'أهداف' : 'Goals'}</th>
                        <th className="py-2">{isAr ? 'صناعة' : 'Assists'}</th>
                        <th className="py-2">{isAr ? 'بونص' : 'Bonus'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history.slice(-5).reverse().map((h, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="py-2 font-bold">{h.round}</td>
                          <td className="py-2 text-gray-300">{h.opponent_team_name} ({h.was_home ? (isAr ? 'ملعبه' : 'H') : (isAr ? 'خارج' : 'A')})</td>
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
                <p className="text-xs text-gray-400 italic">{isAr ? 'لا يوجد سجل مباريات تفصيلي.' : 'No detailed match history available.'}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
