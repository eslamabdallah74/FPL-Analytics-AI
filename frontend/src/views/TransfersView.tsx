import React, { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';
import type { TransferTarget, Player } from '../types';
import { fetchTransfers } from '../services/api';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Loader } from '../components/Loader';

interface TransfersViewProps {
  onSelectPlayer: (player: Player) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({ onSelectPlayer }) => {
  const [targets, setTargets] = useState<TransferTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransfers(15)
      .then((res) => setTargets(res.targets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader message="Computing algorithmic transfer target scores..." />;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <span>Algorithmic Transfer Targets</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Top buy recommendations ranked by composite rating evaluating form, fixture difficulty, minutes reliability, and price value.
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
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono text-sm font-extrabold flex items-center justify-center shrink-0">
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

              <div className="text-right font-mono">
                <span className="text-2xl font-black text-emerald-400 block">{item.transfer_score}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Transfer Rating</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1 text-xs text-gray-300">
              {item.all_reasons.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-gray-400">
              <span>Form: <strong className="text-amber-400">{item.player.form_score}</strong></span>
              <span>Upcoming FDR: <strong className="text-cyan-400">{item.player.upcoming_fdr}</strong></span>
              <span>Pts: <strong className="text-white">{item.player.total_points}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
