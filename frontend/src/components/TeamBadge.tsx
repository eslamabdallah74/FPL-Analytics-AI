import React, { useState } from 'react';

interface TeamBadgeProps {
  shirtUrl?: string;
  badgeUrl?: string;
  teamCode?: number;
  teamName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  shirtUrl,
  badgeUrl,
  teamCode,
  teamName = 'Team',
  size = 'sm',
  className = '',
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const [useBadge, setUseBadge] = useState(false);

  // Compute image sources
  const defaultShirtUrl = shirtUrl || (teamCode ? `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}-66.png` : '');
  const defaultBadgeUrl = badgeUrl || (teamCode ? `https://resources.premierleague.com/premierleague/badges/70/t${teamCode}.png` : '');

  const sizeClasses = {
    xs: 'w-4 h-4 text-[9px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const imgSizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  if (useFallback) {
    // Stylized initials fallback pill
    const initials = teamName.slice(0, 3).toUpperCase();
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-white/10 font-mono font-bold text-gray-300 border border-white/10 shrink-0 ${sizeClasses[size]} ${className}`}
        title={teamName}
      >
        {initials}
      </span>
    );
  }

  const currentSrc = useBadge ? defaultBadgeUrl : defaultShirtUrl;

  if (!currentSrc) {
    const initials = teamName.slice(0, 3).toUpperCase();
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg bg-white/10 font-mono font-bold text-gray-300 border border-white/10 shrink-0 ${sizeClasses[size]} ${className}`}
        title={teamName}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={teamName}
      title={teamName}
      onError={() => {
        if (!useBadge && defaultBadgeUrl) {
          setUseBadge(true);
        } else {
          setUseFallback(true);
        }
      }}
      className={`object-contain shrink-0 filter drop-shadow-md transition-transform ${imgSizeClasses[size]} ${className}`}
    />
  );
};
