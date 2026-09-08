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
  Globe,
  Flame
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
    { id: 'differentials', label: t('differentials'), icon: Flame },
    { id: 'compare', label: t('compare'), icon: GitCompare },
    { id: 'roadmap', label: t('strategy'), icon: Compass, isSpecial: true },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070a12]/95 border-b border-white/10 shadow-2xl shadow-black/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* ROW 1: Brand Logo, Status Badge, Quick Actions & Language Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-white/5 gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#11998e] to-[#38ef7d] text-[#04120a] font-extrabold shadow-lg shadow-[#38ef7d]/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white tracking-tight leading-none">
                  FPL <span className="text-[#38ef7d]">Analytics</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#38ef7d]/15 text-[#38ef7d] text-[9px] font-bold uppercase tracking-wider border border-[#38ef7d]/30 hidden sm:inline-block">
                  AI Hub
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block tracking-wide mt-0.5">
                {t('brand_subtitle')}
              </span>
            </div>
          </div>

          {/* Right: Gameweek Status, Language Toggle & Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Gameweek Badge */}
            {currentGameweek && (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-[#38ef7d]/30 text-[#38ef7d] text-xs font-bold px-3 py-1 rounded-full shadow-sm shadow-[#38ef7d]/10">
                <span className="w-2 h-2 rounded-full bg-[#38ef7d] animate-pulse"></span>
                <span>{t('gw_live', { gw: currentGameweek })}</span>
              </div>
            )}

            {/* Quick Generator Button */}
            <button
              onClick={() => setActiveTab('generator')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-[#38ef7d] text-xs font-bold border border-[#38ef7d]/30 hover:bg-[#38ef7d]/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('team_builder')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 cursor-pointer"
              title="Switch Language / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#38ef7d]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Primary Navigation Tabs Capsule Bar */}
        <div className="py-2.5 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1.5 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30 ring-1 ring-purple-400'
                        : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-purple-400/30 text-purple-200 rounded uppercase tracking-wider">
                      AI
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] font-extrabold shadow-md shadow-[#38ef7d]/25 scale-[1.02]'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
};
