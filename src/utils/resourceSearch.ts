// Import directory resource types and category lookup labels for smart search ranking
import { CategoryType, ResourceItem } from '../types';
import { CATEGORIES, COMMUNITY_RESOURCES } from '../data/mockData';

// Stopwords ignored when tokenizing multi-word user search queries
const SEARCH_STOPWORDS = new Set([
  'a', 'an', 'the', 'for', 'and', 'or', 'in', 'on', 'at', 'to', 'of', 'with',
  'near', 'me', 'my', 'find', 'get', 'help', 'need', 'looking', 'where', 'is', 'are'
]);

// Map everyday search words and common misspellings directly to civic category IDs
const CATEGORY_ALIASES: Array<{ category: CategoryType; terms: string[] }> = [
  {
    category: 'dining',
    terms: [
      'restaurant', 'restaurants', 'resturant', 'resturants', 'restuarant', 'restuarants',
      'dining', 'dine', 'diner', 'eat out', 'eatery', 'eateries', 'cafe', 'bistro',
      'lunch', 'dinner', 'breakfast', 'brunch', 'takeout', 'pizza', 'tacos', 'burger', 'bbq', 'steak'
    ]
  },
  {
    category: 'food',
    terms: [
      'food', 'pantry', 'pantries', 'grocery', 'groceries', 'meal', 'meals', 'hunger',
      'hungry', 'snap', 'ebt', 'food stamps', 'produce', 'formula', 'soup kitchen', 'food bank'
    ]
  },
  {
    category: 'housing',
    terms: [
      'housing', 'house', 'home', 'rent', 'rental', 'eviction', 'shelter', 'homeless',
      'utility', 'utilities', 'electric', 'electricity', 'power bill', 'water bill', 'gas bill',
      'sawnee', 'liheap', 'mortgage', 'deposit', 'heating'
    ]
  },
  {
    category: 'healthcare',
    terms: [
      'health', 'healthcare', 'clinic', 'clinics', 'doctor', 'doctors', 'medical',
      'medicine', 'medication', 'prescription', 'rx', 'pharmacy', 'dental', 'dentist',
      'teeth', 'tooth', 'toothache', 'mental health', 'therapy', 'counseling', 'therapist',
      'medicaid', 'peachcare', 'uninsured', 'vision', 'eye', 'glasses', 'checkup', 'vaccine'
    ]
  },
  {
    category: 'schools',
    terms: [
      'school', 'schools', 'education', 'college', 'university', 'elementary', 'middle',
      'high school', 'prek', 'pre-k', 'preschool', 'head start', 'ung', 'lanier tech',
      'diploma', 'tutoring', 'scholarship', 'hope grant', 'dual language'
    ]
  },
  {
    category: 'repairs',
    terms: [
      'repair', 'repairs', 'fix', 'auto', 'car', 'vehicle', 'mechanic', 'brake', 'brakes',
      'engine', 'oil change', 'tire', 'plumbing', 'plumber', 'pipe', 'leak', 'hvac',
      'air conditioning', 'ac', 'heater', 'furnace', 'roof', 'roofing', 'handyman', 'appliance',
      'electrical', 'electrician'
    ]
  },
  {
    category: 'childcare',
    terms: [
      'childcare', 'daycare', 'day care', 'baby', 'infant', 'toddler', 'babysitter',
      'afterschool', 'after school', 'caps', 'nursery', 'ymca care'
    ]
  },
  {
    category: 'sports',
    terms: [
      'sport', 'sports', 'park', 'parks', 'recreation', 'swim', 'swimming', 'pool',
      'aquatic', 'lake', 'lanier', 'hike', 'hiking', 'trail', 'trails', 'playground',
      'gym', 'fitness', 'basketball', 'soccer', 'baseball', 'tennis', 'pickleball'
    ]
  },
  {
    category: 'workforce',
    terms: [
      'job', 'jobs', 'work', 'career', 'employment', 'unemployment', 'resume', 'interview',
      'library', 'libraries', 'books', 'computer', 'wifi', 'printing', 'ged', 'esl', 'english class'
    ]
  },
  {
    category: 'seniors',
    terms: [
      'senior', 'seniors', 'elderly', 'older adult', 'aging', 'meals on wheels',
      'medicare', 'caregiver', 'retirement', 'nursing home', 'assisted living'
    ]
  },
  {
    category: 'youth-family',
    terms: [
      'youth', 'teen', 'teens', 'family', 'families', 'kids', 'children', 'diaper',
      'diapers', 'mentoring', 'boys and girls', 'parenting', 'foster', 'adoption'
    ]
  },
  {
    category: 'disability',
    terms: [
      'disability', 'disabilities', 'disabled', 'wheelchair', 'accessible', 'accessibility',
      'autism', 'special needs', 'special olympics', 'blind', 'deaf', 'hearing', 'speech therapy',
      'adaptive', 'mobility aid'
    ]
  },
  {
    category: 'animals',
    terms: [
      'animal', 'animals', 'pet', 'pets', 'dog', 'dogs', 'cat', 'cats', 'puppy', 'kitten',
      'vet', 'veterinary', 'humane society', 'parc', 'spay', 'neuter', 'rabies', 'microchip', 'pet food'
    ]
  },
  {
    category: 'veterans',
    terms: [
      'veteran', 'veterans', 'va', 'military', 'army', 'navy', 'marines', 'air force',
      'vfw', 'legion', 'ptsd', 'gi bill', 'service member'
    ]
  },
  {
    category: 'transportation',
    terms: [
      'transport', 'transportation', 'bus', 'ride', 'rides', 'transit', 'dial-a-ride',
      'shuttle', 'van', 'commute', 'mobility', 'carpool', 'wheelchair van'
    ]
  },
  {
    category: 'legal',
    terms: [
      'legal', 'lawyer', 'lawyers', 'attorney', 'court', 'courthouse', 'pro se',
      'divorce', 'custody', 'child support', 'wills', 'notary', 'mediation', 'immigration'
    ]
  },
  {
    category: 'emergency',
    terms: [
      'emergency', 'emergencies', 'disaster', 'storm', 'tornado', 'weather', 'fire',
      'smoke alarm', 'red cross', 'ema', 'gema', 'flood', '911', 'first aid',
      'crisis', '988', '211', 'suicide', 'hotline', 'helpline', 'urgent', '24/7'
    ]
  },
  {
    category: 'youth-family',
    terms: [
      'abuse', 'domestic violence', 'haven', 'safe house', 'family haven', 'assault'
    ]
  },
  {
    category: 'recovery',
    terms: [
      'recovery', 'addiction', 'sober', 'sobriety', 'rehab', 'detox', 'alcohol', 'aa',
      'na', 'narcotics', 'substance', 'opioid', 'narcan', 'naloxone', 'peer support'
    ]
  },
  {
    category: 'tax-finance',
    terms: [
      'tax', 'taxes', 'irs', 'aarp', 'vita', 'refund', 'finance', 'financial',
      'budget', 'credit', 'debt', 'bankruptcy', 'eitc', 'money'
    ]
  }
];

