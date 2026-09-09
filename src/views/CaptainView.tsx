import React, { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import type { CaptainCandidate, Player } from '../types';
import { fetchCaptains } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Loader } from '../components/Loader';
import { useLanguage } from '../context/LanguageContext';

interface CaptainViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const CaptainView: React.FC<CaptainViewProps> = ({ onSelectPlayer }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [candidates, setCandidates] = useState<CaptainCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaptains(10)
      .then((res) => setCandidates(res.candidates || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader message={t('loading')} />;
  }

  const topPick = candidates[0];

  const getRationaleText = (c: CaptainCandidate) => {
    if (isAr) {
      return `مستوى هجومي مرتفع (${c.player.form_score} نقطة/جولة)، مشاركة أساسية مضمونة (${c.player.rotation_risk === 'Low' ? 'منخفض المخاطر' : 'متوسط المخاطر'}) وصعوبة مباريات قادمة FDR قدرها ${c.player.upcoming_fdr}.`;
    }
    return c.rationale;
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Crown className="w-6 h-6 text-purple-400" />
          <span>{t('captains_title')}</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {t('captains_desc', { gw: '3' })}
        </p>
      </div>

      {topPick && (
        <div className="glass-card p-6 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <PlayerAvatar player={topPick.player} size="lg" />
            <div>
              <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest block">{isAr ? 'خيار الكابتن الأول الموصى به' : 'Recommended Captain Pick'}</span>
              <h2 className="text-2xl font-black text-white">{topPick.player.web_name}</h2>
              <p className="text-xs text-gray-300 mt-1 max-w-xl">{getRationaleText(topPick)}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl font-black text-purple-300 block">{topPick.captain_score}</span>
            <span className="text-xs text-gray-400">{t('captain_score')}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map((c) => (
          <div
            key={c.player.id}
            onClick={() => onSelectPlayer(c.player)}
            className="glass-card p-5 hover:border-purple-400/50 transition-all cursor-pointer group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 text-sm font-extrabold flex items-center justify-center shrink-0">
                  #{c.rank}
                </span>
                <PlayerAvatar player={c.player} size="md" />
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {c.player.web_name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {c.player.team_name} • {c.player.position_name} • £{c.player.price}M
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold text-purple-400 block">{c.captain_score}</span>
                <span className="text-[10px] text-gray-400 uppercase">{t('captain_score')}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
              {getRationaleText(c)}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-gray-400">
              <span>{t('form')}: <strong className="text-amber-400">{c.player.form_score}</strong></span>
              <span>FDR: <strong className="text-emerald-400">{c.player.upcoming_fdr}</strong></span>
              <span>{t('rotation_risk')}: <strong className="text-white">{isAr ? (c.player.rotation_risk === 'Low' ? 'منخفض' : 'متوسط') : c.player.rotation_risk}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

