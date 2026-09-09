import React, { useState, useRef, useEffect } from 'react';
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
  Flame,
  Bot,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentGameweek?: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, currentGameweek = 1 }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState<'squad' | 'analytics' | 'tools' | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setOpenDropdown(null);
  };

  const squadItems = [
    { id: 'dashboard', label: t('dashboard'), desc: t('dashboard_overview'), icon: LayoutDashboard },
    { id: 'myteam', label: t('my_team'), desc: t('squad_analyzer'), icon: ShieldCheck },
    { id: 'generator', label: t('team_builder'), desc: t('build_best_team'), icon: Sparkles },
  ];

  const analyticsItems = [
    { id: 'players', label: t('players'), desc: t('player_matrix'), icon: Users },
    { id: 'transfers', label: t('transfers'), desc: t('transfer_targets_engine'), icon: TrendingUp },
    { id: 'captains', label: t('captains'), desc: t('captain_rankings'), icon: Crown },
    { id: 'differentials', label: t('differentials'), desc: t('under_owned_differentials'), icon: Flame },
  ];

  const toolsItems = [
    { id: 'fixtures', label: t('fixtures'), desc: t('fixture_planner'), icon: Calendar },
    { id: 'compare', label: t('compare'), desc: t('h2h_comparator'), icon: GitCompare },
    { id: 'roadmap', label: t('strategy'), desc: t('roadmap_title'), icon: Compass },
  ];

  const allMobileNavItems = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
    { id: 'generator', label: t('team_builder'), icon: Sparkles },
    { id: 'myteam', label: t('my_team'), icon: ShieldCheck },
    { id: 'aichat', label: t('ai_chat'), icon: Bot, isSpecial: true },
    { id: 'players', label: t('players'), icon: Users },
    { id: 'fixtures', label: t('fixtures'), icon: Calendar },
    { id: 'transfers', label: t('transfers'), icon: TrendingUp },
    { id: 'captains', label: t('captains'), icon: Crown },
    { id: 'differentials', label: t('differentials'), icon: Flame },
    { id: 'compare', label: t('compare'), icon: GitCompare },
    { id: 'roadmap', label: t('strategy'), icon: Compass },
  ];

  const isSquadActive = squadItems.some(i => i.id === activeTab);
  const isAnalyticsActive = analyticsItems.some(i => i.id === activeTab);
  const isToolsActive = toolsItems.some(i => i.id === activeTab);
  const isAiActive = activeTab === 'aichat';

  return (
    <header className="sticky top-0 z-[1000] backdrop-blur-2xl bg-[#070a12]/95 border-b border-white/10 shadow-2xl shadow-black/80 transition-all" ref={headerRef}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* ROW 1: Brand Logo, Status Badge, Quick Actions & Language Toggle */}
        <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-white/5 gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div 
            onClick={() => handleTabSelect('dashboard')} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#11998e] to-[#38ef7d] text-[#04120a] font-extrabold shadow-lg shadow-[#38ef7d]/25 group-hover:scale-105 transition-transform shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none truncate">
                  FPL <span className="text-[#38ef7d]">Analytics</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#38ef7d]/15 text-[#38ef7d] text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border border-[#38ef7d]/30 hidden xs:inline-block">
                  AI
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-400 block tracking-wide mt-0.5 truncate hidden xs:block">
                {t('brand_subtitle')}
              </span>
            </div>
          </div>

          {/* Right: Gameweek Status, Language Toggle & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Gameweek Badge */}
            {currentGameweek && (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-emerald-500/10 border border-[#38ef7d]/30 text-[#38ef7d] text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-sm shadow-[#38ef7d]/10">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#38ef7d] animate-pulse"></span>
                <span>{t('gw_live', { gw: currentGameweek })}</span>
              </div>
            )}

            {/* AI Assistant Quick Launcher */}
            <button
              onClick={() => handleTabSelect('aichat')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 text-xs font-bold border border-purple-500/40 hover:bg-purple-500/30 transition-all cursor-pointer shadow-md shadow-purple-500/10"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{t('ai_chat')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-xs font-bold transition-all border border-white/15 cursor-pointer"
              title="Switch Language / تغيير اللغة"
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38ef7d]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* DESKTOP CATEGORIZED DROPDOWN NAVIGATION (Compact & Organized) */}
        <div className="hidden lg:flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {/* Category 1: Squad & Overview */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'squad' ? null : 'squad')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSquadActive || openDropdown === 'squad'
                    ? 'bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] shadow-md shadow-[#38ef7d]/20'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('nav_group_squad')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'squad' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'squad' && (
                <div className="absolute start-0 mt-2 w-64 bg-[#0c1611] border border-[#38ef7d]/30 rounded-2xl shadow-2xl p-2 z-[1010] space-y-1 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                  {squadItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelect(item.id)}
                        className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-start transition-colors cursor-pointer ${
                          isActive ? 'bg-[#38ef7d]/20 text-[#38ef7d]' : 'hover:bg-white/10 text-gray-200'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-white/5 shrink-0">
                          <Icon className="w-4 h-4 text-[#38ef7d]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-gray-400 truncate">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category 2: Analytics & Market */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'analytics' ? null : 'analytics')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isAnalyticsActive || openDropdown === 'analytics'
                    ? 'bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] shadow-md shadow-[#38ef7d]/20'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{t('nav_group_analytics')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'analytics' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'analytics' && (
                <div className="absolute start-0 mt-2 w-64 bg-[#0c1611] border border-[#38ef7d]/30 rounded-2xl shadow-2xl p-2 z-[1010] space-y-1 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                  {analyticsItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelect(item.id)}
                        className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-start transition-colors cursor-pointer ${
                          isActive ? 'bg-[#38ef7d]/20 text-[#38ef7d]' : 'hover:bg-white/10 text-gray-200'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-white/5 shrink-0">
                          <Icon className="w-4 h-4 text-[#38ef7d]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-gray-400 truncate">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category 3: Planner & Tools */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'tools' ? null : 'tools')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isToolsActive || openDropdown === 'tools'
                    ? 'bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] shadow-md shadow-[#38ef7d]/20'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t('nav_group_tools')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'tools' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'tools' && (
                <div className="absolute start-0 mt-2 w-64 bg-[#0c1611] border border-[#38ef7d]/30 rounded-2xl shadow-2xl p-2 z-[1010] space-y-1 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                  {toolsItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelect(item.id)}
                        className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-start transition-colors cursor-pointer ${
                          isActive ? 'bg-[#38ef7d]/20 text-[#38ef7d]' : 'hover:bg-white/10 text-gray-200'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-white/5 shrink-0">
                          <Icon className="w-4 h-4 text-[#38ef7d]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-gray-400 truncate">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category 4: AI Copilot Assistant Tab */}
            <button
              onClick={() => handleTabSelect('aichat')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                isAiActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30 ring-1 ring-purple-400'
                  : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>{t('nav_group_ai')}</span>
              <span className="px-1.5 py-0.2 text-[8px] font-extrabold bg-purple-400/30 text-purple-200 rounded uppercase tracking-wider">
                EXPERIMENTAL
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE & TABLET CAPSULE SCROLL STRIP (< lg screens) */}
        <div className="lg:hidden py-2 px-1 overflow-x-auto no-scrollbar custom-scrollbar">
          <nav className="flex items-center gap-1.5 min-w-max pb-0.5">
            {allMobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap relative ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/40 ring-1 ring-purple-400'
                        : 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-purple-300 animate-pulse" />
                    <span>{item.label}</span>
                    <span className="px-1.5 py-0.2 text-[8px] font-black bg-purple-400/30 text-purple-200 rounded uppercase tracking-wider">
                      AI
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-[#04120a] font-black shadow-lg shadow-[#38ef7d]/30 scale-[1.02]'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 font-bold'
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