// Keyword synonym expansions helping everyday terms match official directory wording
const WORD_SYNONYMS: Record<string, string[]> = {
  cheap: ['affordable', 'free', 'sliding scale', 'subsidized', 'low-cost'],
  inexpensive: ['affordable', 'free', 'sliding scale', 'subsidized'],
  affordable: ['free', 'sliding scale', 'subsidized', 'cheap'],
  free: ['no cost', 'complimentary', 'sliding scale'],
  spanish: ['espanol', 'bilingual', 'hispanic'],
  espanol: ['spanish', 'bilingual'],
  kids: ['children', 'youth', 'child', 'childcare', 'pediatric'],
  kid: ['child', 'youth', 'children', 'childcare'],
  children: ['youth', 'kids', 'child', 'pediatric', 'family'],
  car: ['auto', 'automotive', 'vehicle', 'brake', 'engine'],
  mechanic: ['auto', 'repair', 'brake', 'engine', 'diagnostic'],
  tooth: ['dental', 'dentist', 'oral'],
  teeth: ['dental', 'dentist', 'oral'],
  dentist: ['dental', 'teeth', 'oral'],
  doctor: ['clinic', 'medical', 'health', 'physician'],
  medicine: ['prescription', 'pharmacy', 'medication', 'rx'],
  bill: ['utility', 'electric', 'water', 'assistance', 'liheap'],
  bills: ['utilities', 'electric', 'water', 'assistance', 'liheap'],
  eat: ['food', 'meal', 'meals', 'dining', 'restaurant', 'pantry'],
  hungry: ['food', 'pantry', 'groceries', 'meal', 'meals'],
  ride: ['transit', 'transportation', 'van', 'bus', 'shuttle'],
  bus: ['transit', 'transportation', 'dial-a-ride', 'access forsyth'],
  house: ['housing', 'rent', 'shelter', 'home'],
  apt: ['housing', 'apartment', 'rent'],
  apartment: ['housing', 'rent', 'eviction'],
  fix: ['repair', 'repairs', 'maintenance', 'service'],
  broken: ['repair', 'repairs', 'maintenance'],
  vet: ['veterinary', 'animal', 'pet', 'vaccine', 'veteran'],
  job: ['workforce', 'career', 'employment', 'resume'],
  work: ['workforce', 'job', 'career', 'employment'],
  old: ['senior', 'seniors', 'elderly', 'aging'],
  elderly: ['senior', 'seniors', 'aging', 'meals on wheels'],
  sick: ['clinic', 'medical', 'health', 'urgent care']
};

