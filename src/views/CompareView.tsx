import React, { useState, useEffect } from 'react';
import { GitCompare, CheckCircle, Users, Calendar, Sparkles, Trophy } from 'lucide-react';
import type { Player, ComparisonResult } from '../types';
import { fetchPlayers, comparePlayers } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { SearchablePlayerSelect } from '../components/SearchablePlayerSelect';
import { TeamBadge } from '../components/TeamBadge';
import { Loader } from '../components/Loader';
import { useLanguage } from '../context/LanguageContext';

export const CompareView: React.FC = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [p1Id, setP1Id] = useState<number | null>(null);
  const [p2Id, setP2Id] = useState<number | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openSelect, setOpenSelect] = useState<'p1' | 'p2' | null>(null);

  useEffect(() => {
    setPlayersLoading(true);
    fetchPlayers()
      .then((res) => {
        const list = res.players || [];
        setAllPlayers(list);
      })
      .catch(console.error)
      .finally(() => setPlayersLoading(false));
  }, []);

  useEffect(() => {
    if (p1Id && p2Id && p1Id !== p2Id) {
      setLoading(true);
      comparePlayers(p1Id, p2Id)
        .then(setResult)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [p1Id, p2Id]);

  const winnerPlayer = result ? (result.winner_player || (result.winner_id === result.player1.id ? result.player1 : result.player2)) : null;

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-indigo-400" />
          <span>{t('compare_title')}</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {t('compare_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`glass-card p-4 transition-all duration-200 ${openSelect === 'p1' ? 'relative z-30 ring-2 ring-indigo-500/50' : 'relative z-10'}`}>
          <SearchablePlayerSelect
            players={allPlayers}
            selectedId={p1Id}
            onSelect={(id) => setP1Id(id)}
            onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'p1' : null)}
            label={t('select_player_1')}
            placeholder={isAr ? "اكتب اسم اللاعب، الفريق، أو المركز..." : "Type player name, team, position..."}
            loading={playersLoading}
          />
        </div>

        <div className={`glass-card p-4 transition-all duration-200 ${openSelect === 'p2' ? 'relative z-30 ring-2 ring-indigo-500/50' : 'relative z-10'}`}>
          <SearchablePlayerSelect
            players={allPlayers}
            selectedId={p2Id}
            onSelect={(id) => setP2Id(id)}
            onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'p2' : null)}
            label={t('select_player_2')}
            placeholder={isAr ? "اكتب اسم اللاعب، الفريق، أو المركز..." : "Type player name, team, position..."}
            loading={playersLoading}
          />
        </div>
      </div>

      {loading ? (
        <Loader message={t('loading')} />
      ) : result && winnerPlayer ? (
        <div className="space-y-6">
          {/* Smart Analytical Verdict Banner with Player Avatar & Kit Shirt */}
          <div className="glass-card p-6 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-emerald-500/10 border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="relative">
                <PlayerAvatar player={winnerPlayer} size="xl" showShirt={true} />
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-amber-400 text-black rounded-full shadow-lg">
                  <Trophy className="w-4 h-4 fill-current" />
                </div>
              </div>

              <div className="space-y-1.5 text-start">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                    {t('verdict_winner')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    RECOMMENDED PICK
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {winnerPlayer.web_name}
                  </h2>
                  <div className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mt-0.5">
                    <span>{winnerPlayer.team_name}</span>
                    <span>•</span>
                    <span dir="ltr" className="font-mono font-bold text-[#38ef7d]">£{winnerPlayer.price}M</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 max-w-xl leading-relaxed pt-1">
                  {isAr 
                    ? `يوصى باختيار ${winnerPlayer.web_name} متفوقاً في المقارنة، بفضل النقاط المتوقعة ومعدل الأداء والمباريات القادمة.`
                    : result.verdict}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl text-center">
                <span className="text-[10px] text-gray-400 uppercase block">{t('xp')}</span>
                <span className="text-xl font-black text-emerald-400">{winnerPlayer.expected_points ?? 0} xP</span>
              </div>
              <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl text-center">
                <span className="text-[10px] text-gray-400 uppercase block">{t('transfer_score')}</span>
                <span className="text-xl font-black text-indigo-300">{winnerPlayer.transfer_score}</span>
              </div>
            </div>
          </div>

          {/* Upcoming 3 & 5 Fixtures Comparison Section */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'مقارنة صعوبة المباريات القادمة' : 'Upcoming Fixtures & Difficulty Run Comparison'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Player 1 Fixtures */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar player={result.player1} size="sm" />
                    <div>
                      <span className="font-bold text-white block text-sm">{result.player1.web_name}</span>
                      <span className="text-[10px] text-gray-400">{result.player1.team_name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">{isAr ? 'معدل الـ 3 جولات' : 'Next 3 GW FDR'}</span>
                    <span className="text-emerald-400 font-bold">{result.p1_fdr_3 ?? result.player1.upcoming_fdr}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 uppercase block font-semibold">{isAr ? 'مباريات الـ 5 جولات القادمة:' : 'Next 5 Gameweek Schedule:'}</span>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {result.player1.upcoming_fixtures?.map((f, i) => (
                      <div
                        key={i}
                        className={`flex-1 min-w-[70px] p-2 rounded-xl border text-center font-bold text-[10px] flex flex-col items-center justify-between ${
                          f.difficulty <= 2 ? 'fdr-1' : f.difficulty === 3 ? 'fdr-3' : 'fdr-5'
                        }`}
                      >
                        <span className="block opacity-70">GW{f.event}</span>
                        <div className="flex items-center gap-1 my-1">
                          <TeamBadge shirtUrl={f.opponent_shirt_url} badgeUrl={f.opponent_badge_url} teamCode={f.opponent_code} teamName={f.opponent_name} size="xs" />
                          <span>{f.opponent_short}</span>
                        </div>
                        <span className="block text-[9px] opacity-80">{f.is_home ? (isAr ? '(ملعبه)' : '(H)') : (isAr ? '(خارج)' : '(A)')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Player 2 Fixtures */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar player={result.player2} size="sm" />
                    <div>
                      <span className="font-bold text-white block text-sm">{result.player2.web_name}</span>
                      <span className="text-[10px] text-gray-400">{result.player2.team_name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">{isAr ? 'معدل الـ 3 جولات' : 'Next 3 GW FDR'}</span>
                    <span className="text-emerald-400 font-bold">{result.p2_fdr_3 ?? result.player2.upcoming_fdr}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 uppercase block font-semibold">{isAr ? 'مباريات الـ 5 جولات القادمة:' : 'Next 5 Gameweek Schedule:'}</span>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {result.player2.upcoming_fixtures?.map((f, i) => (
                      <div
                        key={i}
                        className={`flex-1 min-w-[70px] p-2 rounded-xl border text-center font-bold text-[10px] flex flex-col items-center justify-between ${
                          f.difficulty <= 2 ? 'fdr-1' : f.difficulty === 3 ? 'fdr-3' : 'fdr-5'
                        }`}
                      >
                        <span className="block opacity-70">GW{f.event}</span>
                        <div className="flex items-center gap-1 my-1">
                          <TeamBadge shirtUrl={f.opponent_shirt_url} badgeUrl={f.opponent_badge_url} teamCode={f.opponent_code} teamName={f.opponent_name} size="xs" />
                          <span>{f.opponent_short}</span>
                        </div>
                        <span className="block text-[9px] opacity-80">{f.is_home ? (isAr ? '(ملعبه)' : '(H)') : (isAr ? '(خارج)' : '(A)')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Advantages Comparison Cards */}
          {(result.p1_advantages?.length || result.p2_advantages?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('advantages_of', { name: result.player1.web_name })}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-200">
                  {result.p1_advantages?.slice(0, 5).map((adv, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('advantages_of', { name: result.player2.web_name })}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-200">
                  {result.p2_advantages?.slice(0, 5).map((adv, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {/* Detailed 12-Metric Head-to-Head Comparison Matrix */}
          <div className="glass-card overflow-hidden p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <PlayerAvatar player={result.player1} size="md" showShirt={true} />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg font-bold text-white truncate">{result.player1.web_name}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">{result.player1.team_name} • £{result.player1.price}M</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 sm:gap-3 text-right min-w-0">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg font-bold text-white truncate">{result.player2.web_name}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">{result.player2.team_name} • £{result.player2.price}M</p>
                </div>
                <PlayerAvatar player={result.player2} size="md" showShirt={true} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] sm:text-xs">
                    <th className="py-2.5 px-2">{result.player1.web_name}</th>
                    <th className="py-2.5 px-2 text-center">{isAr ? 'المعيار' : 'Metric'}</th>
                    <th className="py-2.5 px-2 text-right">{result.player2.web_name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  {result.matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className={`py-2.5 px-2 ${row.winner === 'player1' ? 'text-[#38ef7d] font-bold' : 'text-gray-300'}`}>
                        <div className="flex items-center gap-1.5">
                          {row.winner === 'player1' && <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38ef7d] shrink-0" />}
                          <span>{typeof row.player1_val === 'number' ? row.player1_val.toLocaleString() : row.player1_val}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center font-semibold text-gray-400 text-[10px] sm:text-xs">
                        {row.metric}
                      </td>

                      <td className={`py-2.5 px-2 text-right ${row.winner === 'player2' ? 'text-[#38ef7d] font-bold' : 'text-gray-300'}`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{typeof row.player2_val === 'number' ? row.player2_val.toLocaleString() : row.player2_val}</span>
                          {row.winner === 'player2' && <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38ef7d] shrink-0" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">{isAr ? 'اختر اللاعبين للمقارنة' : 'Select Players to Compare'}</h3>
          <p className="text-xs text-gray-400 max-w-sm">
            {isAr 
              ? 'قم باختيار اللاعب الأول واللاعب الثاني من القائمة أعلاه لمقارنة النقاط المتوقعة، المستوى، القيمة، وجدول المباريات.'
              : 'Choose Player 1 and Player 2 from the dropdowns above to compare expected points (xP), recent form, ICT index, value scores, upcoming fixture runs, and statistical advantages.'}
          </p>
        </div>
      )}
    </div>
  );
};
