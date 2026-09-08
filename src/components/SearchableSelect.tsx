import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check, Loader2 } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  loading?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Search options...',
  className = '',
  searchable = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter((o) => {
    if (!searchable) return true;
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      o.label.toLowerCase().includes(query) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(query)) ||
      o.value.toLowerCase().includes(query)
    );
  });

  return (
    <div className={`relative ${isOpen ? 'z-[9999]' : 'z-20'} ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 hover:border-[#38ef7d]/50 rounded-xl px-3 py-2 flex items-center justify-between text-left transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#38ef7d]"
      >
        {loading ? (
          <div className="flex items-center gap-2 text-gray-300 text-xs font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38ef7d]" />
            <span>Loading...</span>
          </div>
        ) : (
          <span className="text-xs font-mono font-semibold text-white truncate">
            {selectedOption ? selectedOption.label : 'Select...'}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ml-2 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#38ef7d]' : ''}`} />
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="absolute z-[9999] right-0 min-w-[220px] w-full mt-1 bg-[#0d121f] border border-[#38ef7d]/30 rounded-xl shadow-2xl shadow-black/90 overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {searchable && (
            <div className="p-2 border-b border-white/10 relative bg-[#090d16]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#38ef7d] font-mono"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-56 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400 font-mono flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#38ef7d]" />
                <span>Loading options...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400 font-mono">No matching options</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#38ef7d]/20 text-[#38ef7d] font-bold' : 'hover:bg-white/10 text-gray-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="text-[10px] text-gray-400 font-sans mt-0.5">{opt.sublabel}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#38ef7d] shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
