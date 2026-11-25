/* =========================================================================
   MATH DATA & DETERMINISTIC 100-QUESTION BANK (10 WORLDS × 10 QUESTIONS)
   Grade 8 "Experimental Probability" questions.
   Experimental P = frequency ÷ trials, predictions = P × trials,
   expected counts, comparing experiments, spotting bias.
   Each question carries diagram data for <ExpDiagram/> and a tailored hint.
   Plain ESM (no Vite-only APIs) so Node audio scripts can import it too.
   ========================================================================= */

export const WESTERN_NAMES = [
  "Leo", "Emma", "Alex", "Oliver", "Sophia", "Jack", "Maya", "Lucas",
  "Ethan", "Chloe", "Noah", "Liam", "Harper", "Ava", "Mason", "Ella",
  "James", "Mia", "Logan", "Charlotte"
];

export const PRACTICE_WORLDS = [
  { id: 0, name: "Trial Town", icon: "🪙", range: "Q1–10", difficulty: 1 },
  { id: 1, name: "Theory Terrace", icon: "🎡", range: "Q11–20", difficulty: 1 },
  { id: 2, name: "Frequency Falls", icon: "📋", range: "Q21–30", difficulty: 2 },
  { id: 3, name: "Missing Count Cove", icon: "🔍", range: "Q31–40", difficulty: 2 },
  { id: 4, name: "Prediction Plains", icon: "🔮", range: "Q41–50", difficulty: 2 },
  { id: 5, name: "Expected Canyon", icon: "🎯", range: "Q51–60", difficulty: 3 },
  { id: 6, name: "Large Numbers Lake", icon: "🌊", range: "Q61–70", difficulty: 3 },
  { id: 7, name: "Fairness Fort", icon: "⚖️", range: "Q71–80", difficulty: 3 },
  { id: 8, name: "Sample Size Summit", icon: "🏔️", range: "Q81–90", difficulty: 4 },
  { id: 9, name: "Probability Champion", icon: "🏆", range: "Q91–100", difficulty: 4 }
];

/* Deterministic Mulberry32 PRNG so all 100 questions match pre-generated MP3s */
function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const makeHelpers = (rnd) => {
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const rint = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const shuffle = a => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  return { pick, rint, shuffle, rnd };
};

const dec = v => String(Math.round(v * 1000) / 1000);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const frac = (a, b) => { const g = gcd(a, b) || 1; return b / g === 1 ? `${a / g}` : `${a / g}/${b / g}`; };

const RULES = {
  exp: "✦ EXPERIMENTAL P = FREQUENCY ÷ TRIALS",
  theory: "✦ THEORETICAL P = FAVOURABLE ÷ TOTAL OUTCOMES",
  rf: "✦ RELATIVE FREQUENCY = FREQUENCY ÷ TOTAL",
  missing: "✦ FREQUENCIES ADD UP TO THE TOTAL",
  predict: "✦ PREDICTION = P × NUMBER OF TRIALS",
  expected: "✦ EXPECTED = THEORETICAL P × TRIALS",
  closest: "✦ MORE TRIALS → CLOSER TO THEORY",
  biased: "✦ FAR FROM EXPECTED → PROBABLY BIASED",
  total: "✦ TRIALS = FREQUENCY ÷ P",
  not: "✦ P(NOT A) = 1 − P(A)"
};

function opts(correct, cands, pad) {
  const out = [correct];
  for (const c of cands) { if (c && !out.includes(c)) out.push(c); if (out.length === 4) return out; }
  for (let k = 1; out.length < 4 && k < 80; k++) { const c = pad(k); if (c && !out.includes(c)) out.push(c); }
  return out;
}
/** Decimal options strictly between 0 and 1. */
const decOpts = (c, cands) => opts(
  dec(c),
  cands.filter(v => Number.isFinite(v) && v > 0 && v < 1 && Math.abs(v - c) > 1e-9).map(dec),
  k => { const v = c + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.05; return v > 0 && v < 1 ? dec(v) : null; }
);
const intOpts = (c, cands, step = 1) => opts(
  String(c),
  cands.filter(v => Number.isInteger(v) && v >= 0 && v !== c).map(String),
  k => { const v = c + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * step; return v >= 0 ? String(v) : null; }
);

const NS = [10, 20, 25, 40, 50, 100, 200, 250, 500];

