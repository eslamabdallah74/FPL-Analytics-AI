import React, { useEffect, useState } from 'react';
import { Calendar, ShieldAlert, Sparkles } from 'lucide-react';
import type { FixturePlannerResponse } from '../types';
import { fetchFixtures } from '../services/api';
import { Loader } from '../components/Loader';
import { TeamBadge } from '../components/TeamBadge';
import { useLanguage } from '../context/LanguageContext';

export const FixturesView: React.FC = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [data, setData] = useState<FixturePlannerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFixtures()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <Loader message={t('loading')} />;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#38ef7d]" />
          <span>{t('fixture_planner_title')}</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {t('fixture_planner_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>{t('easy_runs')}</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-300">
            {data.easy_runs.map((r) => (
              <li key={r.team_id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-colors">
                <div className="flex items-center gap-2.5">
                  <TeamBadge shirtUrl={r.shirt_url} badgeUrl={r.badge_url} teamCode={r.team_code} teamName={r.team_name} size="sm" />
                  <span className="font-bold text-white">{r.team_name}</span>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  FDR {r.avg_fdr}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/30 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4" />
            <span>{t('hard_runs')}</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-300">
            {data.hard_runs.map((r) => (
              <li key={r.team_id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-colors">
                <div className="flex items-center gap-2.5">
                  <TeamBadge shirtUrl={r.shirt_url} badgeUrl={r.badge_url} teamCode={r.team_code} teamName={r.team_name} size="sm" />
                  <span className="font-bold text-white">{r.team_name}</span>
                </div>
                <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  FDR {r.avg_fdr}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card overflow-hidden p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
          {isAr ? 'جدول المباريات (مرتب من الأسهل للأصعب)' : 'Upcoming Schedule (Sorted by Easiest Schedule)'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-gray-400 border-b border-white/10 uppercase">
                <th className="py-3 px-2">{isAr ? 'الفريق' : 'Team'}</th>
                <th className="py-3 px-2">FDR</th>
                <th className="py-3 px-2 text-center">{isAr ? 'الـ 5 مباريات القادمة' : 'Next 5 Fixtures'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.planner.map((item) => (
                <tr key={item.team_id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 font-bold text-white">
                    <div className="flex items-center gap-3">
                      <TeamBadge shirtUrl={item.shirt_url} badgeUrl={item.badge_url} teamCode={item.team_code} teamName={item.team_name} size="md" />
                      <div>
                        <span className="block text-sm font-bold text-white">{item.team_name}</span>
                        <span className="block text-[10px] text-gray-400">{item.team_short}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2 font-bold text-[#38ef7d] text-sm">
                    {item.avg_fdr}
                  </td>

                  <td className="py-3 px-1.5 sm:px-2">
                    <div className="flex gap-1.5 sm:gap-2 justify-center">
                      {item.fixtures.map((f, i) => (
                        <div
                          key={i}
                          className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-center font-bold text-[10px] sm:text-[11px] min-w-[54px] sm:min-w-[72px] flex flex-col items-center justify-between ${
                            f.difficulty <= 2 ? 'fdr-1' : f.difficulty === 3 ? 'fdr-3' : 'fdr-5'
                          }`}
                        >
                          <span className="block text-[8px] sm:text-[9px] opacity-70">GW{f.event}</span>
                          <div className="flex items-center gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                            <TeamBadge shirtUrl={f.opponent_shirt_url} badgeUrl={f.opponent_badge_url} teamCode={f.opponent_code} teamName={f.opponent_name} size="xs" />
                            <span className="block font-extrabold text-[9px] sm:text-[11px]">{f.opponent_short}</span>
                          </div>
                          <span className="block text-[8px] sm:text-[9px] opacity-80">{f.is_home ? (isAr ? '(ملعبه)' : '(H)') : (isAr ? '(خارج)' : '(A)')}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

