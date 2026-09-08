export const translations = {
  en: {
    // Header & Nav
    dashboard: "Dashboard",
    team_builder: "Team Builder",
    my_team: "My Team",
    players: "Players",
    fixtures: "Fixtures",
    transfers: "Transfers",
    captains: "Captains",
    differentials: "Differentials",
    compare: "Compare",
    strategy: "Strategy",
    ai_engine: "AI Engine",
    gw_live: "GW {{gw}} LIVE",

    // General & Common
    loading: "Loading statistics and metrics...",
    loading_player_details: "Loading detailed player statistics and history...",
    view_details: "View Details",
    close: "Close",
    search: "Search",
    price: "Price",
    total_pts: "Total Pts",
    form: "Form",
    value: "Value",
    xp: "Expected Pts (xP)",

    // Decision Verdicts
    decision_verdict: "Decision Verdict",
    strong_buy: "Strong Buy 🟢",
    hold_watch: "Hold / Watch 🟡",
    avoid_sell: "Avoid / Sell 🔴",

    // My Team
    squad_analyzer: "Personalized Squad Analyzer",
    sync_team_btn: "Sync Team & AI Advice",
    syncing: "Syncing Team...",
    armband_advice: "Armband Advice",
    bench_optimizer: "Bench Optimizer",
    transfer_target: "Transfer Target",
    pitch_setup: "Tactical Starting 11 Pitch Setup",
    bench_substitutes: "Substitutes Bench",

    // Team Builder
    build_best_team: "Build My Best Team",
    generate_optimal: "Generate Optimal Squad",
    optimizing: "Optimizing Squad...",
    squad_budget: "Squad Budget",
    formation: "Preferred Formation",
    why_selected: "Why Each Player Was Selected"
  },

  ar: {
    // Header & Nav
    dashboard: "لوحة التحكم",
    team_builder: "بناء الفريق",
    my_team: "فريقي",
    players: "اللاعبون",
    fixtures: "المباريات",
    transfers: "الانتقالات",
    captains: "الكابتن",
    differentials: "الفروقات",
    compare: "مقارنة",
    strategy: "الاستراتيجية",
    ai_engine: "محرك الذكاء الاصطناعي",
    gw_live: "الجولة {{gw}} مباشرة",

    // General & Common
    loading: "جاري تحميل الإحصائيات والإشارات...",
    loading_player_details: "جاري تحميل إحصائيات اللاعب التفصيلية والسجل...",
    view_details: "عرض التفاصيل",
    close: "إغلاق",
    search: "بحث",
    price: "السعر",
    total_pts: "إجمالي النقاط",
    form: "المستوى",
    value: "القيمة",
    xp: "النقاط المتوقعة",

    // Decision Verdicts
    decision_verdict: "قرار القرار",
    strong_buy: "شراء مؤكد 🟢",
    hold_watch: "مراقبة / الاحتفاظ 🟡",
    avoid_sell: "تجنب / بيع 🔴",

    // My Team
    squad_analyzer: "محلل التشكيلة الشخصية",
    sync_team_btn: "مزامنة الفريق ونصائح الذكاء الاصطناعي",
    syncing: "جاري مزامنة الفريق...",
    armband_advice: "نصيحة الكابتن",
    bench_optimizer: "تحسين دكة البدلاء",
    transfer_target: "هدف الانتقال",
    pitch_setup: "التشكيلة الأساسية التكتيكية (الملعب)",
    bench_substitutes: "دكة البدلاء",

    // Team Builder
    build_best_team: "بناء أفضل تشكيلة",
    generate_optimal: "توليد التشكيلة المثالية",
    optimizing: "جاري تحسين التشكيلة...",
    squad_budget: "ميزانية الفريق",
    formation: "الخطة المفضلة",
    why_selected: "سبب اختيار كل لاعب"
  }
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof translations.en;
