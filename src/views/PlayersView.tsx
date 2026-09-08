import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { Player } from '../types';
import { fetchPlayers } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { SearchableSelect } from '../components/SearchableSelect';

interface PlayersViewProps {
  onSelectPlayer: (player: Player) => void;
}

const SORT_OPTIONS = [
  { value: 'transfer_score', label: 'Transfer Score', sublabel: 'Algorithmic composite rating' },
  { value: 'expected_points', label: 'Expected Points (xP)', sublabel: 'Expected points next GW' },
  { value: 'form_score', label: 'Form Score', sublabel: 'Recent 3-5 GW points output' },
  { value: 'value_score', label: 'Value Score', sublabel: 'Total points per £M' },
  { value: 'ict_per_90', label: 'ICT Index / 90', sublabel: 'Influence, creativity & threat per 90' },
  { value: 'returns_per_90', label: 'Returns / 90', sublabel: 'Goal involvements per 90 mins' },
  { value: 'captain_score', label: 'Captain Score', sublabel: 'Upcoming captain potential' },
  { value: 'total_points', label: 'Total Points', sublabel: 'Season total points' },
  { value: 'price', label: 'Price', sublabel: 'Current market value (£M)' },
  { value: 'selected_by_percent', label: 'Ownership %', sublabel: 'Selected by % of managers' },
];

export const PlayersView: React.FC<PlayersViewProps> = ({ onSelectPlayer }) => {
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
            <h1 className="text-2xl font-bold text-white">Player Analytics Matrix</h1>
            <p className="text-xs text-gray-400">
              Filter and rank players based on derived analytical scores & value calculations.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#38ef7d] focus:bg-black/30 font-mono transition-all"
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
                {pos || 'ALL POSITIONS'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Max Price:</span>
              <input
                type="range"
                min="4.0"
                max="15.0"
                step="0.5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                className="w-24 accent-[#38ef7d] cursor-pointer"
              />
              <span className="font-mono text-[#38ef7d] font-bold">£{maxPrice}M</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-mono">Sort:</span>
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
          <div className="p-8 text-center text-sm text-gray-400">Loading analytical matrix...</div>
        ) : players.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No players match the specified filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Player</th>
                  <th className="p-3.5">Pos</th>
                  <th className="p-3.5">Team</th>
                  <th className="p-3.5 font-mono">Price</th>
                  <th className="p-3.5 font-mono">Total Pts</th>
                  <th className="p-3.5 font-mono">xP (Next)</th>
                  <th className="p-3.5 font-mono">Form</th>
                  <th className="p-3.5 font-mono">ICT/90</th>
                  <th className="p-3.5 font-mono">Value Pts/£</th>
                  <th className="p-3.5 font-mono">Transfer Score</th>
                  <th className="p-3.5 font-mono">Captain Score</th>
                  <th className="p-3.5">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
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
                    <td className="p-3.5 font-sans font-semibold text-gray-300">{p.position_name}</td>
                    <td className="p-3.5 font-sans text-gray-400">{p.team_name}</td>
                    <td className="p-3.5 text-gray-200">£{p.price}M</td>
                    <td className="p-3.5 text-white font-bold">{p.total_points}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{p.expected_points ?? 0}</td>
                    <td className="p-3.5 text-amber-400 font-bold">{p.form_score}</td>
                    <td className="p-3.5 text-cyan-400">{p.ict_per_90 ?? 0}</td>
                    <td className="p-3.5 text-blue-400">{p.value_score}</td>
                    <td className="p-3.5 text-emerald-400 font-black">{p.transfer_score}</td>
                    <td className="p-3.5 text-purple-400 font-bold">{p.captain_score}</td>
                    <td className="p-3.5 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.rotation_risk === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                        p.rotation_risk === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {p.rotation_risk}
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
