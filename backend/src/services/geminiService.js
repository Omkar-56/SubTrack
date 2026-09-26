import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const VALID_CATEGORIES = [
  'entertainment',
  'software / AI',
  'AI',
  'gaming',
  'news and media',
  'education',
  'health & fitness',
  'other',
];

export function normalizeCategory(val = '') {
  if (!val) return 'other';
  const v = String(val).toLowerCase().trim();

  // AI-specific (ChatGPT, Claude, Midjourney, OpenAI, Gemini, Perplexity)
  if (v === 'ai' || v === 'artificial intelligence' || v.includes('generative ai') || v.includes('llm')) {
    return 'AI';
  }

  // Gaming
  if (
    v.includes('game') ||
    v.includes('gaming') ||
    v.includes('playstation') ||
    v.includes('xbox') ||
    v.includes('nintendo') ||
    v.includes('steam')
  ) {
    return 'gaming';
  }

  // Software / AI or developer tooling
  if (
    v.includes('software') ||
    v.includes('cloud') ||
    v.includes('infra') ||
    v.includes('utility') ||
    v.includes('saas') ||
    v.includes('hosting') ||
    v.includes('dev')
  ) {
    return 'software / AI';
  }

  // Entertainment / streaming
  if (
    v.includes('entertain') ||
    v.includes('stream') ||
    v.includes('music') ||
    v.includes('video') ||
    v.includes('movie') ||
    v.includes('podcast') ||
    v.includes('tv')
  ) {
    return 'entertainment';
  }

  // News and media
  if (
    v.includes('news') ||
    v.includes('media') ||
    v.includes('press') ||
    v.includes('journal') ||
    v.includes('magazine')
  ) {
    return 'news and media';
  }

  // Education / learning
  if (
    v.includes('educat') ||
    v.includes('learn') ||
    v.includes('course') ||
    v.includes('study') ||
    v.includes('school') ||
    v.includes('academy')
  ) {
    return 'education';
  }

  // Health & fitness
  if (
    v.includes('fit') ||
    v.includes('health') ||
    v.includes('gym') ||
    v.includes('sport') ||
    v.includes('workout') ||
    v.includes('wellness')
  ) {
    return 'health & fitness';
  }

  return 'other';
}