const EXP_CONTEXTS = [
  (nm, n, f) => ({ text: `${nm} flipped a coin ${n} times and got heads ${f} times.`, ev: 'heads', a: 'Heads', b: 'Tails' }),
  (nm, n, f) => ({ text: `${nm} took ${n} basketball free throws and scored ${f} of them.`, ev: 'scoring', a: 'Scored', b: 'Missed' }),
  (nm, n, f) => ({ text: `${nm} dropped a paper cup ${n} times and it landed upright ${f} times.`, ev: 'landing upright', a: 'Upright', b: 'Other' }),
  (nm, n, f) => ({ text: `${nm} spun a spinner ${n} times and it landed on red ${f} times.`, ev: 'red', a: 'Red', b: 'Not red' }),
  (nm, n, f) => ({ text: `${nm} rolled a die ${n} times and got an even number ${f} times.`, ev: 'an even number', a: 'Even', b: 'Odd' }),
  (nm, n, f) => ({ text: `${nm} tossed a bottle cap ${n} times and it landed face up ${f} times.`, ev: 'face up', a: 'Face up', b: 'Face down' }),
  (nm, n, f) => ({ text: `${nm} shot ${n} arrows at a target and hit the bullseye ${f} times.`, ev: 'hitting the bullseye', a: 'Bullseye', b: 'Other' }),
  (nm, n, f) => ({ text: `${nm} spun a wheel ${n} times and it stopped on green ${f} times.`, ev: 'green', a: 'Green', b: 'Not green' }),
  (nm, n, f) => ({ text: `${nm} tossed a beanbag ${n} times and landed it in the hoop ${f} times.`, ev: 'landing in the hoop', a: 'In hoop', b: 'Missed' }),
  (nm, n, f) => ({ text: `${nm} rolled a number cube ${n} times and rolled a six ${f} times.`, ev: 'rolling a six', a: 'Six', b: 'Other' })
];

const TABLES = [
  { title: 'Colour', labels: ['Red', 'Blue', 'Green', 'Yellow'], what: 'spun a spinner', unit: 'spins' },
  { title: 'Marble', labels: ['Red', 'Blue', 'Green'], what: 'drew a marble from a bag (putting it back each time)', unit: 'draws' },
  { title: 'Result', labels: ['Win', 'Draw', 'Loss'], what: 'played a computer game', unit: 'games' },
  { title: 'Weather', labels: ['Sunny', 'Cloudy', 'Rainy'], what: 'recorded the weather at noon', unit: 'days' },
  { title: 'Snack', labels: ['Apple', 'Banana', 'Orange', 'Grapes'], what: 'picked a snack from a mystery box (putting it back each time)', unit: 'picks' }
];

/** Split total n into k positive parts (each at least 1). */
function split(n, k, h) {
  const parts = [];
  let left = n;
  for (let i = 0; i < k - 1; i++) {
    const maxHere = left - (k - 1 - i);
    const v = h.rint(1, Math.max(1, Math.floor(Math.min(maxHere, (left / (k - i)) * 1.7))));
    parts.push(v);
    left -= v;
  }
  parts.push(left);
  return h.shuffle(parts);
}

/* ------------------------- archetype builders ------------------------- */
function qExp(name, h, slotIdx) {
  const n = h.pick(NS);
  const f = h.rint(Math.max(1, Math.round(n * 0.1)), Math.round(n * 0.9));
  const ctxBuilder = slotIdx != null ? EXP_CONTEXTS[slotIdx % EXP_CONTEXTS.length] : h.pick(EXP_CONTEXTS);
  const c = ctxBuilder(name, n, f);
  const p = f / n;
  return {
    archetype: 'exp', meta: { n, f },
    prompt: `${c.text} What is the experimental probability of ${c.ev}?`,
    hint: `Divide how many times ${c.ev} happened (${f}) by the total number of trials (${n}): ${f} ÷ ${n}.`,
    diagramData: { type: 'bars', labels: [c.a, c.b], freqs: [f, n - f], highlight: 0 },
    options: decOpts(p, [(n - f) / n, f / 100, f / (n + f), 1 - p / 2]),
    explanation: `Experimental P = frequency ÷ trials = ${f} ÷ ${n} = ${dec(p)}.`,
    rule: RULES.exp
  };
}

