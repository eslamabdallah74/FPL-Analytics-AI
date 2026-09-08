import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { Player } from '../types';
import { fetchPlayers } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { SearchableSelect } from '../components/SearchableSelect';
import { useLanguage } from '../context/LanguageContext';

interface PlayersViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const PlayersView: React.FC<PlayersViewProps> = ({ onSelectPlayer }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const SORT_OPTIONS = [
    { value: 'transfer_score', label: isAr ? 'تقييم الانتقال' : 'Transfer Score', sublabel: isAr ? 'تقييم خوارزمي شامل' : 'Algorithmic composite rating' },
    { value: 'expected_points', label: isAr ? 'النقاط المتوقعة (xP)' : 'Expected Points (xP)', sublabel: isAr ? 'نقاط الجولة القادمة' : 'Expected points next GW' },
    { value: 'form_score', label: isAr ? 'معدل المستوى (Form)' : 'Form Score', sublabel: isAr ? 'أداء آخر 3-5 جولات' : 'Recent 3-5 GW points output' },
    { value: 'value_score', label: isAr ? 'معدل القيمة' : 'Value Score', sublabel: isAr ? 'إجمالي النقاط لكل مليون' : 'Total points per £M' },
    { value: 'ict_per_90', label: isAr ? 'مؤشر ICT / 90 دقيقة' : 'ICT Index / 90', sublabel: isAr ? 'التأثير والتألق والتأثير/90' : 'Influence, creativity & threat per 90' },
    { value: 'returns_per_90', label: isAr ? 'المساهمات / 90 دقيقة' : 'Returns / 90', sublabel: isAr ? 'أهداف وتمريرات حاسمة/90' : 'Goal involvements per 90 mins' },
    { value: 'captain_score', label: isAr ? 'تقييم الكابتن' : 'Captain Score', sublabel: isAr ? 'إمكانية الكابتن القادمة' : 'Upcoming captain potential' },
    { value: 'total_points', label: isAr ? 'إجمالي النقاط' : 'Total Points', sublabel: isAr ? 'مجموع نقاط الموسم' : 'Season total points' },
    { value: 'price', label: isAr ? 'السعر' : 'Price', sublabel: isAr ? 'القيمة الحالية' : 'Current market value (£M)' },
    { value: 'selected_by_percent', label: isAr ? 'نسبة الملكية %' : 'Ownership %', sublabel: isAr ? 'نسبة اختيار المدربين' : 'Selected by % of managers' },
  ];

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(15);
  const [sortBy, setSortBy] = useState('transfer_score');

  const loadData = () => {
    setLoading(true);
    fetchPlayers({
      position: position || undefined,
      max_price: maxPrice < 15 ? maxPrice : undefined,
      search: search || undefined,
      sort_by: sortBy
    })
      .then((res) => setPlayers(res.players || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 250);
    return () => clearTimeout(timer);
  }, [search, position, maxPrice, sortBy]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 space-y-4 relative z-40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('players_matrix_title')}</h1>
            <p className="text-xs text-gray-400">
              {t('players_matrix_desc')}
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "ابحث عن اسم لاعب..." : "Search player name..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#38ef7d] focus:bg-black/30 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            {['', 'GKP', 'DEF', 'MID', 'FWD'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  position === pos
                    ? 'bg-[#38ef7d]/20 text-[#38ef7d] border border-[#38ef7d]/40'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {pos ? pos : t('all_positions')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{t('max_price_filter')}:</span>
              <input
                type="range"
                min="4.0"
                max="15.0"
                step="0.5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                className="w-24 accent-[#38ef7d] cursor-pointer"
              />
              <span className="text-[#38ef7d] font-bold">£{maxPrice}M</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">{t('sort_by')}:</span>
              <SearchableSelect
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={setSortBy}
                searchable={false}
                className="min-w-[170px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">{t('loading')}</div>
        ) : players.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">{isAr ? "لا يوجد لاعبون مطابقون للفلترة." : "No players match the specified filters."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">{isAr ? 'اللاعب' : 'Player'}</th>
                  <th className="p-3.5">{t('position_filter')}</th>
                  <th className="p-3.5">{isAr ? 'الفريق' : 'Team'}</th>
                  <th className="p-3.5">{t('price')}</th>
                  <th className="p-3.5">{t('total_pts')}</th>
                  <th className="p-3.5">{t('xp')}</th>
                  <th className="p-3.5">{t('form')}</th>
                  <th className="p-3.5">ICT/90</th>
                  <th className="p-3.5">{t('value')}</th>
                  <th className="p-3.5">{t('transfer_score')}</th>
                  <th className="p-3.5">{t('captain_score')}</th>
                  <th className="p-3.5">{t('rotation_risk')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {players.slice(0, 50).map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPlayer(p)}
                    className="hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 font-bold text-white group-hover:text-[#38ef7d]">
                      <div className="flex items-center gap-2.5">
                        <PlayerAvatar player={p} size="sm" />
                        <span>{p.web_name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-300">{p.position_name}</td>
                    <td className="p-3.5 text-gray-400">{p.team_name}</td>
                    <td className="p-3.5 text-gray-200">£{p.price}M</td>
                    <td className="p-3.5 text-white font-bold">{p.total_points}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{p.expected_points ?? 0}</td>
                    <td className="p-3.5 text-amber-400 font-bold">{p.form_score}</td>
                    <td className="p-3.5 text-cyan-400">{p.ict_per_90 ?? 0}</td>
                    <td className="p-3.5 text-blue-400">{p.value_score}</td>
                    <td className="p-3.5 text-emerald-400 font-black">{p.transfer_score}</td>
                    <td className="p-3.5 text-purple-400 font-bold">{p.captain_score}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${
                        p.rotation_risk === 'Low' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' :
                        p.rotation_risk === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-500/10' :
                        'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-rose-500/10'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          p.rotation_risk === 'Low' ? 'bg-emerald-400 animate-pulse' :
                          p.rotation_risk === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
                        }`}></span>
                        <span>{isAr ? (p.rotation_risk === 'Low' ? 'مشاركة مضمونة' : p.rotation_risk === 'Medium' ? 'تدوير متوسط' : 'مخاطرة عالية') : `${p.rotation_risk} Risk`}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
