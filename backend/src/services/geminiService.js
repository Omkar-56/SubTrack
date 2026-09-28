import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const VALID_CATEGORIES = [
  'entertainment',
  'software / AI',
  'gaming',
  'news and media',
  'education',
  'health & fitness',
  'other',
];

export function normalizeCategory(val = '') {
  if (!val) return 'other';
  const v = String(val).toLowerCase().trim();

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

  // Software / AI (including generative AI, LLMs, developer tooling, cloud)
  if (
    v === 'ai' ||
    v === 'artificial intelligence' ||
    v.includes('generative ai') ||
    v.includes('llm') ||
    v.includes('software') ||
    v.includes('cloud') ||
    v.includes('infra') ||
    v.includes('utility') ||
    v.includes('utilities') ||
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

ALLOWED CATEGORIES (You must ONLY classify each subscription into one of these exact 7 values):
1. "entertainment" (e.g. Netflix, Spotify, Disney+, YouTube Premium, Hulu, Apple TV, HBO)
2. "software / AI" (e.g. ChatGPT, Claude, Midjourney, OpenAI, Gemini, Perplexity, GitHub, AWS, Google Workspace, Adobe, Notion, Figma, Slack, Dropbox, hosting)
3. "gaming" (e.g. Xbox Game Pass, PlayStation Plus, Nintendo Switch Online, Discord Nitro, Steam)
4. "news and media" (e.g. New York Times, Wall Street Journal, Substack, Medium, Bloomberg)
5. "education" (e.g. Coursera, Udemy, Duolingo, MasterClass, Skillshare, Codecademy, edX)
6. "health & fitness" (e.g. Gym memberships, Strava, Peloton, Whoop, Apple Fitness, Calm, Headspace)
7. "other" (any subscription not fitting the above)

Instructions:
1. Identify all recurring subscriptions/services mentioned in the text or document.
2. For each detected subscription, extract or infer:
   - "name": Service/Company name (e.g. "Netflix", "ChatGPT Plus")
   - "category": MUST be one of the 7 allowed values: "entertainment", "software / AI", "gaming", "news and media", "education", "health & fitness", "other".
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
    "amount": 15.49,
    "currency": "USD",
    "billingCycle": "monthly",
    "nextRenewalDate": "2026-10-25",
    "isFreeTrial": false,
    "trialEndDate": null,
    "cancellationDeadline": null,
    "postTrialAmount": null,
    "notes": "Parsed from subscription receipt"
  }
]`;

    let userContentParts = [];

    if (fileBase64 && mimeType) {
      userContentParts.push({
        inlineData: {
          mimeType,
          data: fileBase64,
        },
      });
      userContentParts.push({
        text: `Please parse this receipt/document image or file into subscriptions JSON according to the instructions.${
          text ? `\nAdditional user notes or context: ${text}` : ''
        }`,
      });
    } else if (text) {
      userContentParts.push({
        text: `Please parse the following receipt/invoice text snippet into subscriptions JSON:\n\n${text}`,
      });
    } else {
      throw new ApiError(400, 'Please provide receipt text or upload a document/image file.');
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: userContentParts,
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    };

    // Models with automatic fallback if primary model experiences spikes in demand
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errBody = await response.text();
          let parsedMsg = errBody;
          try {
            const jsonErr = JSON.parse(errBody);
            parsedMsg = jsonErr.error?.message || errBody;
          } catch (_) {}

          // If high demand (503) or rate limit (429), try next model fallback
          if (response.status === 503 || response.status === 429) {
            lastError = new ApiError(response.status, `Gemini (${model}): ${parsedMsg}`);
            continue;
          }

          throw new ApiError(response.status, `Gemini API error: ${parsedMsg}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text;

        if (!rawText) {
          return [];
        }

        let cleaned = rawText.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
        }

        let parsedItems = JSON.parse(cleaned);
        if (!Array.isArray(parsedItems)) {
          if (typeof parsedItems === 'object' && parsedItems !== null) {
            parsedItems = [parsedItems];
          } else {
            return [];
          }
        }

        return parsedItems.map((item) => ({
          name: item.name ? String(item.name).trim() : 'Unnamed Subscription',
          category: normalizeCategory(item.category),
          amount: Math.max(0, Number(item.amount) || 0),
          currency: (item.currency || defaultCurrency || 'USD').toUpperCase().slice(0, 3),
          billingCycle: ['weekly', 'monthly', 'quarterly', 'yearly'].includes(item.billingCycle)
            ? item.billingCycle
            : 'monthly',
          nextRenewalDate: item.nextRenewalDate ? String(item.nextRenewalDate).slice(0, 10) : todayStr,
          isFreeTrial: Boolean(item.isFreeTrial),
          trialEndDate: item.trialEndDate ? String(item.trialEndDate).slice(0, 10) : null,
          cancellationDeadline: item.cancellationDeadline ? String(item.cancellationDeadline).slice(0, 10) : null,
          postTrialAmount: item.postTrialAmount !== null && item.postTrialAmount !== undefined ? Number(item.postTrialAmount) : null,
          notes: item.notes ? String(item.notes) : 'Imported via Gemini parser',
        }));
      } catch (err) {
        if (err instanceof ApiError && (err.statusCode === 503 || err.statusCode === 429)) {
          lastError = err;
          continue;
        }
        if (err instanceof SyntaxError) {
          throw new ApiError(500, 'Gemini returned an invalid JSON response structure. Please try again.');
        }
        throw err;
      }
    }

    throw lastError || new ApiError(503, 'Gemini is currently unavailable. Please try again in a few moments.');
  },
};