function qTheory(_name, h) {
  const kind = h.pick(['spinner', 'spinner', 'die']);
  if (kind === 'die') {
    const evs = [
      ['an even number', [2, 4, 6]], ['a number greater than 4', [5, 6]], ['a prime number', [2, 3, 5]],
      ['a 3', [3]], ['a number less than 5', [1, 2, 3, 4]], ['a multiple of 3', [3, 6]]
    ];
    const [ev, set] = h.pick(evs);
    const a = set.length, b = 6;
    return {
      archetype: 'theory', meta: { a, b },
      prompt: `A fair six-sided die is rolled. What is the theoretical probability of rolling ${ev}?`,
      hint: `Count how many faces on a 6-sided die show ${ev}, then divide by 6 and simplify the fraction.`,
      diagramData: { type: 'dice', hot: set },
      options: opts(frac(a, b), [frac(b - a, b), a < b - a ? frac(a, b - a) : null, frac(1, b), frac(a, 10)], k => frac(k, 12)),
      explanation: `There are ${a} favourable outcome${a > 1 ? 's' : ''} out of 6 equally likely outcomes, so P = ${a}/6${frac(a, b) !== `${a}/6` ? ` = ${frac(a, b)}` : ''}.`,
      rule: RULES.theory
    };
  }
  const b = h.pick([4, 5, 6, 8, 10]);
  const a = h.rint(1, b - 1);
  const col = h.pick(['Blue', 'Pink', 'Green', 'Red', 'Gold']);
  const others = ['Yellow', 'Purple', 'Orange'].filter(c => c !== col);
  const sectors = h.shuffle([...Array(a).fill(col), ...Array.from({ length: b - a }, (_, i) => others[i % others.length])]);
  return {
    archetype: 'theory', meta: { a, b },
    prompt: `A spinner has ${b} equal sections and ${a} of them are ${col.toLowerCase()}. What is the theoretical probability of landing on ${col.toLowerCase()}?`,
    hint: `There are ${a} ${col.toLowerCase()} sections out of ${b} equal sections in total. Write ${a}/${b} as a simplified fraction.`,
    diagramData: { type: 'spinner', sectors },
    options: opts(frac(a, b), [frac(b - a, b), a < b - a ? frac(a, b - a) : null, frac(1, b), frac(a, b + 1)], k => frac(k, b + 2)),
    explanation: `${a} of the ${b} equal sections are ${col.toLowerCase()}, so P = ${a}/${b}${frac(a, b) !== `${a}/${b}` ? ` = ${frac(a, b)}` : ''}.`,
    rule: RULES.theory
  };
}

function tableData(h, tableIdx) {
  const T = tableIdx != null ? TABLES[tableIdx % TABLES.length] : h.pick(TABLES);
  const n = h.pick([20, 25, 40, 50, 100, 200]);
  const freqs = split(n, T.labels.length, h);
  return { T, n, freqs };
}

function qRF(name, h, slotIdx) {
  const { T, n, freqs } = tableData(h, slotIdx);
  const i = h.rint(0, T.labels.length - 1);
  const f = freqs[i];
  const p = f / n;
  return {
    archetype: 'rf', meta: { n, f },
    prompt: `${name} ${T.what} ${n} times and recorded the results in the table. What is the relative frequency of ${T.labels[i].toLowerCase()}?`,
    hint: `Read the frequency for ${T.labels[i].toLowerCase()} (${f}) from the table and divide by the total (${n}): ${f} ÷ ${n}.`,
    diagramData: { type: 'table', title: T.title, labels: T.labels, freqs },
    options: decOpts(p, [f / 100, (n - f) / n, ...freqs.filter((_, j) => j !== i).map(v => v / n)]),
    explanation: `Relative frequency = ${f} ÷ ${n} = ${dec(p)}.`,
    rule: RULES.rf
  };
}

function qMissing(name, h, slotIdx) {
  const { T, n, freqs } = tableData(h, slotIdx);
  const i = h.rint(0, T.labels.length - 1);
  const known = freqs.filter((_, j) => j !== i);
  const sumKnown = known.reduce((a, b) => a + b, 0);
  return {
    archetype: 'missing', meta: { n, sumKnown },
    prompt: `${name} ${T.what} ${n} times. One frequency in the table is missing. How many times was the result ${T.labels[i].toLowerCase()}?`,
    hint: `All frequencies in the table add up to ${n}. Add the known values (${known.join(' + ')}) and subtract from ${n}.`,
    diagramData: { type: 'table', title: T.title, labels: T.labels, freqs, hide: i, total: n },
    options: intOpts(n - sumKnown, [sumKnown, n - sumKnown + 10, n - sumKnown - 10, Math.round(n / T.labels.length)]),
    explanation: `The frequencies add up to ${n}. Known: ${known.join(' + ')} = ${sumKnown}. Missing = ${n} − ${sumKnown} = ${n - sumKnown}.`,
    rule: RULES.missing
  };
}