// Compute optimal string alignment (Damerau-Levenshtein) distance between two lowercase strings
export function damerauDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Allocate a (m + 1) x (n + 1) dynamic programming matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let val = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      // Treat a single adjacent letter transposition as edit cost 1 (e.g. restuarant -> restaurant)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        val = Math.min(val, dp[i - 2][j - 2] + 1);
      }
      dp[i][j] = val;
    }
  }
  return dp[m][n];
}

// Split any string into normalized alphanumeric lowercase words for fuzzy comparison
function extractWords(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

// Check if a query token matches target text directly or within a bounded typo edit distance
export function fuzzyTokenMatches(textLower: string, words: string[], token: string): 'exact' | 'prefix' | 'fuzzy' | null {
  if (!token) return null;

  // Use word-boundary matching for short tokens (<= 3 chars) so 'car' does not match 'care'
  if (token.length <= 3) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(textLower)) {
      return 'exact';
    }
    return null;
  }

  // Direct substring hit across the normalized text field
  if (textLower.includes(token)) {
    return 'exact';
  }

  // Check if any word in the field starts with the typed token prefix (handles partial typing)
  if (token.length >= 4 && words.some(w => w.startsWith(token))) {
    return 'prefix';
  }

  // Allow 1 typo for 5–7 char tokens or 2 typos for >= 8 char tokens sharing the initial letter
  if (token.length >= 5) {
    const maxDist = token.length >= 8 ? 2 : 1;
    for (const word of words) {
      if (word.length < 4) continue;
      if (Math.abs(word.length - token.length) > maxDist) continue;
      if (word[0] !== token[0]) continue;
      if (damerauDistance(token, word) <= maxDist) {
        return 'fuzzy';
      }
    }
  }

  return null;
}

// Resolve all civic categories hinted by a raw query or its misspelled tokens
export function inferMatchingCategories(query: string): CategoryType[] {
  const qLower = query.toLowerCase().trim();
  if (!qLower) return [];

  const tokens = extractWords(qLower).filter(t => !SEARCH_STOPWORDS.has(t));
  const matchedCategories = new Set<CategoryType>();

  for (const group of CATEGORY_ALIASES) {
    for (const term of group.terms) {
      // Check multi-word phrases directly against the full query
      if (term.includes(' ')) {
        if (qLower.includes(term)) {
          matchedCategories.add(group.category);
          break;
        }
        continue;
      }

      // Check single-word category aliases against each query token with typo tolerance
      for (const token of tokens) {
        if (
          token === term ||
          (token.length >= 4 && term.startsWith(token)) ||
          (token.length >= 5 && term.length >= 4 && token[0] === term[0] && damerauDistance(token, term) <= (token.length >= 8 ? 2 : 1))
        ) {
          matchedCategories.add(group.category);
          break;
        }
      }
    }
  }

  return Array.from(matchedCategories);
}

