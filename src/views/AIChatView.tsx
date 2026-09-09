import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Key, 
  AlertCircle, 
  User, 
  X,
  CheckCircle2,
  Lock,
  RefreshCw,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  streamFPLChatMessage, 
  type ChatMessage, 
  getEffectiveApiKey, 
  setCustomApiKey,
  isDeviceLimitReached,
  getDeviceRequestCount,
  getCustomApiKey
} from '../services/aiChatService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import type { Player } from '../types';

interface AIChatViewProps {
  onSelectPlayer?: (player: Player) => void;
}

export const AIChatView: React.FC<AIChatViewProps> = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const defaultWelcomeMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    content: isAr
      ? `مرحباً بك في **مساعد الفانتسي الذكي (FPL AI Copilot)**! 🤖\n\nأنا هنا لمساعدتك في اتخاذ أفضل القرارات التكتيكية في الفانتسي بناءً على النقاط المتوقعة (xP)، جدول المباريات، الفورمة، ومخاطر التدوير.\n\n### **كيف يمكنني مساعدتك اليوم؟**\n- 🏆 من أفضل اختيار للكابتن للجولة القادمة؟\n- 🔄 اقترح لي تغييرات هجومية/دفاعية ممتازة\n- 💎 ما هي أبرز الجواهر الخفية بملكية منخفضة؟`
      : `Welcome to **FPL AI Copilot**! 🤖\n\nI am your dedicated algorithmic assistant for Fantasy Premier League. Ask me anything about transfer targets, captaincy rankings, differential picks, or chip strategy based on live xP metrics.\n\n### **How can I help your squad today?**\n- 🏆 Who is the best captain pick for next GW?\n- 🔄 Recommend top transfer targets\n- 💎 Differential gems under 5% ownership`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('fpl_ai_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback to default welcome message
      }
    }
    return [defaultWelcomeMessage];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getEffectiveApiKey());
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const limitReached = isDeviceLimitReached();
  const requestCount = getDeviceRequestCount();
  const hasCustomKey = !!getCustomApiKey();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Persist chat history
    if (messages.length > 0) {
      localStorage.setItem('fpl_ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const quickPrompts = isAr
    ? [
        "👑 من أفضل اختيار للكابتن في الجولة القادمة؟",
        "🔄 اقترح لي أفضل تغيير بيع وشراء في خط الوسط",
        "💎 اعطني 3 جواهر تفاضلية بملكية أقل من 5%",
        "🛡️ كيف أتعامل مع مخاطر التدوير في التشكيلة؟"
      ]
    : [
        "👑 Who is the best captain pick for next GW?",
        "🔄 Recommend top midfield transfer IN & OUT",
        "💎 Give me 3 differential gems under 5% ownership",
        "🛡️ How should I plan my chips for upcoming GWs?"
      ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, initialAssistantMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      await streamFPLChatMessage(newMessages, language, (accumulatedChunk: string) => {
        setMessages(prev => 
          prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedChunk } : m)
        );
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate AI response. Please check your API key.');
      setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([defaultWelcomeMessage]);
    localStorage.removeItem('fpl_ai_chat_history');
    setError(null);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiKey(apiKeyInput);
    setKeySavedMessage(true);
    setTimeout(() => {
      setKeySavedMessage(false);
      setShowSettingsModal(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* FUTURISTIC AI HEADER BANNER */}
      <div className="relative rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-purple-950/90 via-[#070a12] to-emerald-950/90 border-2 border-purple-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-start">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-current text-purple-400 animate-pulse" />
                <span>EXPERIMENTAL AI</span>
              </span>

              {/* Device Quota Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
                hasCustomKey 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : limitReached 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {hasCustomKey 
                  ? (isAr ? '🔥 وصول غير محدود (مفتاح خاص)' : '🔥 Unlimited (Custom Key)') 
                  : limitReached 
                    ? (isAr ? '⚠️ تم تجاوز حد الجهاز (1/1 طلب)' : '⚠️ Device Limit Reached (1/1 Req)') 
                    : (isAr ? `📊 حد الجهاز (${requestCount}/1 طلب مجاني)` : `📊 Device Quota (${requestCount}/1 Free Req)`)}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 shrink-0" />
              <span>{t('ai_chat_title')}</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
              {t('ai_chat_desc')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5 cursor-pointer"
              title="API Key Settings"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">{t('api_key_settings')}</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
              title={t('clear_chat')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('clear_chat')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHAT CONTAINER - FULL WIDTH & RESPONSIVE */}
      <div className="glass-card overflow-hidden flex flex-col h-[580px] xs:h-[630px] sm:h-[720px] border-purple-500/20 shadow-2xl relative rounded-3xl">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-[#050911]/80">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isLimitMessage = !isUser && (msg.content.includes('Hussien Elshazly Eida') || msg.content.includes('حسين الشاذلي'));

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 w-full ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-lg text-white">
                    <Bot className="w-5 h-5 text-purple-200" />
                  </div>
                )}

                {/* Message Content Bubble - Wide layout */}
                <div className={`space-y-2 ${isUser ? 'max-w-[85%] sm:max-w-[75%]' : 'max-w-[92%] sm:max-w-[88%]'}`}>
                  <div className={`p-4 sm:p-5 rounded-3xl leading-relaxed shadow-xl border ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-te-none border-emerald-400/30 text-start'
                      : isLimitMessage
                        ? 'bg-gradient-to-br from-[#1b1208] via-[#0d1624] to-[#160b1c] border-2 border-amber-500/40 text-gray-100 rounded-ts-none shadow-amber-500/10'
                        : 'bg-[#0b1322] border-white/10 text-gray-100 rounded-ts-none shadow-purple-950/20'
                  }`}>
                    {isUser ? (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <>
                        <MarkdownRenderer content={msg.content} />

                        {/* If this is the payment contact message, render a direct WhatsApp contact widget */}
                        {isLimitMessage && (
                          <div className="mt-4 pt-3 border-t border-amber-500/30 space-y-3">
                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
                              <div className="space-y-1">
                                <div className="text-sm font-black text-amber-300">Hussien Elshazly Eida</div>
                                <div className="text-xs text-gray-300 font-medium">{isAr ? 'رئيس فريق الفانتسي (Head of FPL Team)' : 'Head of FPL Team'}</div>
                                <div className="pt-0.5">
                                  <span dir="ltr" className="inline-block text-xs sm:text-sm font-extrabold text-[#38ef7d] font-mono tracking-wider bg-black/40 px-2.5 py-1 rounded-lg border border-[#38ef7d]/30">
                                    +20 12 80842869
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                                <a
                                  href="https://wa.me/201280842869"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 shrink-0"
                                >
                                  <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                                  <span>{isAr ? 'تواصل عبر الواتساب' : 'WhatsApp'}</span>
                                </a>

                                <a
                                  href="tel:+201280842869"
                                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20 shrink-0"
                                >
                                  <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span>{isAr ? 'اتصال مباشر' : 'Call Direct'}</span>
                                </a>
                              </div>
                            </div>

                            <button
                              onClick={() => setShowSettingsModal(true)}
                              className="w-full py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold rounded-xl text-xs border border-amber-500/40 transition-all cursor-pointer flex items-center justify-center gap-2 leading-tight"
                            >
                              <Key className="w-4 h-4 shrink-0" />
                              <span>{isAr ? 'إدخال مفتاح API الخاص بك في الإعدادات' : 'Enter Custom API Key in Settings'}</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <span className={`text-[10px] text-gray-500 block px-2 font-mono ${isUser ? 'text-end' : 'text-start'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0 shadow-lg text-white">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking Loading State */}
          {loading && (
            <div className="flex gap-3 max-w-[90%] justify-start items-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg text-white animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-[#0b1322] border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center gap-2.5 shadow-lg">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                <span>{t('ai_thinking')}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5 my-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-3 bg-[#070b16] border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-purple-500/20 hover:border-purple-500/40 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-5 bg-[#080d1b] border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ask_ai_placeholder')}
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 focus:border-purple-400 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:bg-black/50 transition-all text-start"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold rounded-2xl text-xs sm:text-sm hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-purple-500/25"
            >
              <span>{isAr ? 'إرسال' : 'Send'}</span>
              <Send className="w-4 h-4 rtl:-scale-x-1" />
            </button>
          </form>
        </div>
      </div>

      {/* API KEY SETTINGS MODAL */}
      {showSettingsModal && (
        <div 
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-card max-w-md w-full p-6 text-white relative space-y-4 border-amber-500/30 rounded-3xl"
          >
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-400 hover:text-white p-1.5 rounded-xl bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-start">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{isAr ? 'إعدادات المفتاح الذكي (AI Key)' : 'AI Key Settings'}</h3>
                <p className="text-xs text-gray-400">{isAr ? 'أدخل مفتاحك الخاص لاستخدام غير محدود بدون قيود' : 'Enter custom key for unlimited requests per device'}</p>
              </div>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4 pt-2 text-start">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-mono flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>API Key (sk-...):</span>
                </label>
                <input 
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-[#070a12] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[10px] text-gray-400">
                  {isAr 
                    ? 'عند استخدام مفتاحك الخاص، يتم حفظه وتشفيره محلياً وتفعيل الاستخدام غير المحدود.' 
                    : 'Providing a custom key unlocks unlimited requests on this device.'}
                </p>
              </div>

              {keySavedMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'تم حفظ المفتاح بنجاح! تم إلغاء قيود الجهاز.' : 'API key updated! Device limit bypassed.'}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isAr ? 'حفظ المفتاح' : 'Save Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
