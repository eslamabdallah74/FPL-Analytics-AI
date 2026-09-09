import React, { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';
import type { TransferTarget, Player } from '../types';
import { fetchTransfers } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Loader } from '../components/Loader';
import { useLanguage } from '../context/LanguageContext';

interface TransfersViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({ onSelectPlayer }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [targets, setTargets] = useState<TransferTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransfers(15)
      .then((res) => setTargets(res.targets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader message={t('loading')} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <span>{t('transfers_title')}</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {t('transfers_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((item) => (
          <div
            key={item.player.id}
            onClick={() => onSelectPlayer(item.player)}
            className="glass-card p-5 border-l-4 border-l-emerald-400 hover:border-[#38ef7d] transition-all cursor-pointer group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-extrabold flex items-center justify-center shrink-0">
                  #{item.rank}
                </span>
                <PlayerAvatar player={item.player} size="md" />
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#38ef7d] transition-colors">
                    {item.player.web_name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {item.player.team_name} • {item.player.position_name} • £{item.player.price}M
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400 block">{item.transfer_score}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{t('transfer_score')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1 text-xs text-gray-300">
              {item.all_reasons.map((r, i) => {
                let displayReason = r;
                if (isAr) {
                  if (r.includes('Strong recent form')) displayReason = `مستوى قوي مؤخراً (${item.player.form_score} نقطة/جولة)`;
                  else if (r.includes('Favorable upcoming fixtures')) displayReason = `جدول مباريات قادم سهل (معدل FDR ${item.player.upcoming_fdr})`;
                  else if (r.includes('Exceptional value score')) displayReason = `معدل قيمة استثنائي (${item.player.value_score} نقطة/مليون)`;
                  else if (r.includes('Solid overall rating')) displayReason = `تقييم متماسك في الدقائق والمساهمات`;
                }
                return (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{displayReason}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-gray-400">
              <span>{t('form')}: <strong className="text-amber-400">{item.player.form_score}</strong></span>
              <span>FDR: <strong className="text-cyan-400">{item.player.upcoming_fdr}</strong></span>
              <span>{t('total_pts')}: <strong className="text-white">{item.player.total_points}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

