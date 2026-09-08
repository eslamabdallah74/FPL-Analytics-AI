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
import { LanguageProvider } from './context/LanguageContext';
import { fetchDashboard } from './services/api';
import type { DashboardResponse, Player } from './types';

import { LayoutDashboard, Shirt, Users, ArrowRightLeft, Bot } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-[#07110d] text-[#f5f7f6] pitch-bg-overlay pb-16 lg:pb-0">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentGameweek={dashboardData?.current_gameweek} 
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
          {loading ? (
            <Loader message="Loading Gameweek statistics and derived metrics..." />
          ) : error ? (
            <div className="glass-card p-8 text-center max-w-lg mx-auto border-rose-500/30">
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

        {/* Floating Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1914]/95 backdrop-blur-md border-t border-[#1a2a22] px-2 py-1.5 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              activeTab === 'dashboard' ? 'text-[#39ff88]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              activeTab === 'generator' ? 'text-[#39ff88]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shirt className="w-5 h-5" />
            <span>Pitch</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              activeTab === 'players' ? 'text-[#39ff88]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Players</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              activeTab === 'transfers' ? 'text-[#39ff88]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span>Transfers</span>
          </button>

          <button
            onClick={() => setActiveTab('myteam')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              activeTab === 'myteam' ? 'text-[#39ff88]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span>My Team</span>
          </button>
        </div>

        <Footer onNavigate={setActiveTab} />
      </div>
    </LanguageProvider>
  );
}

export default App;