const PRED_CONTEXTS = [
  (nm, f, n) => ({ text: `${nm} scored ${f} goals in ${n} penalty kicks.`, ask: m => `About how many goals should ${nm} expect in the next ${m} kicks?` }),
  (nm, f, n) => ({ text: `A spinner landed on blue ${f} times in ${n} spins.`, ask: m => `About how many blues would you expect in ${m} spins?` }),
  (nm, f, n) => ({ text: `${nm} found a toy in ${f} of the first ${n} cereal boxes opened.`, ask: m => `About how many of the next ${m} boxes would you expect to have a toy?` }),
  (nm, f, n) => ({ text: `In ${n} trials, a paper cup landed upright ${f} times.`, ask: m => `About how many times would you expect it to land upright in ${m} trials?` }),
  (nm, f, n) => ({ text: `${nm} made ${f} out of ${n} basketball free throws.`, ask: m => `About how many shots should ${nm} expect to make in ${m} attempts?` }),
  (nm, f, n) => ({ text: `In ${n} mornings, the school bus arrived on time ${f} times.`, ask: m => `About how many times would you expect it on time in ${m} mornings?` }),
  (nm, f, n) => ({ text: `${nm} drew a green marble ${f} times in ${n} draws (putting it back each time).`, ask: m => `About how many green marbles would you expect in ${m} draws?` }),
  (nm, f, n) => ({ text: `A weighted coin landed on heads ${f} times in ${n} flips.`, ask: m => `About how many heads would you expect in ${m} flips?` })
];

function qPredict(name, h, slotIdx) {
  let n, f, m;
  do {
    n = h.pick([10, 20, 25, 30, 40, 50]);
    f = h.rint(Math.max(1, Math.round(n * 0.15)), Math.round(n * 0.85));
    m = h.pick([50, 60, 100, 120, 150, 200, 300, 400, 500]);
  } while ((f * m) % n !== 0 || m === n);
  const ctxBuilder = slotIdx != null ? PRED_CONTEXTS[slotIdx % PRED_CONTEXTS.length] : h.pick(PRED_CONTEXTS);
  const c = ctxBuilder(name, f, n);
  const ans = (f * m) / n;
  return {
    archetype: 'predict', meta: { n, f, m },
    prompt: `${c.text} ${c.ask(m)}`,
    hint: `First find the experimental probability (${f} ÷ ${n}), then multiply it by ${m} future trials.`,
    diagramData: { type: 'bars', labels: ['Yes', 'No'], freqs: [f, n - f], highlight: 0 },
    options: intOpts(ans, [m - ans, f + m, Math.round((f * m) / (n * 2)), ans + n], Math.max(1, Math.round(ans / 10))),
    explanation: `Experimental P = ${f} ÷ ${n} = ${dec(f / n)}. Prediction = ${dec(f / n)} × ${m} = ${ans}.`,
    rule: RULES.predict
  };
}