// Compute a numeric relevance score for a single ResourceItem against a visitor's search query
export function scoreResourceMatch(item: ResourceItem, query: string): number {
  const qLower = query.toLowerCase().trim();
  if (!qLower) return 1;

  // Collect normalized searchable fields (preserving both apostrophe and apostrophe-free brand forms)
  const normalizeField = (text: string) => {
    const lower = text.toLowerCase();
    const compact = lower.replace(/['’]/g, '');
    return compact !== lower ? `${lower} ${compact}` : lower;
  };
  const nameLower = normalizeField(item.name);
  const categoryLower = `${item.categoryLabel} ${item.category}`.toLowerCase();
  const taglineLower = normalizeField(item.tagline);
  const descLower = normalizeField(item.description);
  const servicesLower = item.keyServices.join(' ').toLowerCase();
  const eligLower = item.eligibility.toLowerCase();
  const intakeLower = (item.intakeRequirements || []).join(' ').toLowerCase();
  const addressLower = `${item.address} ${item.district}`.toLowerCase();
  const metaLower = `${item.cost} ${item.phone} ${item.languages.join(' ')}`.toLowerCase();

  // Combine all text once for word-level fuzzy matching
  const combinedText = `${nameLower} ${categoryLower} ${taglineLower} ${descLower} ${servicesLower} ${eligLower} ${intakeLower} ${addressLower} ${metaLower}`;
  const combinedWords = extractWords(combinedText);

  let score = 0;

  // 1. High priority boosts for exact full-phrase hits across key fields
  if (nameLower.includes(qLower)) score += 60;
  if (categoryLower.includes(qLower)) score += 45;
  if (taglineLower.includes(qLower)) score += 30;
  if (servicesLower.includes(qLower)) score += 28;
  if (descLower.includes(qLower)) score += 18;
  if (eligLower.includes(qLower)) score += 16;
  if (addressLower.includes(qLower)) score += 16;
  if (metaLower.includes(qLower)) score += 20;

  // 2. Category alias and typo intent match boost (e.g. "resturants" -> dining category)
  const inferredCategories = inferMatchingCategories(qLower);
  if (inferredCategories.includes(item.category)) {
    score += 40;
  }

  // Boost emergency-flagged services when visitor asks for urgent or 24/7 crisis help
  if (item.isEmergency && /\b(crisis|988|211|911|emergency|urgent|hotline|24\/7|suicide|abuse|haven)\b/i.test(qLower)) {
    score += 35;
  }

  // 3. Tokenize query into meaningful words and match across fields with synonyms and fuzzy typos
  const rawTokens = extractWords(qLower);
  const queryTokens = rawTokens.filter(t => !SEARCH_STOPWORDS.has(t));
  const activeTokens = queryTokens.length > 0 ? queryTokens : rawTokens;

  let matchedTokenCount = 0;

  for (const token of activeTokens) {
    let tokenMatched = false;

    // Evaluate primary token match against each weighted resource field
    const nameHit = fuzzyTokenMatches(nameLower, extractWords(nameLower), token);
    if (nameHit === 'exact') { score += 25; tokenMatched = true; }
    else if (nameHit === 'prefix') { score += 18; tokenMatched = true; }
    else if (nameHit === 'fuzzy') { score += 14; tokenMatched = true; }

    const catHit = fuzzyTokenMatches(categoryLower, extractWords(categoryLower), token);
    if (catHit) { score += 22; tokenMatched = true; }

    const svcHit = fuzzyTokenMatches(servicesLower, extractWords(servicesLower), token);
    if (svcHit) { score += 14; tokenMatched = true; }

    const tagHit = fuzzyTokenMatches(taglineLower, extractWords(taglineLower), token);
    if (tagHit) { score += 12; tokenMatched = true; }

    const otherText = `${descLower} ${eligLower} ${intakeLower} ${addressLower} ${metaLower}`;
    const otherHit = fuzzyTokenMatches(otherText, combinedWords, token);
    if (otherHit) { score += otherHit === 'fuzzy' ? 7 : 10; tokenMatched = true; }

    // Evaluate expanded synonyms for this token when present
    const synonyms = WORD_SYNONYMS[token] || [];
    for (const syn of synonyms) {
      if (combinedText.includes(syn)) {
        score += 10;
        tokenMatched = true;
      }
    }

    if (tokenMatched) {
      matchedTokenCount += 1;
    }
  }

  // 4. Bonus when every non-stopword token in a multi-word search is satisfied
  if (activeTokens.length > 1 && matchedTokenCount === activeTokens.length) {
    score += 25;
  }

  // Filter out incidental single-token noise (e.g. matching only "free") on multi-word queries
  if (activeTokens.length > 1 && matchedTokenCount < activeTokens.length && score < 25) {
    return 0;
  }

  return score;
}

// Suggest clickable category labels or corrections when a search yields zero matches
export function suggestSearchCorrections(query: string): Array<{ id: CategoryType; label: string }> {
  const qLower = query.toLowerCase().trim();
  const nonAllCategories = CATEGORIES.filter(c => c.id !== 'all');

  if (!qLower) {
    return nonAllCategories.slice(0, 4).map(c => ({ id: c.id as CategoryType, label: c.label }));
  }

  // First check category aliases using relaxed fuzzy matching
  const tokens = extractWords(qLower);
  const scored = nonAllCategories.map(cat => {
    let bestScore = 0;
    const labelWords = extractWords(cat.label);

    for (const token of tokens) {
      for (const word of labelWords) {
        const dist = damerauDistance(token, word);
        const similarity = Math.max(0, 10 - dist * 2);
        bestScore = Math.max(bestScore, similarity);
      }
    }

    // Check against alias list for that category
    const aliasGroup = CATEGORY_ALIASES.find(a => a.category === cat.id);
    if (aliasGroup) {
      for (const term of aliasGroup.terms) {
        for (const token of tokens) {
          const dist = damerauDistance(token, term);
          if (dist <= 3) {
            bestScore = Math.max(bestScore, 12 - dist * 2);
          }
        }
      }
    }

    return { id: cat.id as CategoryType, label: cat.label, score: bestScore };
  });

  return scored
    .filter(s => s.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ id, label }) => ({ id, label }));
}

