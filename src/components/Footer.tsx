import React from 'react';
import { Zap, ShieldCheck, Database } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-[#070a12] pt-12 pb-8 px-4 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#11998e] to-[#38ef7d] flex items-center justify-center text-[#04120a] font-extrabold shadow-md shadow-[#38ef7d]/20">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                FPL <span className="text-[#38ef7d]">Analytics</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('footer_desc')}
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-[#38ef7d] uppercase tracking-wider mb-3">
              {t('platform_features')}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  {t('dashboard_overview')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('players')} className="hover:text-white transition-colors cursor-pointer">
                  {t('player_matrix')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('fixtures')} className="hover:text-white transition-colors cursor-pointer">
                  {t('fixture_planner')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('transfers')} className="hover:text-white transition-colors cursor-pointer">
                  {t('transfer_targets_engine')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('captains')} className="hover:text-white transition-colors cursor-pointer">
                  {t('captain_rankings')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('differentials')} className="hover:text-white transition-colors cursor-pointer">
                  {t('under_owned_differentials')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('compare')} className="hover:text-white transition-colors cursor-pointer">
                  {t('h2h_comparator')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Analytics Engine */}
          <div>
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
              {t('analytical_metrics')}
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('val_score_label')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('form_score_label')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('consistency_rotation')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('composite_transfer_rating')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('composite_captain_rating')}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Data Source Note */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              {t('data_integrity')}
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-400 space-y-2">
              <div className="flex items-center gap-2 text-gray-300 font-semibold">
                <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{t('official_fpl_data')}</span>
              </div>
              <p className="text-[11px] leading-normal">
                {t('data_integrity_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>{t('all_rights_reserved')}</p>
          <p>{t('built_with')}</p>
        </div>
      </div>
    </footer>
  );
};
