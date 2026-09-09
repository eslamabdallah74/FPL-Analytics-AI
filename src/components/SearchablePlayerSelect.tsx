import React, { useState, useRef, useEffect, useMemo, useDeferredValue } from 'react';
import { Search, ChevronDown, X, Check, Loader2 } from 'lucide-react';
import type { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface SearchablePlayerSelectProps {
  players: Player[];
  selectedId: number | null;
  onSelect: (playerId: number) => void;
  label?: string;
  placeholder?: string;
  loading?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const SearchablePlayerSelect: React.FC<SearchablePlayerSelectProps> = ({
  players,
  selectedId,
  onSelect,
  label,
  placeholder = 'Search player name, team, position...',
  loading = false,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // React 18 Deferred Value for smooth 60fps typing without rendering stutter
  const deferredSearch = useDeferredValue(search);

  const selectedPlayer = useMemo(() => {
    return players.find((p) => p.id === selectedId);
  }, [players, selectedId]);

  const toggleOpen = (state: boolean) => {
    setIsOpen(state);
    if (onOpenChange) {
      onOpenChange(state);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        toggleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Memoize filtered players & slice top 35 for 0ms rendering latency
  const filteredPlayers = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();
    return players.filter((p) => {
      const matchesPosition = positionFilter ? p.position_name === positionFilter : true;
      const matchesSearch =
        !query ||
        p.web_name.toLowerCase().includes(query) ||
        p.team_name.toLowerCase().includes(query) ||
        p.position_name.toLowerCase().includes(query) ||
        (p.first_name && p.first_name.toLowerCase().includes(query)) ||
        (p.second_name && p.second_name.toLowerCase().includes(query));

      return matchesPosition && matchesSearch;
    });
  }, [players, deferredSearch, positionFilter]);

  // Limit DOM nodes to top 35 matching items for instant rendering
  const displayedPlayers = useMemo(() => {
    return filteredPlayers.slice(0, 35);
  }, [filteredPlayers]);

  return (
    <div className={`relative w-full ${isOpen ? 'z-[900]' : 'z-20'}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => toggleOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 hover:border-indigo-400/60 rounded-xl p-3 flex items-center justify-between text-start transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400/40 min-h-[58px]"
      >
        {loading ? (
          <div className="flex items-center gap-2.5 py-1 text-indigo-300 font-mono text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
            <span>Loading player database...</span>
          </div>
        ) : selectedPlayer ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <PlayerAvatar player={selectedPlayer} size="sm" />
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">
                  {selectedPlayer.web_name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  {selectedPlayer.position_name}
                </span>
              </div>
              <span className="text-xs text-gray-400 block truncate">
                {selectedPlayer.team_name} • £{selectedPlayer.price}M • {selectedPlayer.total_points} pts
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400 font-mono">Select a player...</span>
        )}

        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[900] start-0 end-0 mt-2 bg-[#0d121f] border border-indigo-500/40 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Header */}
          <div className="p-3 border-b border-white/10 space-y-2 bg-[#090d16]">
            <div className="relative">
              <Search className="w-4 h-4 absolute start-3 top-3 text-indigo-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl ps-9 pe-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 focus:bg-black/40 font-mono transition-all text-start"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute end-2.5 top-2.5 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Position Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {['', 'GKP', 'DEF', 'MID', 'FWD'].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPositionFilter(pos)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    positionFilter === pos
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {pos || 'ALL'}
                </button>
              ))}
            </div>
          </div>

          {/* Player Options List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-xs text-indigo-300 font-mono flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Loading player database...</span>
              </div>
            ) : displayedPlayers.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 font-mono">
                No players found matching "{search}"
              </div>
            ) : (
              <>
                {displayedPlayers.map((player) => {
                  const isSelected = player.id === selectedId;
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        onSelect(player.id);
                        toggleOpen(false);
                        setSearch('');
                      }}
                      className={`w-full p-2.5 flex items-center justify-between text-start transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/20 text-white'
                          : 'hover:bg-white/10 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <PlayerAvatar player={player} size="sm" />
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              {player.web_name}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1 py-0.5 rounded">
                              {player.position_name}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 block truncate">
                            {player.team_name} • £{player.price}M • {player.total_points} pts
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-400 shrink-0 ms-2" />
                      )}
                    </button>
                  );
                })}

                {filteredPlayers.length > 35 && (
                  <div className="p-2 text-center text-[11px] text-gray-400 font-mono bg-white/5">
                    Showing top 35 of {filteredPlayers.length} matches. Type more to refine search...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