function qExpected(name, h, slotIdx) {
  const kinds = ['die', 'coin', 'spinner'];
  const kind = slotIdx != null ? kinds[slotIdx % kinds.length] : h.pick(kinds);
  let n, a, b, label, what, dd;
  if (kind === 'die') {
    n = h.pick([60, 120, 180, 300, 600]); a = 1; b = 6; label = `a ${h.rint(1, 6)}`; what = `rolls a fair die ${n} times`; dd = { type: 'dice', hot: [] };
  } else if (kind === 'coin') {
    n = h.pick([40, 80, 100, 150, 200, 500]); a = 1; b = 2; label = 'heads'; what = `flips a fair coin ${n} times`; dd = { type: 'coins', faces: ['H', 'T'], caption: 'fair coin' };
  } else {
    b = h.pick([4, 5, 8, 10]); a = h.rint(1, b - 1);
    n = b * h.pick([10, 20, 25, 30, 50]);
    label = 'green'; what = `spins a spinner with ${b} equal sections, ${a} of them green, ${n} times`;
    dd = { type: 'spinner', sectors: h.shuffle([...Array(a).fill('Green'), ...Array.from({ length: b - a }, (_, i) => ['Blue', 'Pink', 'Yellow'][i % 3])]) };
  }
  if (kind === 'die') dd.hot = [Number(label.slice(2))];
  const E = (n * a) / b;
  const diffMode = slotIdx != null ? slotIdx % 2 === 1 : h.rnd() < 0.5;
  if (!diffMode) {
    return {
      archetype: 'expected', meta: { n, a, b },
      prompt: `${name} ${what}. How many times should ${name} expect to get ${label}?`,
      hint: `Multiply the theoretical probability (${a}/${b}) by the total trials (${n}): ${a}/${b} × ${n}.`,
      diagramData: dd,
      options: intOpts(E, [n - E, n / 2 === E ? E + 10 : n / 2, E * 2, b], Math.max(1, Math.round(E / 10))),
      explanation: `Expected = theoretical P × trials = ${a}/${b} × ${n} = ${E}.`,
      rule: RULES.expected
    };
  }
  let obs;
  do { obs = E + h.rint(-Math.max(3, Math.round(E * 0.3)), Math.max(3, Math.round(E * 0.3))); } while (obs === E || obs < 0 || obs > n);
  const d = Math.abs(obs - E);
  const more = obs > E;
  return {
    archetype: 'expectedDiff', meta: { n, a, b, obs },
    prompt: `${name} ${what} and gets ${label} ${obs} times. How many ${more ? 'MORE' : 'FEWER'} times is that than expected?`,
    hint: `First calculate the expected count (${a}/${b} × ${n}), then find the difference between ${obs} and that expected number.`,
    diagramData: dd,
    options: intOpts(d, [E, obs, d + E, Math.abs(n - obs)], 1),
    explanation: `Expected = ${a}/${b} × ${n} = ${E}. ${more ? `${obs} − ${E}` : `${E} − ${obs}`} = ${d} ${more ? 'more' : 'fewer'}.`,
    rule: RULES.expected
  };
}

function qClosest(_name, h) {
  const names = h.shuffle(WESTERN_NAMES).slice(0, 4);
  const theory = 0.5;
  let rows;
  for (;;) {
    rows = names.map(nm => {
      const n = h.pick([10, 20, 40, 50, 100, 200, 500, 1000]);
      const f = h.rint(Math.round(n * 0.3), Math.round(n * 0.7));
      return { name: nm, n, f, d: Math.abs(f / n - theory) };
    });
    const ds = rows.map(r => r.d).sort((a, b) => a - b);
    if (ds[1] - ds[0] >= 0.01 && new Set(rows.map(r => r.n)).size >= 3) break;
  }
  const best = rows.reduce((a, b) => (b.d < a.d ? b : a));
  return {
    archetype: 'closest', meta: { rows, theory },
    prompt: `Four students each flipped a fair coin and counted heads: ${rows.map(r => `${r.name} got ${r.f} in ${r.n}`).join(', ')}. Whose experimental probability is closest to the theoretical value of 0.5?`,
    hint: `Divide heads by flips for each student (${rows.map(r => `${r.name}: ${r.f} ÷ ${r.n}`).join(', ')}) and see whose decimal is nearest to 0.5.`,
    diagramData: { type: 'compare', rows: rows.map(({ name, f, n }) => ({ name, f, n })), theory },
    options: [best.name, ...rows.filter(r => r !== best).map(r => r.name)],
    explanation: rows.map(r => `${r.name}: ${r.f} ÷ ${r.n} = ${dec(r.f / r.n)}`).join('; ') + `. ${best.name}'s ${dec(best.f / best.n)} is closest to 0.5.`,
    rule: RULES.closest
  };
}

