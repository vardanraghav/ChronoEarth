import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface AIResponse {
  answer: string;
  provider: string;
}

// Retryable HTTP status codes
const RETRYABLE_CODES = new Set([429, 500, 502, 503, 504]);

// ─── PROVIDER 1: Gemini 2.5 Flash ───────────────────────────────────────────
export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'gemini-2.5-flash'
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelInstance = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt
  });

  console.log(`[AI Router] Calling Gemini (${model})...`);
  const result = await modelInstance.generateContent(userPrompt);
  const answer = result.response.text();
  console.log(`[AI Router] Gemini (${model}) success`);
  return { answer, provider: `gemini:${model}` };
}

// ─── PROVIDER 2: Groq (Llama 3.3 70B) ──────────────────────────────────────
export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  console.log('[AI Router] Calling Groq (llama-3.3-70b-versatile)...');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const status = response.status;
    const body = await response.text().catch(() => 'unknown');
    const err = new Error(`Groq API returned ${status}: ${body}`);
    (err as any).status = status;
    throw err;
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || '';
  if (!answer) throw new Error('Groq returned empty response');

  console.log('[AI Router] Groq success');
  return { answer, provider: 'groq:llama-3.3-70b-versatile' };
}

// ─── Helper: Check if error is retryable ────────────────────────────────────
function isRetryable(error: any): boolean {
  // Check for HTTP status codes in the error
  const status = error?.status || error?.httpStatus;
  if (status && RETRYABLE_CODES.has(status)) return true;

  // Check error message for status code patterns
  const msg = error?.message || '';
  for (const code of RETRYABLE_CODES) {
    if (msg.includes(`${code}`)) return true;
  }

  // Gemini SDK wraps errors differently — check for common patterns
  if (msg.includes('Service Unavailable')) return true;
  if (msg.includes('Too Many Requests')) return true;
  if (msg.includes('RESOURCE_EXHAUSTED')) return true;
  if (msg.includes('UNAVAILABLE')) return true;
  if (msg.includes('overloaded')) return true;
  if (msg.includes('high demand')) return true;

  return false;
}

// ─── MAIN ROUTER ────────────────────────────────────────────────────────────
// Priority chain:
//   1. Gemini 2.5 Flash
//   2. Groq Llama 3.3 70B
//   3. Gemini 2.0 Flash (fallback)
//   4. Cached answer (last resort)

export async function generateResponse(
  systemPrompt: string,
  userPrompt: string,
  cachedAnswer?: string
): Promise<AIResponse> {
  const providers = [
    {
      name: 'Gemini 2.5 Flash',
      fn: () => generateWithGemini(systemPrompt, userPrompt, 'gemini-2.5-flash')
    },
    {
      name: 'Groq Llama 3.3 70B',
      fn: () => generateWithGroq(systemPrompt, userPrompt)
    },
    {
      name: 'Gemini 2.0 Flash',
      fn: () => generateWithGemini(systemPrompt, userPrompt, 'gemini-2.0-flash')
    }
  ];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    try {
      const result = await provider.fn();
      return result;
    } catch (error: any) {
      console.error(`[AI Router] ${provider.name} failed:`, error?.message || error);

      if (isRetryable(error) && i < providers.length - 1) {
        console.log(`[AI Router] Retryable error — switching to ${providers[i + 1].name}`);
        continue;
      }

      // Non-retryable error on a provider, or last provider failed
      if (i === providers.length - 1) {
        // All providers exhausted
        if (cachedAnswer) {
          console.log('[AI Router] All providers failed — returning cached answer');
          return { answer: cachedAnswer, provider: 'cache' };
        }
        throw error;
      }

      // Non-retryable error but more providers available — still try next
      console.log(`[AI Router] Non-retryable error — still trying ${providers[i + 1].name}`);
      continue;
    }
  }

  // Should never reach here, but safety fallback
  if (cachedAnswer) {
    return { answer: cachedAnswer, provider: 'cache' };
  }
  throw new Error('All AI providers failed and no cached answer available');
}
