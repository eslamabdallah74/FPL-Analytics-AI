import React from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  Crown, 
  Sparkles, 
  GitCompare, 
  Compass,
  Zap,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentGameweek?: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, currentGameweek = 1 }) => {
  const { language, toggleLanguage, t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
    { id: 'generator', label: t('team_builder'), icon: Sparkles },
    { id: 'myteam', label: t('my_team'), icon: ShieldCheck },
    { id: 'players', label: t('players'), icon: Users },
    { id: 'fixtures', label: t('fixtures'), icon: Calendar },
    { id: 'transfers', label: t('transfers'), icon: TrendingUp },
    { id: 'captains', label: t('captains'), icon: Crown },
    { id: 'differentials', label: t('differentials'), icon: Sparkles },
    { id: 'compare', label: t('compare'), icon: GitCompare },
    { id: 'roadmap', label: t('strategy'), icon: Compass, isSpecial: true },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070a12]/90 border-b border-white/10 px-4 lg:px-8 py-2.5 shadow-2xl shadow-black/60 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-[#11998e] to-[#38ef7d] text-[#04120a] font-extrabold shadow-lg shadow-[#38ef7d]/25 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-extrabold text-white tracking-tight block leading-none">
              FPL <span className="text-[#38ef7d]">Analytics</span>
            </span>
            <span className="text-[9px] font-mono text-gray-400 block tracking-wider uppercase mt-0.5">
              {t('ai_engine')}
            </span>
          </div>
        </div>

        {/* Center Nav Capsule - Super Sleek & Compact */}
        <div className="flex-1 max-w-4xl overflow-x-auto no-scrollbar py-0.5 px-1">
          <nav className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-full w-max mx-auto shadow-inner shadow-black/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30 ring-1 ring-purple-400'
                        : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    <span className="px-1 py-0.2 text-[9px] font-mono font-extrabold bg-purple-400/30 text-purple-200 rounded uppercase tracking-wider">
                      AI
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.2 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] font-bold shadow-md shadow-[#38ef7d]/25 scale-[1.02]'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Language Toggle & Live GW Status Badge */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold transition-all border border-white/15 cursor-pointer"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-[#38ef7d]" />
            <span>{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {currentGameweek && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-[#38ef7d]/30 text-[#38ef7d] text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-sm shadow-[#38ef7d]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38ef7d] animate-pulse"></span>
              <span className="whitespace-nowrap">GW {currentGameweek}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


