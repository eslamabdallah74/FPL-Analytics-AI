import React, { useEffect, useState } from 'react';
import { Sparkles, Sliders } from 'lucide-react';
import type { Player } from '../types';
import { fetchDifferentials } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Loader } from '../components/Loader';

interface DifferentialsViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const DifferentialsView: React.FC<DifferentialsViewProps> = ({ onSelectPlayer }) => {
  const [differentials, setDifferentials] = useState<Player[]>([]);
  const [maxOwnership, setMaxOwnership] = useState<number>(10.0);
  const [debouncedOwnership, setDebouncedOwnership] = useState<number>(10.0);
  const [loading, setLoading] = useState(true);

  // Smooth 250ms debounce for ownership slider drag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOwnership(maxOwnership);
    }, 250);
    return () => clearTimeout(timer);
  }, [maxOwnership]);

  // Fetch differentials only when debounced value settles
  useEffect(() => {
    setLoading(true);
    fetchDifferentials(debouncedOwnership)
      .then((res) => setDifferentials(res.differentials || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedOwnership]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>Under-Owned Differentials</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Discover hidden gem players with low ownership percentage who possess strong form & favorable fixtures.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-gray-300">Max Ownership:</span>
          <input
            type="range"
            min="2.0"
            max="15.0"
            step="1.0"
            value={maxOwnership}
            onChange={(e) => setMaxOwnership(parseFloat(e.target.value))}
            className="w-28 accent-cyan-400 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-cyan-400 min-w-[55px] text-right">&lt; {maxOwnership}%</span>
        </div>
      </div>

      {loading ? (
        <Loader message={`Searching for under-owned differential gems (< ${maxOwnership}% ownership)...`} />
      ) : differentials.length === 0 ? (
        <div className="glass-card p-8 text-center text-xs text-gray-400 font-mono">
          No differential players found under {maxOwnership}% ownership. Try increasing the ownership threshold above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {differentials.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p)}
              className="glass-card p-5 border-t-4 border-t-cyan-400 hover:border-[#38ef7d] transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlayerAvatar player={p} size="md" />
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                      {p.team_name} • {p.position_name}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {p.web_name}
                    </h3>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                  £{p.price}M
                </span>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center font-mono">
                <span className="text-[10px] text-gray-400 uppercase block">Selected By</span>
                <span className="text-2xl font-black text-cyan-400">{p.selected_by_percent}%</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="bg-white/5 p-2 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Form Score</span>
                  <span className="font-bold text-amber-400">{p.form_score}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Transfer Rating</span>
                  <span className="font-bold text-emerald-400">{p.transfer_score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
