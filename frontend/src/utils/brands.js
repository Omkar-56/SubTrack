const BRAND_DOMAINS = {
  // Streaming & Media
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  youtube: 'youtube.com',
  'youtube premium': 'youtube.com',
  'youtube music': 'youtube.com',
  hulu: 'hulu.com',
  disney: 'disneyplus.com',
  'disney+': 'disneyplus.com',
  'disney plus': 'disneyplus.com',
  hbo: 'max.com',
  'hbo max': 'max.com',
  max: 'max.com',
  'apple tv': 'apple.com',
  'apple music': 'apple.com',
  'apple podcast': 'apple.com',
  'amazon prime': 'amazon.com',
  'prime video': 'amazon.com',
  prime: 'amazon.com',
  twitch: 'twitch.tv',
  crunchyroll: 'crunchyroll.com',
  paramount: 'paramountplus.com',
  'paramount+': 'paramountplus.com',
  peacock: 'peacocktv.com',
  tidal: 'tidal.com',
  deezer: 'deezer.com',
  soundcloud: 'soundcloud.com',
  audible: 'audible.com',

  // Dev & Cloud & AI
  github: 'github.com',
  'github copilot': 'github.com',
  copilot: 'github.com',
  gitlab: 'gitlab.com',
  openai: 'openai.com',
  chatgpt: 'openai.com',
  'chatgpt plus': 'openai.com',
  anthropic: 'anthropic.com',
  claude: 'anthropic.com',
  midjourney: 'midjourney.com',
  cursor: 'cursor.com',
  aws: 'amazon.com',
  'amazon web services': 'amazon.com',
  vercel: 'vercel.com',
  netlify: 'netlify.com',
  supabase: 'supabase.com',
  render: 'render.com',
  heroku: 'heroku.com',
  digitalocean: 'digitalocean.com',
  linode: 'linode.com',
  cloudflare: 'cloudflare.com',
  docker: 'docker.com',
  railway: 'railway.app',
  fly: 'fly.io',
  'fly.io': 'fly.io',
  sentry: 'sentry.io',
  postman: 'postman.com',
  datadog: 'datadoghq.com',

  // Software & Productivity
  notion: 'notion.so',
  figma: 'figma.com',
  slack: 'slack.com',
  discord: 'discord.com',
  'discord nitro': 'discord.com',
  adobe: 'adobe.com',
  'creative cloud': 'adobe.com',
  photoshop: 'adobe.com',
  canva: 'canva.com',
  dropbox: 'dropbox.com',
  'google drive': 'google.com',
  'google one': 'google.com',
  'google workspace': 'google.com',
  'gsuite': 'google.com',
  google: 'google.com',
  icloud: 'apple.com',
  'icloud+': 'apple.com',
  'apple one': 'apple.com',
  apple: 'apple.com',
  microsoft: 'microsoft.com',
  'microsoft 365': 'microsoft.com',
  'office 365': 'microsoft.com',
  m365: 'microsoft.com',
  linear: 'linear.app',
  jira: 'atlassian.com',
  atlassian: 'atlassian.com',
  trello: 'trello.com',
  asana: 'asana.com',
  monday: 'monday.com',
  clickup: 'clickup.com',
  todoist: 'todoist.com',
  ticktick: 'ticktick.com',
  evernote: 'evernote.com',
  obsidian: 'obsidian.md',
  loom: 'loom.com',
  zoom: 'zoom.us',
  grammarly: 'grammarly.com',
  setapp: 'setapp.com',
  cleanmymac: 'macpaw.com',
  raycast: 'raycast.com',
  superhuman: 'superhuman.com',

  // Security & Privacy
  '1password': '1password.com',
  onepassword: '1password.com',
  bitwarden: 'bitwarden.com',
  dashlane: 'dashlane.com',
  nordvpn: 'nordvpn.com',
  expressvpn: 'expressvpn.com',
  surfshark: 'surfshark.com',
  proton: 'proton.me',
  protonmail: 'proton.me',
  'proton vpn': 'proton.me',
  mullvad: 'mullvad.net',

  // Gaming
  steam: 'steampowered.com',
  'xbox game pass': 'xbox.com',
  xbox: 'xbox.com',
  'playstation plus': 'playstation.com',
  'ps plus': 'playstation.com',
  playstation: 'playstation.com',
  nintendo: 'nintendo.com',
  'nintendo switch online': 'nintendo.com',
  ea: 'ea.com',
  'ea play': 'ea.com',
  ubisoft: 'ubisoft.com',
  roblox: 'roblox.com',

  // News, Reading & Learning
  medium: 'medium.com',
  substack: 'substack.com',
  'new york times': 'nytimes.com',
  nyt: 'nytimes.com',
  'wall street journal': 'wsj.com',
  wsj: 'wsj.com',
  theverge: 'theverge.com',
  'the economist': 'economist.com',
  economist: 'economist.com',
  bloomberg: 'bloomberg.com',
  duolingo: 'duolingo.com',
  coursera: 'coursera.org',
  udemy: 'udemy.com',
  skillshare: 'skillshare.com',
  brilliant: 'brilliant.org',
  masterclass: 'masterclass.com',
  linkedin: 'linkedin.com',
  'linkedin premium': 'linkedin.com',

  // Fitness & Lifestyle
  strava: 'strava.com',
  fitbit: 'fitbit.com',
  whoop: 'whoop.com',
  peloton: 'onepeloton.com',
  myfitnesspal: 'myfitnesspal.com',
  headspace: 'headspace.com',
  calm: 'calm.com',
  'planet fitness': 'planetfitness.com',
  equinox: 'equinox.com',
  classpass: 'classpass.com',

  // Food & Transport
  uber: 'uber.com',
  'uber one': 'uber.com',
  doordash: 'doordash.com',
  dashpass: 'doordash.com',
  instacart: 'instacart.com',
  grubhub: 'grubhub.com',
};

export const CATEGORY_CHART_COLORS = {
  streaming: '#6366F1', // Indigo
  software: '#1F6F54',  // Subtrack Ledger Forest Green
  fitness: '#F59E0B',   // Amber
  news: '#0EA5E9',      // Sky blue
  cloud: '#06B6D4',     // Cyan
  gaming: '#8B5CF6',    // Purple
  other: '#78716C',     // Warm stone
};

export function getCategoryChartColor(category = 'other') {
  return CATEGORY_CHART_COLORS[category.toLowerCase()] || '#78716C';
}

const CATEGORY_COLORS = {
  streaming: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  software: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  fitness: { bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  news: { bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  cloud: { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  gaming: { bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  other: { bg: 'bg-stone-100 text-stone-700 border-stone-200' },
};

export function getDomainForName(name = '') {
  if (!name) return null;
  const clean = name.trim().toLowerCase();

  // 1. Direct domain match like "github.com" or "app.slack.com"
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(clean)) {
    return clean;
  }

  // 2. Exact match in catalog
  if (BRAND_DOMAINS[clean]) {
    return BRAND_DOMAINS[clean];
  }

  // 3. Substring match (e.g. "Netflix Standard" -> "netflix")
  for (const [key, domain] of Object.entries(BRAND_DOMAINS)) {
    if (clean.includes(key)) {
      return domain;
    }
  }

  return null;
}

export function getBrandLogoUrl(name = '') {
  const domain = getDomainForName(name);
  if (!domain) return null;
  // High quality Google S2 favicon service (fast, free, CDN-backed)
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

export function getInitials(name = '') {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getCategoryStyle(category = 'other') {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
}
