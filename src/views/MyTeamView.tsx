import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Crown, 
  ArrowRightLeft, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  UserCheck,
  Coins,
  Award,
  Loader2,
  HelpCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { fetchMyTeam } from '../services/api';
import type { MyTeamResponse, Player } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { PitchPlayerCard } from '../components/PitchPlayerCard';
import { PlayerAvatar } from '../components/PlayerAvatar';

interface MyTeamViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const MyTeamView: React.FC<MyTeamViewProps> = ({ onSelectPlayer }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [teamId, setTeamId] = useState<string>('7944239');
  const [data, setData] = useState<MyTeamResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const handleSyncTeam = (idToFetch: string) => {
    if (!idToFetch || isNaN(Number(idToFetch))) {
      setError(isAr ? 'يرجى إدخال رقم صحيح للفريق في الفانتسي' : 'Please enter a valid numeric FPL Team ID');
      return;
    }
    setLoading(true);
    setError(null);
    fetchMyTeam(Number(idToFetch))
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to fetch squad data for this Team ID');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    handleSyncTeam('7944239');
  }, []);

  const gkpList = data?.starting_xi.filter(p => p.position_name === 'GKP') || [];
  const defList = data?.starting_xi.filter(p => p.position_name === 'DEF') || [];
  const midList = data?.starting_xi.filter(p => p.position_name === 'MID') || [];
  const fwdList = data?.starting_xi.filter(p => p.position_name === 'FWD') || [];

  const demoTeamIds = [
    { id: '7944239', name: 'SOSY' },
    { id: '5011061', name: 'Sezo' },
    { id: '2830159', name: 'Mr Dracula' },
    { id: '1', name: 'FPL #1' }
  ];

  return (
    <div className="space-y-8">
      {/* Header & FPL Team ID Sync Section */}
      <div className="glass-card p-6 border-l-4 border-l-[#38ef7d] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#38ef7d]/20 text-[#38ef7d] text-[10px] font-bold uppercase tracking-wider border border-[#38ef7d]/30">
                {t('ai_engine')}
              </span>
              <span className="text-xs text-gray-400">• {isAr ? 'مزامنة مباشرة' : 'Instant Team Sync'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-[#38ef7d]" />
              <span>{t('squad_analyzer')}</span>
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              {t('squad_analyzer_desc')}
            </p>
          </div>

          {/* Quick Demo Selector */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 shrink-0">
            <span className="font-semibold">{isAr ? 'أمثلة تجريبية:' : 'Example Teams:'}</span>
            {demoTeamIds.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => { setTeamId(demo.id); handleSyncTeam(demo.id); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                  teamId === demo.id
                    ? 'bg-[#38ef7d] text-black border-[#38ef7d] shadow-md shadow-[#38ef7d]/20'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
              >
                {demo.name} ({demo.id})
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar without number arrows */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSyncTeam(teamId); }} 
          className="flex flex-col sm:flex-row items-center gap-3 pt-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value.replace(/\D/g, ''))}
              placeholder={t('team_id_placeholder')}
              className="w-full bg-[#070a12]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#38ef7d] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] font-bold rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#38ef7d]/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('syncing')}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>{t('sync_team_btn')}</span>
              </>
            )}
          </button>
        </form>

        {/* Interactive "How to find your Team ID?" Help Toggle & Card */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs font-bold text-[#38ef7d] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isAr ? 'كيف تحصل على رقم تشكيلتك (Team ID)؟' : 'How to find your FPL Team ID?'}</span>
          </button>

          {showHelp && (
            <div className="mt-3 p-4 bg-white/5 border border-[#38ef7d]/30 rounded-2xl space-y-3 text-xs text-gray-200">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38ef7d]" />
                <span>{isAr ? 'خطوات الاستخراج البسيطة:' : 'Easy Steps to Find Your Team ID:'}</span>
              </h4>

              <ol className="space-y-2.5 list-decimal list-inside text-gray-300">
                <li>
                  {isAr ? 'قم بتسجيل الدخول في موقع الفانتسي الرسمي: ' : 'Log in to the official Premier League Fantasy site: '}
                  <a
                    href="https://fantasy.premierleague.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#38ef7d] hover:underline font-bold inline-flex items-center gap-1"
                  >
                    fantasy.premierleague.com <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  {isAr ? 'انتقل إلى صفحة النقاط (' : 'Go to the '}
                  <strong className="text-white">{isAr ? 'Points' : 'Points'}</strong>
                  {isAr ? ') أو صفحة الفريق (' : ' or '}
                  <strong className="text-white">{isAr ? 'Pick Team' : 'Pick Team'}</strong>
                  {isAr ? ').' : ' page.'}
                </li>
                <li>
                  {isAr ? 'لاحظ رابط الصفحة في الأعلى (URL)، ستجده بهذا الشكل:' : 'Look at your browser URL address bar, you will see a link like:'}
                  <div className="mt-1.5 p-2.5 bg-black/70 border border-white/10 rounded-xl font-mono text-[11px] text-[#38ef7d] overflow-x-auto">
                    https://fantasy.premierleague.com/en/entry/<span className="bg-[#38ef7d] text-black px-1.5 py-0.5 rounded font-black">5011061</span>/event/3
                  </div>
                </li>
                <li>
                  {isAr ? 'انسخ الرقم المكتوب بعد كلمة ' : 'Copy the number right after '}
                  <code className="text-amber-400 font-mono font-bold">/entry/</code>
                  {isAr ? ' (وهو ' : ' (which is '}
                  <strong className="text-amber-400 font-mono font-bold">5011061</strong>
                  {isAr ? ' في هذا المثال) والصقه في مربع البحث أعلاه!' : ' in the example above) and paste it into the box above!'}
                </li>
              </ol>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {data && (
        <div className="space-y-8">
          {/* Manager Stats Bar */}
          <div className="glass-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">{isAr ? 'المدرب والفريق' : 'Manager & Team'}</span>
              <h3 className="text-base font-bold text-white truncate">{data.manager_info.manager_name}</h3>
              <p className="text-xs text-[#38ef7d] truncate">{data.manager_info.team_name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">{t('overall_rank')}</span>
              <div className="flex items-center gap-1.5 text-base font-extrabold text-amber-400">
                <Award className="w-4 h-4" />
                <span>#{data.manager_info.overall_rank.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">{data.manager_info.overall_points} {t('total_pts')}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">{t('bank_remaining')}</span>
              <div className="flex items-center gap-1.5 text-base font-extrabold text-emerald-400">
                <Coins className="w-4 h-4" />
                <span>£{data.manager_info.bank.toFixed(1)}M</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">{t('squad_value')}</span>
              <div className="flex items-center gap-1.5 text-base font-extrabold text-cyan-400">
                <UserCheck className="w-4 h-4" />
                <span>£{data.manager_info.team_value.toFixed(1)}M</span>
              </div>
            </div>
          </div>

          {/* AI Manager Recommendations Suite */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Card 1: Captain & Armband Advice */}
            <div className="glass-card p-5 border-t-4 border-t-amber-400 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Crown className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                    {t('armband_advice')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{isAr ? 'اختيار الكابتن ونائب الكابتن' : 'Captain & Vice-Captain Selection'}</h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {isAr && data.ai_advice.captain_advice_text.includes('optimal')
                    ? `اختيار شارة الكابتن (${data.ai_advice.recommended_captain?.web_name}) خيار مثالي! أعلى تقييم كابتن في فريقك (${data.ai_advice.recommended_captain?.captain_score} نقطة).`
                    : isAr && data.ai_advice.recommended_captain
                    ? `ينصح بإعطاء الشارة للاعب ${data.ai_advice.recommended_captain.web_name} (تقييم الكابتن ${data.ai_advice.recommended_captain.captain_score}) بدلاً من اختيارك الحالي.`
                    : data.ai_advice.captain_advice_text}
                </p>

                {data.ai_advice.recommended_captain && (
                  <div className="bg-white/5 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar player={data.ai_advice.recommended_captain} size="md" showShirt={true} />
                      <div>
                        <span className="text-xs font-bold text-white block">{data.ai_advice.recommended_captain.web_name}</span>
                        <span className="text-[10px] text-gray-400">{data.ai_advice.recommended_captain.team_name} • {data.ai_advice.recommended_captain.position_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-400 block">{data.ai_advice.recommended_captain.captain_score}</span>
                      <span className="text-[9px] text-gray-400 uppercase">{t('captain_score')}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center gap-1.5">
                {data.ai_advice.is_captain_optimal ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{data.ai_advice.is_captain_optimal ? (isAr ? "شارة الكابتن في وضعها المثالي!" : "Armband is currently optimal!") : (isAr ? "قم بتغيير الشارة قبل موعد الديدلاين!" : "Swap (C) armband before deadline!")}</span>
              </div>
            </div>

            {/* Card 2: Lineup & Bench Optimizer */}
            <div className="glass-card p-5 border-t-4 border-t-indigo-400 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {t('bench_optimizer')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{isAr ? 'مفاضلة التشكيلة والدكة' : 'Starting XI vs Bench Swaps'}</h3>

                {data.ai_advice.lineup_swaps.length > 0 ? (
                  <div className="space-y-2">
                    {data.ai_advice.lineup_swaps.map((swap, idx) => (
                      <div key={idx} className="bg-white/5 border border-indigo-500/30 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="text-emerald-400">{isAr ? 'أدخل:' : 'IN:'} {swap.bench_player.web_name}</span>
                          <span className="text-rose-400">{isAr ? 'أخرج:' : 'OUT:'} {swap.starting_player.web_name}</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-normal">
                          {isAr 
                            ? `ابدأ بـ ${swap.bench_player.web_name} (${swap.bench_player.expected_points} xP) بدلاً من ${swap.starting_player.web_name} (${swap.starting_player.expected_points} xP) لسهولة المباراة والمستوى.`
                            : swap.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{isAr ? 'تشكيلتك الأساسية الحالية هي الأفضل رياضياً، لا حاجة لتبديل الدكة.' : 'Your current starting 11 is mathematically optimal. No bench swaps needed.'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Buy & Sell Transfer Recommender */}
            <div className="glass-card p-5 border-t-4 border-t-emerald-400 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    {t('transfer_target')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{isAr ? 'توصية الانتقال (بيع وشراء)' : 'Who to Sell & Who to Buy'}</h3>

                {data.ai_advice.transfer_recommendation ? (
                  <div className="bg-white/5 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-rose-400 font-bold">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block">{t('sell')}</span>
                        <span>{data.ai_advice.transfer_recommendation.sell_player.web_name} (£{data.ai_advice.transfer_recommendation.sell_player.price}M)</span>
                      </div>
                      <span className="text-gray-400">➔</span>
                      <div className="text-emerald-400 font-bold text-right">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block">{t('buy')}</span>
                        <span>{data.ai_advice.transfer_recommendation.buy_player.web_name} (£{data.ai_advice.transfer_recommendation.buy_player.price}M)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-300">{isAr ? 'تشكيلتك متوازنة تماماً عبر جميع المراكز.' : 'Your squad metrics are solid across all positions!'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tactical Football Pitch View */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#38ef7d]" />
                <span>{t('pitch_setup')}</span>
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-[#38ef7d] text-xs font-bold border border-[#38ef7d]/30 shadow-sm">
                  {t('showing_gw_squad', { gw: data.manager_info.gameweek_fetched || 3 })}
                </span>
              </div>
            </div>

            {/* Pitch Container */}
            <div className="relative w-full rounded-3xl px-1.5 py-3 sm:p-6 md:p-8 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-emerald-500/40 shadow-2xl overflow-hidden min-h-[480px] sm:min-h-[580px] flex flex-col justify-between">
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38ef7d_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="absolute inset-x-4 sm:inset-x-8 top-0 h-20 sm:h-24 border-b-2 border-emerald-400/30 rounded-b-3xl pointer-events-none"></div>
              <div className="absolute inset-x-4 sm:inset-x-8 bottom-0 h-20 sm:h-24 border-t-2 border-emerald-400/30 rounded-t-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/30 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 border-2 border-emerald-400/30 rounded-full pointer-events-none"></div>

              {/* Goalkeeper */}
              <div className="relative z-10 flex justify-center gap-2 sm:gap-4 py-1.5 sm:py-2">
                {gkpList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} isCaptain={player.is_captain} isViceCaptain={player.is_vice_captain} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Defenders */}
              <div className="relative z-10 flex justify-around gap-1 sm:gap-4 md:gap-6 py-1.5 sm:py-2">
                {defList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} isCaptain={player.is_captain} isViceCaptain={player.is_vice_captain} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Midfielders */}
              <div className="relative z-10 flex justify-around gap-1 sm:gap-4 md:gap-6 py-1.5 sm:py-2">
                {midList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} isCaptain={player.is_captain} isViceCaptain={player.is_vice_captain} onSelect={onSelectPlayer} />
                ))}
              </div>

              {/* Forwards */}
              <div className="relative z-10 flex justify-center gap-3 sm:gap-8 md:gap-12 py-1.5 sm:py-2">
                {fwdList.map(player => (
                  <PitchPlayerCard key={player.id} player={player} isCaptain={player.is_captain} isViceCaptain={player.is_vice_captain} onSelect={onSelectPlayer} />
                ))}
              </div>
            </div>

            {/* Bench Strip Container */}
            <div className="glass-card p-4 sm:p-5 space-y-3 border-t-4 border-t-gray-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {t('bench_substitutes')}
                </span>
              </div>

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
                    <PlayerAvatar player={player} size="sm" showShirt={true} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white truncate block">{player.web_name}</span>
                      <span className="text-[10px] text-gray-400 block truncate">{player.position_name} • £{player.price}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
