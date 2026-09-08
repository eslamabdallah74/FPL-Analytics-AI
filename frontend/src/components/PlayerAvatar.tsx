import React, { useState } from 'react';
import type { Player } from '../types';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showShirt?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ 
  player, 
  size = 'md', 
  showShirt = true 
}) => {
  const [photoError, setPhotoError] = useState(false);
  const [shirtError, setShirtError] = useState(false);

  const containerSizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };

  const photoSizes = {
    sm: 'w-8 h-10',
    md: 'w-11 h-14',
    lg: 'w-16.20',
    xl: 'w-24 h-30'
  };

  const shirtSizes = {
    sm: 'w-4 h-4 -bottom-1 -right-1',
    md: 'w-5 h-5 -bottom-1 -right-1',
    lg: 'w-7 h-7 -bottom-1 -right-1',
    xl: 'w-10 h-10 -bottom-2 -right-2'
  };

  return (
    <div className="relative inline-block shrink-0">
      <div className={`${containerSizes[size]} rounded-2xl bg-gradient-to-br from-[#11998e]/30 to-[#38ef7d]/20 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner`}>
        {player.photo_url && !photoError ? (
          <img
            src={size === 'xl' && player.photo_url_lg ? player.photo_url_lg : player.photo_url}
            alt={player.web_name}
            onError={() => setPhotoError(true)}
            className={`${photoSizes[size]} object-cover object-top scale-110 translate-y-1`}
            loading="lazy"
          />
        ) : (
          <span className="font-extrabold text-white">
            {player.position_name || 'FPL'}
          </span>
        )}
      </div>

      {showShirt && player.shirt_url && !shirtError && (
        <img
          src={player.shirt_url}
          alt={`${player.team_name} kit`}
          onError={() => setShirtError(true)}
          className={`absolute ${shirtSizes[size]} object-contain drop-shadow-md z-10 pointer-events-none`}
        />
      )}
    </div>
  );
};
