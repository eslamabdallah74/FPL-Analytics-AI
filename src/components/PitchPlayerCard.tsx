import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import type { Player } from '../types';

interface PitchPlayerCardProps {
  player: Player;
  captainId?: number;
  viceId?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onSelect?: (player: Player) => void;
  showMetrics?: boolean;
}

export const PitchPlayerCard: React.FC<PitchPlayerCardProps> = ({
  player,
  captainId,
  viceId,
  isCaptain,
  isViceCaptain,
  onSelect,
  showMetrics = true,
}) => {
  const [photoError, setPhotoError] = useState(false);
  const [shirtError, setShirtError] = useState(false);

  const isCap = isCaptain || (captainId !== undefined && captainId === player.id);
  const isVc = isViceCaptain || (viceId !== undefined && viceId === player.id);

  // Position accent styling
  let posBorder = 'border-emerald-400';
  let posGlow = 'shadow-emerald-500/20';
  let posBg = 'from-emerald-950 via-[#0a1813] to-slate-950';
  let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  if (player.position_name === 'GKP') {
    posBorder = 'border-amber-400';
    posGlow = 'shadow-amber-500/20';
    posBg = 'from-amber-950 via-[#18130a] to-slate-950';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (player.position_name === 'DEF') {
    posBorder = 'border-cyan-400';
    posGlow = 'shadow-cyan-500/20';
    posBg = 'from-cyan-950 via-[#0a151f] to-slate-950';
    badgeBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  } else if (player.position_name === 'FWD') {
    posBorder = 'border-rose-400';
    posGlow = 'shadow-rose-500/20';
    posBg = 'from-rose-950 via-[#1f0a0e] to-slate-950';
    badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  }

  // Generate clean 2-letter initials fallback if image fails
  const getInitials = (name: string) => {
    if (!name) return 'FPL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const primaryImgSrc = player.photo_url || player.shirt_url;

  return (
    <div
      onClick={() => onSelect && onSelect(player)}
      className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1 select-none shrink-0"
    >
      <div className="relative">
        {/* Captain (C) Badge */}
        {isCap && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#ffd700] text-[#07110d] font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow-lg border border-white z-30 animate-pulse">
            C
          </span>
        )}

        {/* Vice Captain (VC) Badge */}
        {isVc && !isCap && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-200 text-[#07110d] font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow-lg border border-slate-400 z-30">
            V
          </span>
        )}

        {/* Player Image Container or Sleek Fallback Avatar */}
        <div className={`p-1 sm:p-1.5 rounded-full border-2 ${posBorder} ${posGlow} backdrop-blur-md shadow-xl transition-all group-hover:scale-105 bg-black/60`}>
          {primaryImgSrc && (!photoError || !shirtError) ? (
            <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex items-center justify-center relative bg-gradient-to-b from-white/10 to-transparent">
              <img
                src={primaryImgSrc}
                alt={player.web_name}
                onError={() => {
                  if (!photoError) setPhotoError(true);
                  else setShirtError(true);
                }}
                className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                loading="lazy"
              />
            </div>
          ) : (
            /* SLEEK DEFAULT FALLBACK CARD (When Player Image is Missing or Broken) */
            <div className={`w-10 h-10 xs:w-11 xs:h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${posBg} border border-white/20 flex flex-col items-center justify-center relative shadow-inner overflow-hidden`}>
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none"></div>
              
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 opacity-60 mb-0.5" />
              
              <span className="text-[10px] sm:text-xs font-black text-white tracking-wider font-mono z-10 leading-none">
                {getInitials(player.web_name)}
              </span>

              <span className={`text-[7px] sm:text-[8px] font-extrabold uppercase px-1 rounded-full border mt-0.5 z-10 ${badgeBg}`}>
                {player.position_name || 'FPL'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Player Name and XP Metrics Tag */}
      {showMetrics && (
        <div className={`mt-1 sm:mt-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-[#07110d]/95 backdrop-blur-md border ${posBorder}/40 rounded-xl text-center shadow-2xl min-w-[58px] xs:min-w-[64px] sm:min-w-[80px] md:min-w-[95px] max-w-[72px] xs:max-w-[82px] sm:max-w-none`}>
          <span className="text-[9px] sm:text-[11px] md:text-xs font-extrabold text-white block truncate leading-tight">
            {player.web_name}
          </span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-[8px] sm:text-[9px] text-gray-300 font-mono">£{player.price}M</span>
            <span className="text-[8px] sm:text-[9px] font-black text-[#38ef7d] font-mono">
              {player.expected_points || player.form_score} xP
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