// Explicit misspellings intentionally excluded from the valid dictionary so they always autocorrect
const DELIBERATE_MISSPELLINGS = new Set([
  'resturant',
  'resturants',
  'restuarant',
  'restuarants',
  'restraunt',
  'restraunts',
  'restaraunt',
  'restaraunts'
]);

// Direct lookup table for common multi-edit or transposed neighborhood search misspellings
const KNOWN_TYPO_CORRECTIONS: Record<string, string> = {
  resturant: 'restaurant',
  resturants: 'restaurants',
  restuarant: 'restaurant',
  restuarants: 'restaurants',
  restraunt: 'restaurant',
  restraunts: 'restaurants',
  restaraunt: 'restaurant',
  restaraunts: 'restaurants',
  reastaurant: 'restaurant',
  reastaurants: 'restaurants',
  dentst: 'dentist',
  denist: 'dentist',
  dentit: 'dentist',
  dentl: 'dental',
  grocries: 'groceries',
  grocerys: 'groceries',
  grocry: 'grocery',
  panrty: 'pantry',
  pantris: 'pantries',
  childcra: 'childcare',
  childcre: 'childcare',
  daycre: 'daycare',
  pharmcy: 'pharmacy',
  pharamcy: 'pharmacy',
  farmacy: 'pharmacy',
  emergncy: 'emergency',
  emegency: 'emergency',
  emergecy: 'emergency',
  mechanc: 'mechanic',
  mechnic: 'mechanic',
  plumbr: 'plumber',
  pluming: 'plumbing',
  transpotation: 'transportation',
  trasportation: 'transportation',
  disabilty: 'disability',
  disablity: 'disability',
  veterns: 'veterans',
  vetran: 'veteran',
  vetrans: 'veterans',
  hospitl: 'hospital',
  housng: 'housing',
  utilties: 'utilities',
  utilites: 'utilities',
  electrc: 'electric',
  preschol: 'preschool',
  schol: 'school',
  schols: 'schools',
  librry: 'library',
  libary: 'library',
  animls: 'animals',
  medicne: 'medicine',
  medcine: 'medicine',
  medcial: 'medical',
  therpay: 'therapy',
  counselng: 'counseling',
  apratment: 'apartment',
  apartmnt: 'apartment',
  evicton: 'eviction',
  forsyh: 'forsyth',
  forsthy: 'forsyth',
  cummng: 'cumming',
  autsm: 'autism',
  alchohol: 'alcohol',
  diabtes: 'diabetes'
};