function qBiased(_name, h, slotIdx) {
  const n = h.pick([300, 600]);
  const E = n / 6;
  const hot = h.rint(1, 6);
  const freqs = [];
  const big = 3 * Math.round((E + E * (0.5 + h.rnd() * 0.4)) / 3);
  let rest = n - big;
  const others = [];
  for (let i = 0; i < 4; i++) {
    const v = Math.round(rest / (5 - i)) + h.rint(-Math.round(E * 0.06), Math.round(E * 0.06));
    others.push(v);
    rest -= v;
  }
  others.push(rest);
  let k = 0;
  for (let v = 1; v <= 6; v++) freqs.push(v === hot ? big : others[k++]);
  const asks = slotIdx != null ? slotIdx % 2 === 0 : h.rnd() < 0.5;
  if (asks) {
    return {
      archetype: 'biased', meta: { n, freqs, hot },
      prompt: `A die was rolled ${n} times. The bar chart shows the results. Which number suggests the die is biased?`,
      hint: `If the ${n}-roll die were fair, each number would appear about ${n} ÷ 6 = ${E} times. Find the bar that stands much higher than ${E}.`,
      diagramData: { type: 'bars', labels: ['1', '2', '3', '4', '5', '6'], freqs, expected: E },
      options: [`Number ${hot}`, ...h.shuffle([1, 2, 3, 4, 5, 6].filter(v => v !== hot)).slice(0, 3).map(v => `Number ${v}`)],
      explanation: `If the die were fair, each number would come up about ${n} ÷ 6 = ${E} times. Number ${hot} came up ${big} times (relative frequency ${dec(big / n)}), far more than 1/6 ≈ 0.17.`,
      rule: RULES.biased
    };
  }
  return {
    archetype: 'biasedRF', meta: { n, big },
    prompt: `A die was rolled ${n} times and number ${hot} came up ${big} times. What is the relative frequency of ${hot}? (Compare it with 1/6 ≈ 0.17.)`,
    hint: `Divide how many times number ${hot} appeared (${big}) by the total rolls (${n}): ${big} ÷ ${n}.`,
    diagramData: { type: 'bars', labels: ['1', '2', '3', '4', '5', '6'], freqs, expected: E, highlight: hot - 1 },
    options: decOpts(big / n, [1 / 6, E / n + 0.1, big / 1000, (n - big) / n]),
    explanation: `Relative frequency = ${big} ÷ ${n} = ${dec(big / n)}. That is much more than 1/6 ≈ 0.17, so the die is probably biased.`,
    rule: RULES.biased
  };
}

function qTotal(name, h, slotIdx) {
  const p = h.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.05, 0.15, 0.35, 0.45]);
  let n;
  do { n = h.pick([20, 40, 60, 80, 100, 120, 200, 300, 400]); } while (Math.abs(p * n - Math.round(p * n)) > 1e-9 || Math.round(p * n) < 1);
  const f = Math.round(p * n);
  const isTotalMode = slotIdx != null ? slotIdx % 2 === 0 : h.rnd() < 0.5;
  if (isTotalMode) {
    return {
      archetype: 'total', meta: { p, f },
      prompt: `${name}'s spinner landed on red ${f} times. The relative frequency of red was ${p}. How many times did ${name} spin the spinner?`,
      hint: `Since relative frequency = frequency ÷ trials, divide the frequency (${f}) by the relative frequency (${p}): ${f} ÷ ${p}.`,
      diagramData: { type: 'bars', labels: ['Red', 'Not red'], freqs: [f, n - f], highlight: 0 },
      options: intOpts(n, [Math.round(f * p), f + Math.round(p * 100), Math.round(f / (1 - p)), f * 10 === n ? f * 5 : f * 10], Math.max(1, Math.round(n / 10))),
      explanation: `Frequency = P × trials, so trials = frequency ÷ P = ${f} ÷ ${p} = ${n}.`,
      rule: RULES.total
    };
  }
  return {
    archetype: 'freqFromP', meta: { p, n },
    prompt: `${name} flipped a bottle cap ${n} times. The experimental probability of it landing face up was ${p}. How many times did it land face up?`,
    hint: `Multiply the experimental probability (${p}) by the total number of flips (${n}): ${p} × ${n}.`,
    diagramData: { type: 'bars', labels: ['Face up', 'Face down'], freqs: [f, n - f], highlight: 0 },
    options: intOpts(f, [n - f, Math.round(n / p) > 1000 ? f + 10 : Math.round(n / p), Math.round(p * 100), f * 2], Math.max(1, Math.round(f / 5))),
    explanation: `Frequency = experimental P × trials = ${p} × ${n} = ${f}.`,
    rule: RULES.total
  };
}

const NOT_CONTEXTS = [
  (nm, n, f) => ({
    prompt: `${nm} rolled a ball at a target ${n} times and hit it ${f} times. What is the experimental probability that the ball does NOT hit the target?`,
    ev: 'hit', notEv: 'not hit', a: 'Hit', b: 'Miss'
  }),
  (nm, n, f) => ({
    prompt: `${nm} spun a wheel ${n} times and it landed on red ${f} times. What is the experimental probability that it does NOT land on red?`,
    ev: 'red', notEv: 'not red', a: 'Red', b: 'Not red'
  }),
  (nm, n, f) => ({
    prompt: `${nm} drew a marble ${n} times (putting it back each time) and got blue ${f} times. What is the experimental probability of NOT drawing blue?`,
    ev: 'blue', notEv: 'not blue', a: 'Blue', b: 'Other'
  })
];

