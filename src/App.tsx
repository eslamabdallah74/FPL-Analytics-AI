import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Loader } from './components/Loader';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { DashboardView } from './views/DashboardView';
import { PlayersView } from './views/PlayersView';
import { FixturesView } from './views/FixturesView';
import { TransfersView } from './views/TransfersView';
import { CaptainView } from './views/CaptainView';
import { DifferentialsView } from './views/DifferentialsView';
import { CompareView } from './views/CompareView';
import { RoadmapView } from './views/RoadmapView';
import { MyTeamView } from './views/MyTeamView';
import { SquadGeneratorView } from './views/SquadGeneratorView';
import { AIChatView } from './views/AIChatView';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { fetchDashboard } from './services/api';
import type { DashboardResponse, Player } from './types';
import { Analytics } from '@vercel/analytics/react';

import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  ShieldCheck,
  Menu,
  X,
  Calendar,
  Crown,
  Flame,
  GitCompare,
  Compass,
  Sparkles,
  Globe,
  Bot
} from 'lucide-react';

function AppContent() {
  const { language, toggleLanguage, t } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboard()
      .then((data) => {
        setDashboardData(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load analytics dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'generator', label: t('team_builder'), icon: Sparkles },
    { id: 'myteam', label: t('my_team'), icon: ShieldCheck },
    { id: 'aichat', label: t('ai_chat'), icon: Bot, isSpecial: true },
    { id: 'players', label: t('players'), icon: Users },
    { id: 'fixtures', label: t('fixtures'), icon: Calendar },
    { id: 'transfers', label: t('transfers'), icon: ArrowRightLeft },
    { id: 'captains', label: t('captains'), icon: Crown },
    { id: 'differentials', label: t('differentials'), icon: Flame },
    { id: 'compare', label: t('compare'), icon: GitCompare },
    { id: 'roadmap', label: t('strategy'), icon: Compass },
  ];

  const handleMobileNav = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07110d] text-[#f5f7f6] pitch-bg-overlay pb-20 lg:pb-0">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentGameweek={dashboardData?.current_gameweek} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-8">
        {loading ? (
          <Loader message="Loading Gameweek statistics and derived metrics..." />
        ) : error ? (
          <div className="glass-card p-6 sm:p-8 text-center max-w-lg mx-auto border-rose-500/30 my-8">
            <h2 className="text-xl font-bold text-rose-400 mb-2">Connection Error</h2>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#00e676] text-[#07110d] font-bold rounded-xl text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && dashboardData && (
              <DashboardView 
                data={dashboardData} 
                onSelectPlayer={setSelectedPlayer} 
                onNavigate={setActiveTab} 
              />
            )}

            {activeTab === 'generator' && (
              <SquadGeneratorView onSelectPlayer={setSelectedPlayer} />
            )}

            {activeTab === 'myteam' && (
              <MyTeamView onSelectPlayer={setSelectedPlayer} />
            )}

            {activeTab === 'aichat' && (
              <AIChatView onSelectPlayer={setSelectedPlayer} />
            )}

            {activeTab === 'players' && (
              <PlayersView onSelectPlayer={setSelectedPlayer} />
            )}

            {activeTab === 'fixtures' && (
              <FixturesView />
            )}

            {activeTab === 'transfers' && (
              <TransfersView onSelectPlayer={setSelectedPlayer} />
            )}

            {activeTab === 'captains' && (
              <CaptainView onSelectPlayer={setSelectedPlayer} />
            )}

            {activeTab === 'differentials' && (
              <DifferentialsView onSelectPlayer={setSelectedPlayer} />
            )}

            {activeTab === 'compare' && (
              <CompareView />
            )}

            {activeTab === 'roadmap' && (
              <RoadmapView onNavigate={setActiveTab} />
            )}
          </>
        )}
      </main>

      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />

      {/* Floating Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[9000] bg-[#070a12]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleMobileNav('dashboard')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'dashboard' ? 'text-[#38ef7d] bg-[#38ef7d]/10' : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{isAr ? 'الرئيسية' : 'Home'}</span>
        </button>

        <button
          onClick={() => handleMobileNav('myteam')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'myteam' ? 'text-[#38ef7d] bg-[#38ef7d]/10' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{isAr ? 'فريقي' : 'My Team'}</span>
        </button>

        <button
          onClick={() => handleMobileNav('aichat')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'aichat' ? 'text-purple-400 bg-purple-500/20 ring-1 ring-purple-500/40' : 'text-purple-300 hover:text-white'
          }`}
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span>{isAr ? 'الذكاء' : 'AI Copilot'}</span>
        </button>

        <button
          onClick={() => handleMobileNav('transfers')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'transfers' ? 'text-[#38ef7d] bg-[#38ef7d]/10' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-5 h-5" />
          <span>{isAr ? 'الانتقالات' : 'Transfers'}</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
            mobileMenuOpen ? 'text-[#38ef7d] bg-[#38ef7d]/10' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>{isAr ? 'القائمة' : 'Menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b1410] border-t border-[#38ef7d]/30 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#38ef7d] text-[#07110d] font-black flex items-center justify-center text-xs">
                  FPL
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {isAr ? 'أدوات الفانتسي الذكية' : 'FPL Analytics Menu'}
                </h3>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNav(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition-all border text-start ${
                      isActive
                        ? item.id === 'aichat' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/10' : 'bg-[#38ef7d]/20 text-[#38ef7d] border-[#38ef7d]/40 shadow-lg shadow-[#38ef7d]/10'
                        : item.id === 'aichat' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${item.id === 'aichat' ? 'text-purple-400 animate-pulse' : isActive ? 'text-[#38ef7d]' : 'text-gray-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => { toggleLanguage(); }}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#38ef7d]" />
                <span>{language === 'en' ? 'تغيير إلى العربية 🇸🇦' : 'Switch to English 🇬🇧'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer onNavigate={setActiveTab} />
    </div>
  );
}


export function App() {
  return (
    <LanguageProvider>
      <AppContent />
      <Analytics />
    </LanguageProvider>
  );
}

export default App;