// Structured representation of a single autocorrected search token
export interface AutocorrectCorrection {
  // Original misspelled token typed by the visitor
  original: string;
  // Resolved dictionary spelling matching case capitalization
  corrected: string;
}

// Output returned by autocorrectQuery summarizing query rewriting and readiness
export interface AutocorrectResult {
  // Raw input query string before autocorrection
  originalQuery: string;
  // Query string with misspelled tokens replaced
  correctedQuery: string;
  // True when at least one token in the query was rewritten
  wasCorrected: boolean;
  // List of individual token replacements applied
  corrections: AutocorrectCorrection[];
  // True when corrections look like finished typos rather than partial mid-word typing
  isReadyForInlineCommit: boolean;
}

// Build a weighted vocabulary of real directory and civic search terms once at module startup
const { dictionarySet: DIRECTORY_VOCABULARY, dictionaryEntries: DIRECTORY_VOCAB_LIST, priorityTerms: PRIORITY_SEARCH_TERMS } = (() => {
  const freq = new Map<string, number>();
  const priority = new Set<string>();

  // Record a word into the vocabulary map with an optional frequency boost
  const addWord = (word: string, weight = 1, isPriority = false) => {
    const clean = word.toLowerCase().trim();
    if (clean.length < 3 || !/^[a-z0-9]+$/.test(clean) || /^\d+$/.test(clean)) return;
    if (DELIBERATE_MISSPELLINGS.has(clean)) return;
    freq.set(clean, (freq.get(clean) || 0) + weight);
    if (isPriority) priority.add(clean);
  };

  // Index every word appearing across all verified directory listings
  for (const item of COMMUNITY_RESOURCES) {
    const textFields = [
      { text: item.name, weight: 4, isPriority: true },
      { text: item.categoryLabel, weight: 8, isPriority: true },
      { text: item.district, weight: 5, isPriority: true },
      { text: item.tagline, weight: 2, isPriority: false },
      { text: item.description, weight: 1, isPriority: false },
      { text: item.keyServices.join(' '), weight: 3, isPriority: true },
      { text: item.eligibility, weight: 1, isPriority: false },
      { text: item.languages.join(' '), weight: 3, isPriority: true },
      { text: item.cost, weight: 2, isPriority: false }
    ];

    for (const field of textFields) {
      for (const word of extractWords(field.text)) {
        addWord(word, field.weight, field.isPriority);
      }
      // Also index apostrophe-stripped possessive forms (e.g. "Tam's" -> "tams", "Giorgio's" -> "giorgios")
      for (const word of extractWords(field.text.replace(/['’]s\b/gi, 's'))) {
        addWord(word, field.weight, field.isPriority);
      }
    }
  }

  // Index category labels and canonical alias terms so everyday keywords stay valid and prioritized
  for (const cat of CATEGORIES) {
    for (const word of extractWords(cat.label)) {
      addWord(word, 12, true);
    }
  }
  for (const group of CATEGORY_ALIASES) {
    for (const term of group.terms) {
      for (const word of extractWords(term)) {
        addWord(word, 10, true);
      }
    }
  }
  for (const [key, synonyms] of Object.entries(WORD_SYNONYMS)) {
    addWord(key, 8, true);
    for (const syn of synonyms) {
      for (const word of extractWords(syn)) {
        addWord(word, 5, true);
      }
    }
  }
  for (const stopword of SEARCH_STOPWORDS) {
    addWord(stopword, 6, false);
  }

  return {
    dictionarySet: new Set(freq.keys()),
    dictionaryEntries: Array.from(freq.entries()),
    priorityTerms: priority
  };
})();

// Preserve initial capital letter or all-caps styling when substituting a corrected token
function matchWordCasing(original: string, replacement: string): string {
  if (original === original.toUpperCase() && original.length > 1) {
    return replacement.toUpperCase();
  }
  if (original[0] && original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// Check whether a typo looks finished enough to commit automatically inside the active text field
function isLikelyCompleteTypo(originalLower: string, correctedLower: string): boolean {
  if (KNOWN_TYPO_CORRECTIONS[originalLower]) return true;
  if (originalLower.length >= correctedLower.length - 1) return true;
  return originalLower[originalLower.length - 1] === correctedLower[correctedLower.length - 1];
}

// Resolve a single lowercase token to its best valid dictionary spelling if it is a clear typo
function autocorrectSingleToken(tokenLower: string): string | null {
  if (tokenLower.length < 4 || /^\d+$/.test(tokenLower)) return null;

  // Immediate hit from explicit misspelling map
  if (KNOWN_TYPO_CORRECTIONS[tokenLower]) {
    return KNOWN_TYPO_CORRECTIONS[tokenLower];
  }

  // Only run generic edit-distance replacement on >= 5 char tokens so short names/acronyms stay safe
  if (tokenLower.length < 5) {
    return null;
  }

  // Leave valid dictionary words untouched
  if (DIRECTORY_VOCABULARY.has(tokenLower)) {
    return null;
  }

  // Do not interrupt valid partial prefixes while the user is still typing a real word
  for (const [word] of DIRECTORY_VOCAB_LIST) {
    if (word.startsWith(tokenLower)) {
      return null;
    }
  }

  // Allow up to 1 edit for 4–6 char words or up to 2 edits for >= 7 char words
  const maxDist = tokenLower.length >= 7 ? 2 : 1;
  let bestCandidate: string | null = null;
  let bestRank = -Infinity;

  for (const [candidate, frequency] of DIRECTORY_VOCAB_LIST) {
    if (candidate.length < 4) continue;
    if (Math.abs(candidate.length - tokenLower.length) > maxDist) continue;

    // Require matching initial character or transposed opening pair to avoid wild false positives
    const sameStart = candidate[0] === tokenLower[0];
    const transposedStart =
      tokenLower.length >= 2 &&
      candidate.length >= 2 &&
      candidate[0] === tokenLower[1] &&
      candidate[1] === tokenLower[0];
    if (!sameStart && !transposedStart) continue;

    const dist = damerauDistance(tokenLower, candidate);
    if (dist === 0 || dist > maxDist) continue;

    // Require high-confidence 1-edit match unless length >= 7 and clearly close
    if (dist === 2 && tokenLower.length < 7) continue;

    // Score candidate preferring minimal edit distance, domain keywords, matching plural suffix, and high frequency
    let rank = (maxDist - dist) * 100 + Math.min(frequency, 60);
    if (PRIORITY_SEARCH_TERMS.has(candidate)) rank += 45;
    if (sameStart) rank += 20;
    if (tokenLower.endsWith('s') === candidate.endsWith('s')) rank += 18;
    rank -= Math.abs(candidate.length - tokenLower.length) * 4;

    if (rank > bestRank) {
      bestRank = rank;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

// Immediately autocorrect misspelled words across a query string while preserving formatting
export function autocorrectQuery(query: string): AutocorrectResult {
  if (!query || !query.trim()) {
    return {
      originalQuery: query,
      correctedQuery: query,
      wasCorrected: false,
      corrections: [],
      isReadyForInlineCommit: false
    };
  }

  const corrections: AutocorrectCorrection[] = [];
  let allComplete = true;

  // Replace word tokens in-place so spacing, hyphens, and trailing spaces stay intact
  const correctedQuery = query.replace(/[A-Za-z0-9]+/g, (word, offset: number) => {
    const lower = word.toLowerCase();
    const replacement = autocorrectSingleToken(lower);
    if (!replacement || replacement === lower) {
      return word;
    }

    const cased = matchWordCasing(word, replacement);
    corrections.push({ original: word, corrected: cased });

    // A token followed by trailing characters (space/punctuation) is always finished
    const followedBySeparator = offset + word.length < query.length;
    if (!followedBySeparator && !isLikelyCompleteTypo(lower, replacement)) {
      allComplete = false;
    }

    return cased;
  });

  return {
    originalQuery: query,
    correctedQuery,
    wasCorrected: corrections.length > 0 && correctedQuery !== query,
    corrections,
    isReadyForInlineCommit: corrections.length > 0 && allComplete
  };
}

