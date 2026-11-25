/* =========================================================================
   TTS PRONUNCIATION NORMALIZER
   Converts on-screen math notation into natural spoken English for ElevenLabs
   (and browser speechSynthesis fallback) while keeping on-screen text clean.
   Plain ESM (no browser-only APIs) so Node scripts can import it too.
   ========================================================================= */

const NUM_WORDS = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
  15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen',
  19: 'nineteen', 20: 'twenty'
};

const ORDINAL_SINGULAR = {
  2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth', 6: 'sixth',
  7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth',
  11: 'eleventh', 12: 'twelfth', 13: 'thirteenth', 14: 'fourteenth',
  15: 'fifteenth', 16: 'sixteenth', 17: 'seventeenth', 18: 'eighteenth',
  19: 'nineteenth', 20: 'twentieth'
};

const ORDINAL_PLURAL = {
  2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 6: 'sixths',
  7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths',
  11: 'elevenths', 12: 'twelfths', 13: 'thirteenths', 14: 'fourteenths',
  15: 'fifteenths', 16: 'sixteenths', 17: 'seventeenths', 18: 'eighteenths',
  19: 'nineteenths', 20: 'twentieths'
};

function fractionToWords(numStr, denStr) {
  const num = Number(numStr);
  const den = Number(denStr);
  if (!Number.isInteger(num) || !Number.isInteger(den) || den <= 1) {
    return `${numStr} over ${denStr}`;
  }
  if (den <= 20 && num >= 1 && num <= 20) {
    const nWord = NUM_WORDS[num] || String(num);
    const dWord = num === 1 ? ORDINAL_SINGULAR[den] : ORDINAL_PLURAL[den];
    if (dWord) return `${nWord} ${dWord}`;
  }
  return `${numStr} over ${denStr}`;
}

export function pronounceForTTS(rawText) {
  if (!rawText) return '';
  let t = String(rawText);

  // Strip emojis, variation selectors, and decorative UI glyphs
  t = t
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]/gu, ' ')
    .replace(/[✦★☆✓✔]/g, ' ');

  // Abbreviations & UI shorthand
  t = t
    .replace(/\b2\s*d\.p\./gi, '2 decimal places')
    .replace(/\bRel\.\s*freq\./gi, 'Relative frequency')
    .replace(/\bfreq\./gi, 'frequency');

  // Probability notation:
  // "experimental P(heads)" -> "experimental probability of heads"
  t = t.replace(/\b(experimental|theoretical)\s+P\(([^)]+)\)/gi, (_, kind, inner) => {
    return `${kind} probability of ${inner.trim()}`;
  });
  // "P(not hit)" / "P(A)" -> "probability of ..."
  t = t.replace(/\bP\(([^)]+)\)/g, (_, inner) => {
    return `probability of ${inner.trim()}`;
  });
  // "Experimental P" / "Theoretical P" (without parens)
  t = t.replace(/\b(experimental|theoretical)\s+P\b/gi, '$1 probability');
  // Standalone P in formulas like "P = ...", "P × ...", "÷ P"
  t = t.replace(/\bP\s*([=×÷])/g, 'probability $1');
  t = t.replace(/([=×÷])\s*P\b/g, '$1 probability');

  // Percentages
  t = t.replace(/(\d+(?:\.\d+)?)\s*%/g, '$1 percent');

  // Fractions like 1/6, 3/8, 7/10
  t = t.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, (_, a, b) => fractionToWords(a, b));

  // Math operators
  t = t
    .replace(/÷/g, ' divided by ')
    .replace(/×/g, ' times ')
    .replace(/−/g, ' minus ')
    .replace(/≈/g, ' is approximately ')
    .replace(/≫/g, ' is much greater than ')
    .replace(/→/g, ', which gives ')
    .replace(/=/g, ' equals ');

  // Hyphenated number-noun forms like "800-spin" -> "800 spin" (keep "six-sided")
  t = t.replace(/\b(\d+)-([a-z]+)/gi, '$1 $2');

  // Clean whitespace and punctuation spacing
  t = t
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();

  return t;
}
