import React, { useState, useEffect } from 'react';
import { GitCompare, CheckCircle, Users, Calendar, Sparkles, Trophy } from 'lucide-react';
import type { Player, ComparisonResult } from '../types';
import { fetchPlayers, comparePlayers } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { SearchablePlayerSelect } from '../components/SearchablePlayerSelect';
import { TeamBadge } from '../components/TeamBadge';
import { Loader } from '../components/Loader';

export const CompareView: React.FC = () => {
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
          <span>Smart Head-to-Head Player Comparison</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Select any two FPL players to run an algorithmic analytical comparison including expected points (xP), form, underlying 90-min metrics, and upcoming 3 & 5 fixture difficulty runs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`glass-card p-4 transition-all duration-200 ${openSelect === 'p1' ? 'relative z-50 ring-2 ring-indigo-500/50' : 'relative z-20'}`}>
          <SearchablePlayerSelect
            players={allPlayers}
            selectedId={p1Id}
            onSelect={(id) => setP1Id(id)}
            onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'p1' : null)}
            label="Select Player 1"
            placeholder="Type player name, team, position..."
            loading={playersLoading}
          />
        </div>

        <div className={`glass-card p-4 transition-all duration-200 ${openSelect === 'p2' ? 'relative z-50 ring-2 ring-indigo-500/50' : 'relative z-10'}`}>
          <SearchablePlayerSelect
            players={allPlayers}
            selectedId={p2Id}
            onSelect={(id) => setP2Id(id)}
            onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'p2' : null)}
            label="Select Player 2"
            placeholder="Type player name, team, position..."
            loading={playersLoading}
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Running head-to-head algorithmic metric evaluation & fixture matrix..." />
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

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest block">
                    Algorithmic Verdict Winner
                  </span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    RECOMMENDED PICK
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <span>{winnerPlayer.web_name}</span>
                  <span className="text-sm font-normal text-gray-300">({winnerPlayer.team_name} • £{winnerPlayer.price}M)</span>
                </h2>
                <p className="text-xs text-gray-300 mt-1 max-w-xl">
                  {result.verdict}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 font-mono">
              <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl text-center">
                <span className="text-[10px] text-gray-400 uppercase block">Expected Pts</span>
                <span className="text-xl font-black text-emerald-400">{winnerPlayer.expected_points ?? 0} xP</span>
              </div>
              <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl text-center">
                <span className="text-[10px] text-gray-400 uppercase block">Transfer Rating</span>
                <span className="text-xl font-black text-indigo-300">{winnerPlayer.transfer_score}</span>
              </div>
            </div>
          </div>

          {/* Upcoming 3 & 5 Fixtures Comparison Section */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Fixtures & Difficulty Run Comparison</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
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
                    <span className="text-[10px] text-gray-400 block">Next 3 GW FDR</span>
                    <span className="text-emerald-400 font-bold">{result.p1_fdr_3 ?? result.player1.upcoming_fdr}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 uppercase block font-sans font-semibold">Next 5 Gameweek Schedule:</span>
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
                        <span className="block text-[9px] opacity-80">{f.is_home ? '(H)' : '(A)'}</span>
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
                    <span className="text-[10px] text-gray-400 block">Next 3 GW FDR</span>
                    <span className="text-emerald-400 font-bold">{result.p2_fdr_3 ?? result.player2.upcoming_fdr}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 uppercase block font-sans font-semibold">Next 5 Gameweek Schedule:</span>
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
                        <span className="block text-[9px] opacity-80">{f.is_home ? '(H)' : '(A)'}</span>
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
                  <span>{result.player1.web_name}'s Key Advantages</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-200 font-mono">
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
                  <span>{result.player2.web_name}'s Key Advantages</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-200 font-mono">
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
          <div className="glass-card overflow-hidden p-5">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <PlayerAvatar player={result.player1} size="lg" showShirt={true} />
                <div>
                  <h3 className="text-lg font-bold text-white">{result.player1.web_name}</h3>
                  <p className="text-xs text-gray-400">{result.player1.team_name} • £{result.player1.price}M</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 text-right">
                <div>
                  <h3 className="text-lg font-bold text-white">{result.player2.web_name}</h3>
                  <p className="text-xs text-gray-400">{result.player2.team_name} • £{result.player2.price}M</p>
                </div>
                <PlayerAvatar player={result.player2} size="lg" showShirt={true} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase">
                    <th className="py-3">{result.player1.web_name}</th>
                    <th className="py-3 text-center">Metric Category</th>
                    <th className="py-3 text-right">{result.player2.web_name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-sm">
                  {result.matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className={`py-3 ${row.winner === 'player1' ? 'text-[#38ef7d] font-bold' : 'text-gray-300'}`}>
                        <div className="flex items-center gap-2">
                          {row.winner === 'player1' && <CheckCircle className="w-4 h-4 text-[#38ef7d]" />}
                          <span>{typeof row.player1_val === 'number' ? row.player1_val.toLocaleString() : row.player1_val}</span>
                        </div>
                      </td>

                      <td className="py-3 text-center font-sans font-semibold text-gray-400 text-xs">
                        {row.metric}
                      </td>

                      <td className={`py-3 text-right ${row.winner === 'player2' ? 'text-[#38ef7d] font-bold' : 'text-gray-300'}`}>
                        <div className="flex items-center justify-end gap-2">
                          <span>{typeof row.player2_val === 'number' ? row.player2_val.toLocaleString() : row.player2_val}</span>
                          {row.winner === 'player2' && <CheckCircle className="w-4 h-4 text-[#38ef7d]" />}
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
          <h3 className="text-base font-bold text-white">Select Players to Compare</h3>
          <p className="text-xs text-gray-400 max-w-sm">
            Choose Player 1 and Player 2 from the searchable dropdowns above to compare expected points (xP), recent form, ICT index, value scores, upcoming 3 & 5 fixture runs, and key statistical advantages.
          </p>
        </div>
      )}
    </div>
  );
};
