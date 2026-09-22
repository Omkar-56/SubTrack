/**
 * Catalog of direct cancellation URLs, step-by-step navigation instructions,
 * and support links for popular subscription services.
 */
export const CANCELLATION_GUIDES = {
  // Streaming & Media
  netflix: {
    name: 'Netflix',
    directUrl: 'https://www.netflix.com/youraccount',
    steps: [
      'Log into your Netflix Account page.',
      'Under the "Membership & Billing" section, click "Cancel Membership".',
      'Click "Finish Cancellation" to confirm. You will retain access until the end of your billing cycle.',
    ],
    difficulty: 'Easy (1-click)',
  },
  spotify: {
    name: 'Spotify',
    directUrl: 'https://www.spotify.com/account/subscription/',
    steps: [
      'Log into your Spotify account overview page.',
      'Under "Your plan", click "Change plan".',
      'Scroll down to "Cancel Spotify" and click "Cancel Premium". Follow the confirmation prompts.',
    ],
    difficulty: 'Easy (2 mins)',
  },
  youtube: {
    name: 'YouTube Premium',
    directUrl: 'https://www.youtube.com/paid_memberships',
    steps: [
      'Go to YouTube Paid Memberships.',
      'Click "Manage Membership" next to your Premium membership.',
      'Click "Deactivate" and select "Continue to Cancel".',
    ],
    difficulty: 'Easy (1-click)',
  },
  disney: {
    name: 'Disney+',
    directUrl: 'https://www.disneyplus.com/account',
    steps: [
      'Go to your Disney+ Account page.',
      'Under "Subscription", select your Disney+ subscription.',
      'Click "Cancel Subscription" and choose your cancellation reason to confirm.',
    ],
    difficulty: 'Easy (2 mins)',
  },
  'amazon prime': {
    name: 'Amazon Prime',
    directUrl: 'https://www.amazon.com/mc/manage',
    steps: [
      'Go to your Amazon Prime Membership management page.',
      'Click "Manage Membership" at the top right.',
      'Click "End Membership" and confirm through the 2-3 retention offer screens.',
    ],
    difficulty: 'Medium (Multi-step)',
  },
  prime: {
    name: 'Amazon Prime',
    directUrl: 'https://www.amazon.com/mc/manage',
    steps: [
      'Go to your Amazon Prime Membership management page.',
      'Click "Manage Membership" at the top right.',
      'Click "End Membership" and proceed through the confirmation steps.',
    ],
    difficulty: 'Medium (Multi-step)',
  },
  hbo: {
    name: 'Max (HBO)',
    directUrl: 'https://auth.max.com/subscription',
    steps: [
      'Go to your Max Account Settings.',
      'Select "Subscription" -> "Manage Subscription".',
      'Click "Cancel Subscription" and confirm.',
    ],
    difficulty: 'Easy (2 mins)',
  },
  max: {
    name: 'Max (HBO)',
    directUrl: 'https://auth.max.com/subscription',
    steps: [
      'Go to your Max Account Settings.',
      'Select "Subscription" -> "Manage Subscription".',
      'Click "Cancel Subscription" and confirm.',
    ],
    difficulty: 'Easy (2 mins)',
  },
  hulu: {
    name: 'Hulu',
    directUrl: 'https://secure.hulu.com/account',
    steps: [
      'Log into your Hulu Account page.',
      'Under "Your Subscription", click "Cancel" next to Cancel your subscription.',
      'Select "Continue to Cancel" (skip any pause offers) and finalize.',
    ],
    difficulty: 'Medium (Multi-step)',
  },
  apple: {
    name: 'Apple / iCloud / Apple One',
    directUrl: 'https://support.apple.com/HT202039',
    steps: [
      'On iPhone/Mac: Open "Settings" -> Tap your Name/Apple ID at the top.',
      'Tap "Subscriptions".',
      'Select the subscription you want to end and tap "Cancel Subscription".',
    ],
    difficulty: 'Easy via iOS/Mac Settings',
  },
  icloud: {
    name: 'Apple iCloud+',
    directUrl: 'https://support.apple.com/HT207594',
    steps: [
      'Open "Settings" on your iPhone/Mac -> Tap your Name at top.',
      'Tap "iCloud" -> "Manage Account Storage" (or "Manage Plan").',
      'Tap "Change Storage Plan" -> "Downgrade Options" -> Choose "Free (5GB)".',
    ],
    difficulty: 'Easy via iOS Settings',
  },

  // AI & Productivity
  chatgpt: {
    name: 'ChatGPT Plus (OpenAI)',
    directUrl: 'https://chatgpt.com/#settings/Subscription',
    steps: [
      'Open ChatGPT and click your profile icon in the bottom left corner.',
      'Click "Settings" -> "My Plan" (or "Subscription").',
      'Click "Manage my subscription" (opens Stripe portal) and select "Cancel plan".',
    ],
    difficulty: 'Easy (1-click Stripe portal)',
  },
  openai: {
    name: 'ChatGPT / OpenAI',
    directUrl: 'https://chatgpt.com/#settings/Subscription',
    steps: [
      'Open ChatGPT and click your profile in the bottom left.',
      'Select "Settings" -> "Subscription" -> "Manage my subscription".',
      'Click "Cancel plan" on the billing page.',
    ],
    difficulty: 'Easy (1-click Stripe portal)',
  },
  claude: {
    name: 'Claude Pro (Anthropic)',
    directUrl: 'https://claude.ai/settings/billing',
    steps: [
      'Log into Claude.ai and click your profile initials in the bottom left.',
      'Select "Billing" (or go to claude.ai/settings/billing).',
      'Click "Cancel Subscription" and confirm.',
    ],
    difficulty: 'Easy (1-click)',
  },
  github: {
    name: 'GitHub (Copilot / Pro)',
    directUrl: 'https://github.com/settings/billing/summary',
    steps: [
      'Go to GitHub Settings -> "Billing and plans".',
      'Under "Plans and usage", click "Edit" or "Cancel" next to Copilot or Pro.',
      'Confirm cancellation down to the free tier.',
    ],
    difficulty: 'Easy (2 mins)',
  },
  cursor: {
    name: 'Cursor AI',
    directUrl: 'https://www.cursor.com/settings',
    steps: [
      'Go to cursor.com/settings and log in.',
      'Under "Billing", click "Manage Subscription" (opens Stripe portal).',
      'Click "Cancel plan" to stop recurring billing.',
    ],
    difficulty: 'Easy (1-click)',
  },
  notion: {
    name: 'Notion',
    directUrl: 'https://www.notion.so/settings',
    steps: [
      'In Notion, open "Settings & members" from the left sidebar.',
      'Click "Billing" under Workspace settings.',
      'Click "Change plan" and downgrade to the Free plan.',
    ],
    difficulty: 'Easy (2 mins)',
  },
  figma: {
    name: 'Figma',
    directUrl: 'https://www.figma.com/settings',
    steps: [
      'Open your Figma Admin Console / Settings.',
      'Go to the "Billing" tab for your team.',
      'Click "Change plan" or "Cancel subscription" and choose downgrade.',
    ],
    difficulty: 'Easy (2 mins)',
  },
  slack: {
    name: 'Slack',
    directUrl: 'https://slack.com/billing',
    steps: [
      'Go to your Slack Workspace Settings & Administration -> "Billing".',
      'Click "Overview" -> "Cancel subscription".',
      'Choose whether to cancel immediately or at end of term.',
    ],
    difficulty: 'Medium (Admin only)',
  },
  discord: {
    name: 'Discord Nitro',
    directUrl: 'https://discord.com/channels/@me',
    steps: [
      'Open Discord User Settings (gear icon in bottom left).',
      'Under "Billing Settings", click "Subscriptions".',
      'Click "Cancel" next to your Nitro subscription and confirm.',
    ],
    difficulty: 'Easy (1-click)',
  },
  adobe: {
    name: 'Adobe Creative Cloud',
    directUrl: 'https://account.adobe.com/plans',
    steps: [
      'Log into your Adobe Account Plans page.',
      'Select "Manage Plan" for the subscription you want to cancel.',
      'Select "Cancel your plan". Note: If within an annual contract, watch out for early termination fees.',
    ],
    difficulty: 'Hard (Watch for early termination fees)',
  },
  canva: {
    name: 'Canva Pro',
    directUrl: 'https://www.canva.com/settings/billing-and-plans',
    steps: [
      'Open Canva Account Settings -> "Billing & plans".',
      'Under "Subscriptions for your team/personal", click the three dots (...) and choose "Cancel subscription".',
      'Confirm cancellation prompts.',
    ],
    difficulty: 'Easy (2 mins)',
  },
  dropbox: {
    name: 'Dropbox',
    directUrl: 'https://www.dropbox.com/account/plan',
    steps: [
      'Log into dropbox.com/account/plan.',
      'Click "Cancel plan" at the bottom of the page.',
      'Select your reason and click "Continue cancelling".',
    ],
    difficulty: 'Medium (Multi-step)',
  },
  microsoft: {
    name: 'Microsoft 365',
    directUrl: 'https://account.microsoft.com/services',
    steps: [
      'Go to the Microsoft Services & Subscriptions page.',
      'Find your subscription and click "Manage".',
      'Click "Cancel subscription" (or "Turn off recurring billing").',
    ],
    difficulty: 'Easy (2 mins)',
  },
  google: {
    name: 'Google One / Workspace',
    directUrl: 'https://one.google.com/settings',
    steps: [
      'Go to Google One Settings.',
      'Click "Cancel membership".',
      'Confirm cancellation on the Google Play / Subscriptions screen.',
    ],
    difficulty: 'Easy (1-click)',
  },

  // Security & Privacy
  '1password': {
    name: '1Password',
    directUrl: 'https://my.1password.com/billing',
    steps: [
      'Sign in to your 1Password account on the web.',
      'Click your name in the top right -> "Billing".',
      'Click "Billing Settings" or "Cancel Subscription".',
    ],
    difficulty: 'Easy (2 mins)',
  },
  nordvpn: {
    name: 'NordVPN',
    directUrl: 'https://my.nordaccount.com/billing/my-subscriptions/',
    steps: [
      'Sign in to your Nord Account.',
      'Go to "Billing" -> "Subscriptions".',
      'Click "Manage" next to Auto-Renewal and click "Cancel auto-renewal".',
    ],
    difficulty: 'Medium (Multi-step)',
  },

  // Gaming
  xbox: {
    name: 'Xbox Game Pass',
    directUrl: 'https://account.microsoft.com/services/xboxgamepass',
    steps: [
      'Go to Microsoft Services & Subscriptions.',
      'Find Xbox Game Pass and click "Manage".',
      'Click "Cancel subscription" or turn off auto-renewal.',
    ],
    difficulty: 'Easy (1-click)',
  },
  playstation: {
    name: 'PlayStation Plus',
    directUrl: 'https://store.playstation.com/subscriptions',
    steps: [
      'Sign in to PlayStation Subscriptions Management.',
      'Select "PlayStation Plus" -> "Cancel Subscription".',
      'Confirm cancellation to prevent automatic renewal.',
    ],
    difficulty: 'Easy (1-click)',
  },
  nintendo: {
    name: 'Nintendo Switch Online',
    directUrl: 'https://ec.nintendo.com/my/membership',
    steps: [
      'Go to Nintendo Account Subscriptions settings.',
      'Select "Nintendo Switch Online".',
      'Click "Turn Off Automatic Renewal".',
    ],
    difficulty: 'Easy (1-click)',
  },
  steam: {
    name: 'Steam Recurring Subscriptions',
    directUrl: 'https://store.steampowered.com/account/subscriptions/',
    steps: [
      'Go to Steam Account Subscriptions page.',
      'Find the recurring subscription and click "Edit".',
      'Select "Cancel my subscription" and click "Apply".',
    ],
    difficulty: 'Easy (1-click)',
  },

  // News & Reading
  medium: {
    name: 'Medium',
    directUrl: 'https://medium.com/me/settings/membership',
    steps: [
      'Go to Medium Settings -> "Membership".',
      'Click "Cancel membership" and confirm.',
    ],
    difficulty: 'Easy (1-click)',
  },
  substack: {
    name: 'Substack',
    directUrl: 'https://substack.com/settings/subscriptions',
    steps: [
      'Go to your Substack Subscriptions Settings.',
      'Click the publication you want to cancel.',
      'Click "Cancel subscription" under the billing section.',
    ],
    difficulty: 'Easy (1-click)',
  },
  duolingo: {
    name: 'Duolingo Super',
    directUrl: 'https://www.duolingo.com/settings/super',
    steps: [
      'Go to Duolingo Settings -> "Super Duolingo".',
      'Click "Cancel Subscription" (or manage via Apple App Store / Google Play).',
    ],
    difficulty: 'Easy (2 mins)',
  },
};

/**
 * Resolves cancellation information, direct links, and step-by-step guides for any subscription.
 */
export function getCancellationGuide(name = '', category = 'other') {
  if (!name) return null;
  const clean = name.trim().toLowerCase();

  // 1. Exact or keyword match from curated catalog
  for (const [key, guide] of Object.entries(CANCELLATION_GUIDES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return {
        ...guide,
        isCustom: false,
      };
    }
  }

  // 2. Generic Intelligent Fallback
  // Formulates smart search/direct links based on clean name
  const query = encodeURIComponent(`how to cancel ${name} subscription`);
  const googleSearchUrl = `https://www.google.com/search?q=${query}`;

  return {
    name: name,
    directUrl: googleSearchUrl,
    isCustom: true,
    steps: [
      `Sign into your ${name} account online or open the app settings.`,
      `Look for "Account", "Billing", or "Manage Subscription".`,
      `Select "Cancel Subscription" or disable "Auto-Renewal" before your next cycle.`,
      `Check your email for a cancellation confirmation receipt.`,
    ],
    difficulty: 'Standard account flow',
  };
}
