import { fetchDashboard } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const DEVICE_REQ_KEY = 'fpl_ai_device_request_count';

export function getCustomApiKey(): string | null {
  const customKey = localStorage.getItem('fpl_ai_custom_key');
  return customKey && customKey.trim().length > 0 ? customKey.trim() : null;
}

export function getEffectiveApiKey(): string {
  const customKey = getCustomApiKey();
  if (customKey) {
    return customKey;
  }
  return (import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();
}

export function setCustomApiKey(key: string) {
  if (key && key.trim()) {
    localStorage.setItem('fpl_ai_custom_key', key.trim());
  } else {
    localStorage.removeItem('fpl_ai_custom_key');
  }
}

export function getDeviceRequestCount(): number {
  const val = localStorage.getItem(DEVICE_REQ_KEY);
  return val ? parseInt(val, 10) || 0 : 0;
}

export function incrementDeviceRequestCount(): void {
  const current = getDeviceRequestCount();
  localStorage.setItem(DEVICE_REQ_KEY, (current + 1).toString());
}

export function isDeviceLimitReached(): boolean {
  // If user provided custom key, allow unlimited requests
  if (getCustomApiKey()) {
    return false;
  }
  // Enforce 1 request per device
  return getDeviceRequestCount() >= 1;
}

export async function streamFPLChatMessage(
  messages: ChatMessage[],
  userLanguage: 'ar' | 'en' = 'ar',
  onChunk: (chunk: string) => void
): Promise<string> {
  // Check device request limit (1 request per device)
  if (isDeviceLimitReached()) {
    const limitMessage = userLanguage === 'ar'
      ? `### ⚠️ **انتهى رصيد التجربة المجانية لهذا الجهاز**\n\nللمتابعة واستخدام خدمتنا، يلزم الدفع والاشتراك. يرجى التواصل مع رئيس فريق الفانتسي **Hussien Elshazly Eida (+20 12 80842869)**.\n\n*يمكنك أيضاً إضافة مفتاح API الخاص بك في الإعدادات للاستخدام المباشر.*`
      : `### ⚠️ **Free Device Trial Limit Reached**\n\nYou will have to pay money so you can proceed using our service. Please contact our Head of FPL team **Hussien Elshazly Eida (+20 12 80842869)**.\n\n*You can also provide your custom API key in settings.*`;

    // Stream out the payment message as an interactive AI response
    onChunk(limitMessage);
    return limitMessage;
  }

  const apiKey = getEffectiveApiKey();

  if (!apiKey) {
    throw new Error(
      userLanguage === 'ar' 
        ? 'مفتاح الذكاء الاصطناعي غير متوفر. يرجى توفيره في إعدادات الصفحة.' 
        : 'AI API key is missing. Please set it in settings.'
    );
  }

  // Fetch real-time FPL database context
  let contextSummary = '';
  try {
    const dashboard = await fetchDashboard();
    const topForm = dashboard.top_form.slice(0, 5).map(p => `${p.web_name} (${p.team_name}, Form: ${p.form_score}, xP: ${p.expected_points || 0}, £${p.price}M)`).join(', ');
    const topTransfers = dashboard.transfer_targets.slice(0, 5).map(t => `${t.player.web_name} (${t.player.team_name}, Score: ${t.transfer_score}, £${t.player.price}M)`).join(', ');
    const topCaptains = dashboard.captain_candidates.slice(0, 5).map(c => `${c.player.web_name} (${c.player.team_name}, CaptainScore: ${c.captain_score}, FDR: ${c.player.upcoming_fdr})`).join(', ');
    const diffs = dashboard.differentials.slice(0, 5).map(d => `${d.web_name} (${d.team_name}, Ownership: ${d.selected_by_percent}%, Score: ${d.transfer_score})`).join(', ');

    contextSummary = `
[REAL-TIME LIVE FPL DATA METRICS - GAMEWEEK ${dashboard.current_gameweek}]:
- Top Form Players: ${topForm}
- Recommended Transfer Targets: ${topTransfers}
- Best Captain Options: ${topCaptains}
- Differentials (<10% ownership): ${diffs}
- Easy Fixture Schedules: ${dashboard.easy_fixture_runs.map(r => r.team_name).join(', ')}
`;
  } catch (err) {
    console.warn('Could not fetch real-time FPL context for AI prompt:', err);
  }

  const systemPrompt = `
You are "FPL AI Copilot" (مساعد الفانتسي الذكي), an elite, world-class Fantasy Premier League (FPL) strategist, analyst, and assistant.
Your sole purpose is to help FPL managers make optimal decisions (who to buy, sell, captain, bench, wildcard, chip strategy) based on mathematical expected points (xP), fixture difficulty runs (FDR), form, rotation risk, set-piece roles, and value score.

Language Rule:
- Always respond in the SAME language as the user's latest query (Arabic if Arabic text, English if English text).
- If the user asks in Arabic, write in clear, natural Arabic with clean markdown formatting. Use natural FPL terminology (الديدلاين, الكابتن, الشارة, الفروقات, الدكة, البلانك, الدبل, الواي كارد, الفري هت).

Formatting & Structure:
- Structure your response nicely with clean Markdown headers (###), bold text (**player name**), bullet points (-), and clean spacing.
- Include prices (£M), expected points (xP), and FDR where relevant.
- Do NOT output raw unformatted JSON or broken strings.

${contextSummary}
`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content
    }))
  ];

  const model = import.meta.env.VITE_AI_MODEL || 'deepseek/deepseek-chat';

  // Increment request count on device before sending
  if (!getCustomApiKey()) {
    incrementDeviceRequestCount();
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'FPL Analytics AI Platform'
    },
    body: JSON.stringify({
      model: model,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1200,
      stream: true
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg = errorData?.error?.message || `API error (${res.status})`;
    throw new Error(msg);
  }

  if (!res.body) {
    throw new Error('ReadableStream not supported in this environment.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep partial line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue; // Skip SSE comments
      if (trimmed === 'data: [DONE]') continue;

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          const chunkText = parsed.choices?.[0]?.delta?.content || '';
          if (chunkText) {
            fullContent += chunkText;
            onChunk(fullContent);
          }
        } catch (e) {
          // Ignore JSON parse errors for incomplete streaming lines
        }
      }
    }
  }

  return fullContent;
}
