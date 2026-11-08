// ============================================================
// MentariSmartParent — Profanity filter (ID + EN)
//
// Used at serialization time for PUBLIC community surfaces so raw
// slurs never leave the API for readers. Storage keeps the original
// text (moderators see it raw + a flag) — nothing here mutates rows.
//
// Matching is case-insensitive on word boundaries; each hit is
// replaced with an equal-length run of asterisks.
// ============================================================

const ID_TERMS = [
  // slurs / insults
  'anjing', 'bangsat', 'goblok', 'gobloknya', 'tolol', 'bego', 'idiot', 'brengsek',
  'tai', 'taik', 'kampret', 'sialan', 'bokep',
  'kontol', 'memek', 'ngentot', 'ngewe', 'lonte', 'jalang', 'pelacur', 'sundal', 'bangkotan',
];

const EN_TERMS = [
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'shitty', 'bitch', 'bitches',
  'asshole', 'bastard', 'dickhead', 'dick', 'cunt', 'whore', 'slut', 'twat',
  'faggot', 'nigger', 'nigga', 'retard', 'retarded', 'dumbass',
];

const ALL_TERMS = [...new Set([...ID_TERMS, ...EN_TERMS])];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// One alternation, longest-first so multi-word terms win over substrings.
const SORTED = [...ALL_TERMS].sort((a, b) => b.length - a.length);
const PATTERN = new RegExp(`\\b(?:${SORTED.map(escapeRegExp).join('|')})\\b`, 'gi');

/** Replace every profanity hit with equal-length asterisks. */
export function censorProfanity(text: string): { text: string; hits: number } {
  let hits = 0;
  const censored = text.replace(PATTERN, (match) => {
    hits += 1;
    return '*'.repeat(Math.max(2, match.length));
  });
  return { text: censored, hits };
}

/** Number of profanity hits without changing the text (for moderator flags). */
export function countProfanity(text: string): number {
  if (!text) return 0;
  const matches = text.match(PATTERN);
  return matches ? matches.length : 0;
}
