/**
 * Silent tech keyword spelling normalizer for BUYGEN Electronics.
 * Silently detects and corrects misspelled electronics terms (e.g., "phene" -> "phone")
 * without displaying verbose warning messages to the user.
 */

const COMMON_TECH_TYPO_MAP: Record<string, string> = {
  // Phones & Mobiles
  phene: 'phone',
  phenes: 'phones',
  fone: 'phone',
  fones: 'phones',
  phon: 'phone',
  phne: 'phone',
  phonne: 'phone',
  smartfone: 'smartphone',
  smartfones: 'smartphones',
  smartphon: 'smartphone',
  moble: 'mobile',
  moblie: 'mobile',
  cellfone: 'cellphone',
  celphone: 'cellphone',
  iphn: 'iphone',
  iphne: 'iphone',
  ifone: 'iphone',
  iphon: 'iphone',
  glaxy: 'galaxy',
  galxy: 'galaxy',

  // Laptops & Computers
  lapotp: 'laptop',
  lapotps: 'laptops',
  loptop: 'laptop',
  loptops: 'laptops',
  labtop: 'laptop',
  leptop: 'laptop',
  leptops: 'laptops',
  computr: 'computer',
  computor: 'computer',
  makbook: 'macbook',
  mcbook: 'macbook',
  macbok: 'macbook',
  macbbook: 'macbook',
  notebuk: 'notebook',
  thinkpd: 'thinkpad',

  // Headphones & Audio
  headfone: 'headphone',
  headfones: 'headphones',
  hedphone: 'headphone',
  hedphones: 'headphones',
  hedfone: 'headphone',
  earfone: 'earphone',
  earfones: 'earphones',
  erbuds: 'earbuds',
  earbds: 'earbuds',
  earbud: 'earbuds',
  earpod: 'earbuds',
  earpds: 'earbuds',
  airpod: 'airpods',
  airpds: 'airpods',
  airpodes: 'airpods',
  noice: 'noise',
  cancell: 'cancel',
  cancelling: 'cancelling',

  // Displays & Monitors
  moniter: 'monitor',
  moniters: 'monitors',
  monitr: 'monitor',
  disply: 'display',
  scren: 'screen',
  scrn: 'screen',
  oledd: 'oled',
  amoledd: 'amoled',

  // Keyboards & Peripherals
  keybaord: 'keyboard',
  keybaords: 'keyboards',
  keybord: 'keyboard',
  kyboard: 'keyboard',
  mechancial: 'mechanical',
  mechanicl: 'mechanical',
  mose: 'mouse',
  mous: 'mouse',
  trackpd: 'trackpad',

  // Audio / Speakers
  speeker: 'speaker',
  speekers: 'speakers',
  speker: 'speaker',
  soundbr: 'soundbar',
  sondbar: 'soundbar',
  subwofer: 'subwoofer',

  // Smartwatches
  wtach: 'watch',
  wtachs: 'watches',
  watsh: 'watch',
  smartwtach: 'smartwatch',
  wacth: 'watch',
  samrtwatch: 'smartwatch',
  fitnes: 'fitness',

  // Cameras
  camra: 'camera',
  camras: 'cameras',
  camer: 'camera',
  cemera: 'camera',
  vlogg: 'vlog',
  gimbl: 'gimbal',

  // Chargers & Accessories
  chargr: 'charger',
  chargers: 'chargers',
  chager: 'charger',
  cabl: 'cable',
  powrbank: 'power bank',
  powerbnk: 'power bank',
  adptr: 'adapter',
  adaptr: 'adapter',

  // Brands
  aple: 'apple',
  appel: 'apple',
  apll: 'apple',
  snoy: 'sony',
  soony: 'sony',
  samusng: 'samsung',
  samsng: 'samsung',
  smsung: 'samsung',
  logiteck: 'logitech',
  logiteh: 'logitech',
  oneplos: 'oneplus',
  onepluss: 'oneplus',
  bosee: 'bose',
  snheiser: 'sennheiser',
  senheiser: 'sennheiser',
  ankr: 'anker'
};

const CANONICAL_WORDS = [
  'phone', 'phones', 'smartphone', 'smartphones', 'iphone', 'galaxy',
  'laptop', 'laptops', 'macbook', 'computer', 'ultrabook',
  'headphone', 'headphones', 'earbuds', 'earphones', 'airpods',
  'monitor', 'monitors', 'display', 'screen',
  'keyboard', 'keyboards', 'mouse', 'mechanical',
  'speaker', 'speakers', 'soundbar', 'subwoofer',
  'smartwatch', 'watch', 'watches',
  'camera', 'cameras', 'action', 'gimbal',
  'charger', 'cable', 'powerbank', 'adapter',
  'apple', 'samsung', 'sony', 'logitech', 'dell', 'asus', 'lenovo', 'anker', 'bose',
  'wireless', 'bluetooth', 'noise', 'cancelling', 'gaming', 'fast', 'oled'
];

/**
 * Standard Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Silently corrects a single token if it matches a typo or is close in edit distance
 */
export function correctTechWord(rawWord: string): string {
  const clean = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean || clean.length < 3) return rawWord;

  // 1. Direct dictionary match
  if (COMMON_TECH_TYPO_MAP[clean]) {
    return COMMON_TECH_TYPO_MAP[clean];
  }

  // 2. Already canonical
  if (CANONICAL_WORDS.includes(clean)) {
    return clean;
  }

  // 3. Fuzzy Levenshtein match (distance <= 2 for words with length >= 4)
  if (clean.length >= 4) {
    let bestMatch: string | null = null;
    let minDistance = 3; // only accept distance 1 or 2

    for (const target of CANONICAL_WORDS) {
      // optimization: don't compute if length delta is > 2
      if (Math.abs(target.length - clean.length) > 2) continue;

      const dist = levenshteinDistance(clean, target);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = target;
      }
    }

    if (bestMatch && minDistance <= (clean.length > 5 ? 2 : 1)) {
      return bestMatch;
    }
  }

  return rawWord;
}

/**
 * Normalizes full search query string silently correcting all detected typos.
 * Example: "phene with good camra under 70k" -> "phone with good camera under 70k"
 */
export function normalizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';

  return query
    .split(/\s+/)
    .map(word => correctTechWord(word))
    .join(' ')
    .trim();
}

/**
 * Returns expanded search variations including the original query and the silently normalized query.
 */
export function getExpandedSearchTokens(query: string): string[] {
  if (!query) return [];
  const normalized = normalizeSearchQuery(query);
  const rawClean = query.toLowerCase().trim();
  const set = new Set<string>();

  if (rawClean) set.add(rawClean);
  if (normalized && normalized.toLowerCase() !== rawClean) {
    set.add(normalized.toLowerCase());
  }

  // Also include individual corrected words
  normalized.split(/\s+/).forEach(w => {
    if (w.length >= 3) set.add(w.toLowerCase());
  });

  return Array.from(set);
}
