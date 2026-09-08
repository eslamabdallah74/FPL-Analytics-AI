import React from 'react';
import { 
  Compass, 
  ShieldCheck, 
  Layers, 
  Zap, 
  CheckCircle, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RoadmapViewProps {
  onNavigate: (tab: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="glass-card p-6 border-l-4 border-l-[#38ef7d] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#38ef7d]/20 text-[#38ef7d] text-[10px] font-bold uppercase tracking-wider border border-[#38ef7d]/30">
              {isAr ? 'تقرير استراتيجية أفضل 10 آلاف مدرب' : 'Top 10k FPL Strategy Report'}
            </span>
            <span className="text-xs text-gray-400">• {t('roadmap_title')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-[#38ef7d]" />
            <span>{t('roadmap_title')}</span>
          </h1>
          <p className="text-sm text-gray-300 mt-1 max-w-2xl">
            {t('roadmap_desc')}
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border border-white/10"
        >
          <span>{isAr ? 'استكشف لوحة التحكم الحية' : 'Explore Live Dashboard'}</span>
          <ArrowRight className={`w-4 h-4 text-[#38ef7d] ${isAr ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 5 Key Strategic Recommendations Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#38ef7d]" />
          <span>{isAr ? 'أبرز ميزات المنصة والاستراتيجية' : 'Core Manager Recommendations at a Glance'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="glass-card p-5 border-t-4 border-t-emerald-400 space-y-3 hover:border-[#38ef7d] transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SQUAD HUB
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{isAr ? '1. مزامنة التشكيلة الشخصية' : '1. Personalized "My Team" Squad Sync'}</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{isAr ? 'تحميل تلقائي للتشكيلة والبنك ونقاط الجولة بدون تسجيل دخول.' : 'FPL Team ID Import: Instantly fetch starting 11, bench, £ bank balance.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{isAr ? 'عرض الملعب التكتيكي التفاعلي مع علامات الكابتن ومخاطر التدوير.' : 'Interactive Pitch View with captaincy (C) and bench order.'}</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-5 border-t-4 border-t-indigo-400 space-y-3 hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                OPTIMIZER
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{isAr ? '2. مُحسّن التشكيل الخوارزمي' : '2. Algorithmic Squad Optimizer'}</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{isAr ? 'توليد التشكيلة المثالية بناءً على أعلى النقاط المتوقعة في 5 جولات.' : 'Optimal squad generator based on xP and fixture difficulty runs.'}</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-5 border-t-4 border-t-amber-400 space-y-3 hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MATCHDAY
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{isAr ? '3. تحليل الكابتن والتوصيات' : '3. Live Captain & Decision Engine'}</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{isAr ? 'تقييم خيارات الكابتن الأكثر أماناً والأعلى سقفاً للنقاط.' : 'Real-time captain candidate rankings and rationale.'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