function qNot(name, h, slotIdx) {
  const n = h.pick([20, 25, 40, 50, 100, 200, 250]);
  const f = h.rint(Math.round(n * 0.1), Math.round(n * 0.9));
  const p = 1 - f / n;
  const ctx = (slotIdx != null ? NOT_CONTEXTS[slotIdx % NOT_CONTEXTS.length] : h.pick(NOT_CONTEXTS))(name, n, f);
  return {
    archetype: 'not', meta: { n, f },
    prompt: ctx.prompt,
    hint: `First find P(${ctx.ev}) = ${f} ÷ ${n}, then subtract from 1 because P(${ctx.notEv}) = 1 − P(${ctx.ev}).`,
    diagramData: { type: 'bars', labels: [ctx.a, ctx.b], freqs: [f, n - f], highlight: 1 },
    options: decOpts(p, [f / n, f / 100, (n - f) / 100]),
    explanation: `P(${ctx.ev}) = ${f} ÷ ${n} = ${dec(f / n)}. P(${ctx.notEv}) = 1 − ${dec(f / n)} = ${dec(p)}.`,
    rule: RULES.not
  };
}

const BUILDERS = {
  exp: qExp, theory: qTheory, rf: qRF, missing: qMissing, predict: qPredict,
  expected: qExpected, closest: qClosest, biased: qBiased, total: qTotal, not: qNot
};

const WORLD_POOLS = [
  ['exp'], ['theory'], ['rf'], ['missing'], ['predict'],
  ['expected'], ['closest'], ['biased'], ['total'],
  ['not', 'not', 'exp', 'rf', 'predict', 'expected', 'closest', 'biased', 'total', 'missing']
];

function buildAllWorldQuestions() {
  const rng = createRng(20260808);
  const h = makeHelpers(rng);
  const usedPrompts = new Set();
  const usedHints = new Set();

  return PRACTICE_WORLDS.map((world, worldIndex) => {
    const pool = WORLD_POOLS[world.id];
    const qs = [];
    for (let qIndex = 0; qIndex < 10; qIndex++) {
      const archetypeKey = pool.length === 10 ? pool[qIndex] : pool[qIndex % pool.length];
      let built = null;
      for (let attempt = 0; attempt < 100; attempt++) {
        const name = WESTERN_NAMES[(worldIndex * 10 + qIndex + attempt) % WESTERN_NAMES.length];
        const cand = BUILDERS[archetypeKey](name, h, qIndex + attempt);
        if (!usedPrompts.has(cand.prompt) && !usedHints.has(cand.hint)) {
          usedPrompts.add(cand.prompt);
          usedHints.add(cand.hint);
          built = cand;
          break;
        }
      }
      if (!built) {
        const name = h.pick(WESTERN_NAMES);
        built = BUILDERS[archetypeKey](name, h, qIndex);
      }
      const target = built.options[0];
      qs.push({
        id: `w${worldIndex + 1}_q${qIndex + 1}`,
        worldIndex,
        questionIndex: qIndex,
        world,
        archetype: built.archetype,
        prompt: built.prompt,
        hint: built.hint,
        correctValue: target,
        options: built.options.slice(0, 4),
        diagramData: built.diagramData,
        rule: built.rule,
        explanation: built.explanation,
        meta: built.meta
      });
    }
    return qs;
  });
}

export const WORLD_QUESTIONS = buildAllWorldQuestions();
export const ALL_PRACTICE_QUESTIONS = WORLD_QUESTIONS.flat();

export function makeQuestion(worldIndex = 0, qIndex = null) {
  const bank = WORLD_QUESTIONS[worldIndex] || WORLD_QUESTIONS[0];
  const base = qIndex != null ? bank[qIndex % bank.length] : bank[Math.floor(Math.random() * bank.length)];

  // Shuffle only display order of options; prompt, hint, and audio remain fixed
  const shuffled = [...base.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    ...base,
    correctIndex: shuffled.indexOf(base.correctValue),
    options: shuffled
  };
}