export const geminiService = {
  async parseReceiptOrDoc({ text, fileBase64, mimeType, defaultCurrency = 'USD' }) {
    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      throw new ApiError(
        500,
        'Gemini API key is not configured. Please add GEMINI_API_KEY in your backend/.env file.'
      );
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const systemPrompt = `You are an expert subscription and receipt parser for "SubTrack".
Your task is to analyze the provided document, invoice, receipt image, screenshot, or text snippet and extract one or more recurring subscriptions or memberships.

Current Date: ${todayStr}
User Default Currency: ${defaultCurrency}

ALLOWED CATEGORIES (You must ONLY classify each subscription into one of these exact 8 values):
1. "entertainment" (e.g. Netflix, Spotify, Disney+, YouTube Premium, Hulu, Apple TV, HBO)
2. "software / AI" (e.g. GitHub, AWS, Google Workspace, Adobe, Notion, Figma, Slack, Dropbox, hosting)
3. "AI" (e.g. ChatGPT Plus, Claude Pro, Midjourney, Perplexity, OpenAI, Cursor AI, Gemini Advanced)
4. "gaming" (e.g. Xbox Game Pass, PlayStation Plus, Nintendo Switch Online, Discord Nitro, Steam)
5. "news and media" (e.g. New York Times, Wall Street Journal, Substack, Medium, Bloomberg)
6. "education" (e.g. Coursera, Udemy, Duolingo, MasterClass, Skillshare, Codecademy, edX)
7. "health & fitness" (e.g. Gym memberships, Strava, Peloton, Whoop, Apple Fitness, Calm, Headspace)
8. "other" (any subscription not fitting the above)

Instructions:
1. Identify all recurring subscriptions/services mentioned in the text or document.
2. For each detected subscription, extract or infer:
   - "name": Service/Company name (e.g. "Netflix", "ChatGPT Plus")
   - "category": MUST be one of the 8 allowed values: "entertainment", "software / AI", "AI", "gaming", "news and media", "education", "health & fitness", "other".
   - "amount": The recurring price as a positive number (float). If free trial, amount is 0 or trial charge.
   - "currency": ISO 3-letter currency (e.g. "USD", "EUR", "INR", "GBP"). Default to "${defaultCurrency}" if not explicitly stated.
   - "billingCycle": One of "weekly", "monthly", "quarterly", "yearly". Default to "monthly" if unknown.
   - "nextRenewalDate": Expected next renewal date in YYYY-MM-DD format. If exact date not found, estimate 1 billing cycle from receipt/today (${todayStr}).
   - "isFreeTrial": Boolean, true if document mentions free trial, beta, or trial period.
   - "trialEndDate": YYYY-MM-DD if isFreeTrial is true, else null.
   - "cancellationDeadline": YYYY-MM-DD (typically 1-3 days before trialEndDate or renewal), else null.
   - "postTrialAmount": Normal recurring fee charged after trial ends (number), else null.
   - "notes": Brief note from receipt (e.g. "Order #12345 parsed from invoice").

IMPORTANT: Output ONLY a valid JSON array of objects without Markdown code fences, backticks, or any other prose.
If no subscriptions can be identified from the input, return an empty JSON array: []

Example output format:
[
  {
    "name": "Netflix",
    "category": "entertainment",
    "amount": 15.99,
    "currency": "USD",
    "billingCycle": "monthly",
    "nextRenewalDate": "2026-10-25",
    "isFreeTrial": false,
    "trialEndDate": null,
    "cancellationDeadline": null,
    "postTrialAmount": null,
    "notes": "Standard plan parsed from receipt"
  }
]`;

    const parts = [];

    // If file uploaded (image / pdf)
    if (fileBase64 && mimeType) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: fileBase64,
        },
      });
    }

    // If text or caption
    if (text && text.trim()) {
      parts.push({
        text: `Here is the receipt text / document content:\n\n${text.trim()}`,
      });
    } else if (!fileBase64) {
      throw new ApiError(400, 'Please provide either document text or an uploaded file.');
    }

    parts.push({
      text: 'Please extract the subscriptions and return the JSON array now.',
    });

    // High performance Gemini models ordered with priority to high availability & low latency
    const models = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-pro-latest',
    ];

    let lastError = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts,
              },
            ],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: 'application/json',
            },
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${response.status} from Gemini API`;
          console.warn(`[Gemini Receipt Parser] Model ${model} returned error: ${errMsg}. Trying next candidate model...`);
          lastError = new Error(errMsg);
          await new Promise((resolve) => setTimeout(resolve, 250));
          continue;
        }

        const data = await response.json();
        const candidate = data?.candidates?.[0];
        const rawContent = candidate?.content?.parts?.[0]?.text;

        if (!rawContent) {
          console.warn(`[Gemini Receipt Parser] Empty content from model ${model}. Trying next candidate model...`);
          lastError = new Error(`Empty response received from ${model}`);
          continue;
        }

        // Clean out possible markdown fences if returned
        let cleaned = rawContent.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);
        const subscriptions = Array.isArray(parsed) ? parsed : [parsed];

        // Sanitize subscriptions and enforce strictly normalized categories
        return subscriptions.map((item) => {
          const category = normalizeCategory(item.category);

          return {
            name: String(item.name || 'Untitled Subscription').trim(),
            category,
            amount: Math.max(0, Number(item.amount) || 0),
            currency: String(item.currency || defaultCurrency).toUpperCase(),
            billingCycle: ['weekly', 'monthly', 'quarterly', 'yearly'].includes(
              item.billingCycle?.toLowerCase()
            )
              ? item.billingCycle.toLowerCase()
              : 'monthly',
            nextRenewalDate: item.nextRenewalDate && /^\d{4}-\d{2}-\d{2}$/.test(item.nextRenewalDate)
              ? item.nextRenewalDate
              : todayStr,
            status: 'active',
            notes: item.notes ? String(item.notes) : 'Imported via Gemini Receipt Parser',
            isFreeTrial: Boolean(item.isFreeTrial),
            trialEndDate: item.trialEndDate && /^\d{4}-\d{2}-\d{2}$/.test(item.trialEndDate)
              ? item.trialEndDate
              : null,
            cancellationDeadline:
              item.cancellationDeadline && /^\d{4}-\d{2}-\d{2}$/.test(item.cancellationDeadline)
                ? item.cancellationDeadline
                : null,
            postTrialAmount:
              item.postTrialAmount !== null && item.postTrialAmount !== undefined
                ? Math.max(0, Number(item.postTrialAmount))
                : null,
            postTrialCurrency: item.postTrialCurrency
              ? String(item.postTrialCurrency).toUpperCase()
              : String(item.currency || defaultCurrency).toUpperCase(),
          };
        });
      } catch (err) {
        console.warn(`[Gemini Receipt Parser] Exception with model ${model}:`, err.message);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 250));
        continue;
      }
    }

    throw new ApiError(502, `Failed to parse receipt with Gemini: ${lastError?.message || 'High demand across models. Please try again shortly.'}`);
  },
};
