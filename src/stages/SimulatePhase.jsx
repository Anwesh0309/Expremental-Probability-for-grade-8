import React, { useState, useEffect, useRef } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { SIMULATE, SIMULATE_GUIDANCE } from '../utils/lessonScript.js';
import { simulateActivityNarration, simulateHintNarration, feedbackNarration } from '../utils/narration.js';
import { Coin, Die, Spinner, FreqBars, RFLine, COLORS, dec } from '../components/ExpDiagram.jsx';

/* =========================================================================
   SIMULATION STATIONS — Experimental Probability (Grade 8)
   Station 1 · Trial Lab       → SEE experimental probability settle as trials grow
   Station 2 · Data Desk       → TRY it: tally raw results, find relative frequency, predict
   Station 3 · Fairness Court  → APPLY: compare data with expectation, give a verdict
   ========================================================================= */

/** Accepts decimals, percentages and fractions such as 3/8. */
const parseVal = str => {
  const s = String(str ?? '').replace(/[\s,]/g, '');
  if (s === '') return NaN;
  if (/^-?\d+(\.\d+)?\/\d+(\.\d+)?$/.test(s)) { const [a, b] = s.split('/').map(Number); return b ? a / b : NaN; }
  if (s.endsWith('%')) return Number(s.slice(0, -1)) / 100;
  return Number(s);
};
const near = (str, want, tol = 0.006) => { const v = parseVal(str); return Number.isFinite(v) && Math.abs(v - want) <= tol; };

/* Deterministic shuffle so every class sees the same raw data. */
const seeded = (counts, seed) => {
  const out = [];
  Object.entries(counts).forEach(([k, n]) => { for (let i = 0; i < n; i++) out.push(k); });
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

/* ------------------------------------------------------------------------
   STATION DATA
   ------------------------------------------------------------------------ */
const STATION_ACTIVITIES = {
  1: [
    {
      id: 1,
      title: "Activity 1: Leo's Coin Lab",
      desc: "Flip Leo's coin at least 100 times and watch the line settle. Is your experimental P(heads) within 0.05 of the theoretical value?",
      icon: "🪙",
      kind: 'coin', outcomes: ['H', 'T'], event: 'H', eventName: 'heads', theory: 0.5, minTrials: 100,
      hint: "A fair coin has 2 equally likely outcomes, so the theoretical P(heads) = 1/2 = 0.5. Experimental P = heads ÷ flips."
    },
    {
      id: 2,
      title: "Activity 2: Roll a Six",
      desc: "Roll the die at least 120 times. Find your experimental P(six) and check whether it is within 0.05 of the theory, 1/6.",
      icon: "🎲",
      kind: 'die', outcomes: [1, 2, 3, 4, 5, 6], event: 6, eventName: 'a six', theory: 1 / 6, minTrials: 120,
      hint: "Theoretical P(6) = 1/6 ≈ 0.17. Experimental P = number of sixes ÷ number of rolls. You can type a fraction like 1/6."
    },
    {
      id: 3,
      title: "Activity 3: The Gold Spinner",
      desc: "3 of the spinner's 8 equal sections are gold. Spin at least 200 times. Is your experimental P(gold) within 0.05 of 3/8?",
      icon: "🌀",
      kind: 'spinner', outcomes: ['Gold', 'Blue', 'Gold', 'Pink', 'Gold', 'Green', 'Purple', 'Blue'], event: 'Gold', eventName: 'gold', theory: 3 / 8, minTrials: 200,
      hint: "3 of the 8 equal sections are gold, so theoretical P(gold) = 3/8 = 0.375. Experimental P = golds ÷ spins."
    }
  ],
  2: [
    {
      id: 1,
      title: "Activity 1: Spinner Survey",
      desc: "Emma spun a spinner 20 times. Tap every result to tally it, then find the relative frequency of BLUE and predict the blues in 100 spins.",
      icon: "🎡",
      cats: ['Red', 'Blue', 'Green'], colors: [COLORS.Red, COLORS.Blue, COLORS.Green],
      raw: seeded({ Red: 8, Blue: 7, Green: 5 }, 11),
      target: 'Blue', future: 100,
      done: "🎉 Blue: 7 out of 20 = 0.35. In 100 spins, expect about 0.35 × 100 = 35 blues!",
      hint: "Relative frequency = 7 ÷ 20. Prediction = relative frequency × 100."
    },
    {
      id: 2,
      title: "Activity 2: Marble Draws",
      desc: "Jack drew a marble from a bag 24 times, putting it back each time. Tally the draws, then predict how many REDS he will get in 120 draws.",
      icon: "🔮",
      cats: ['Red', 'Yellow', 'Blue', 'Green'], colors: [COLORS.Red, COLORS.Yellow, COLORS.Blue, COLORS.Green],
      raw: seeded({ Red: 6, Yellow: 9, Blue: 5, Green: 4 }, 29),
      target: 'Red', future: 120,
      done: "🎉 Red: 6 out of 24 = 0.25. In 120 draws, expect about 0.25 × 120 = 30 reds!",
      hint: "Relative frequency = 6 ÷ 24. Prediction = relative frequency × 120."
    },
    {
      id: 3,
      title: "Activity 3: Mia's Penalty Kicks",
      desc: "Mia recorded 30 penalty kicks: Goal, Saved or Missed. Tally them, then predict how many GOALS she will score in her next 50 kicks.",
      icon: "⚽",
      cats: ['Goal', 'Saved', 'Missed'], colors: [COLORS.Green, COLORS.Blue, COLORS.Red],
      raw: seeded({ Goal: 18, Saved: 8, Missed: 4 }, 47),
      target: 'Goal', future: 50,
      done: "🎉 Goals: 18 out of 30 = 0.6. In 50 kicks, expect about 0.6 × 50 = 30 goals!",
      hint: "Relative frequency = 18 ÷ 30. Prediction = relative frequency × 50."
    }
  ],
  3: [
    {
      id: 1,
      title: "Activity 1: The Lucky Coin Case",
      desc: "Oliver says his coin is lucky because it landed heads 104 times in 200 flips. Compare with a fair coin and give your verdict.",
      icon: "🪙",
      sets: [{ name: '200 flips', labels: ['Heads', 'Tails'], freqs: [104, 96] }],
      suspect: 0, theory: 0.5,
      fields: [['exp', 'Expected heads if fair', 100], ['rf', 'Relative freq. of heads', 0.52]],
      verdict: 'Fair',
      done: "🎉 Fair! 104 ÷ 200 = 0.52, very close to 0.5. A small difference like this is normal.",
      hint: "Expected = 0.5 × 200. Relative frequency = 104 ÷ 200. Is it close to 0.5?"
    },
    {
      id: 2,
      title: "Activity 2: The Suspicious Die",
      desc: "A game die was rolled 600 times. Look at how often each number came up. Is this die fair or biased?",
      icon: "🎲",
      sets: [{ name: '600 rolls', labels: ['1', '2', '3', '4', '5', '6'], freqs: [85, 84, 83, 86, 82, 180] }],
      suspect: 5, theory: 1 / 6,
      fields: [['exp', 'Expected sixes if fair', 100], ['rf', 'Relative freq. of six', 0.3]],
      verdict: 'Biased',
      done: "🎉 Biased! 180 ÷ 600 = 0.3, nearly double 1/6 ≈ 0.17 — far too many sixes.",
      hint: "Expected = 1/6 × 600. Relative frequency of six = 180 ÷ 600. Compare with 1/6 ≈ 0.17."
    },
    {
      id: 3,
      title: "Activity 3: Small Sample Trap",
      desc: "Leo spun a 4-colour spinner 8 times, got 4 reds and cried 'Biased!'. Then he spun it 800 times. Switch between the two data sets, then judge using the bigger one.",
      icon: "🌀",
      sets: [
        { name: '8 spins', labels: ['Red', 'Blue', 'Green', 'Yellow'], freqs: [4, 1, 2, 1] },
        { name: '800 spins', labels: ['Red', 'Blue', 'Green', 'Yellow'], freqs: [206, 197, 195, 202] }
      ],
      suspect: 0, theory: 0.25, judgeSet: 1,
      fields: [['exp', 'Expected reds in 800 if fair', 200], ['rf', 'Relative freq. of red (800 spins)', 0.2575]],
      verdict: 'Fair',
      done: "🎉 Fair! 206 ÷ 800 ≈ 0.26, close to 0.25. 8 spins were just too few — more trials give better estimates!",
      hint: "Use the 800-spin data. Expected = 0.25 × 800. Relative frequency = 206 ÷ 800 ≈ 0.26."
    }
  ]
};

export function SimulatePhase({ muted, onNext }) {
  const [station, setStation] = useState(1);
  const [actIdx, setActIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Station 1
  const [trials, setTrials] = useState([]);
  const [last, setLast] = useState(null);
  const [spinTurn, setSpinTurn] = useState(0);
  const [ans1, setAns1] = useState({});
  const [ok1, setOk1] = useState({});
  const [pick1, setPick1] = useState(null);

  // Station 2
  const [tallied, setTallied] = useState([]);
  const [ans2, setAns2] = useState({});
  const [ok2, setOk2] = useState({});

  // Station 3
  const [setIdx, setSetIdx] = useState(0);
  const [showFair, setShowFair] = useState(false);
  const [seen3, setSeen3] = useState({});
  const [ans3, setAns3] = useState({});
  const [ok3, setOk3] = useState({});
  const [pick3, setPick3] = useState(null);

  const currentGuidance = SIMULATE_GUIDANCE[station][actIdx];
  const currentActivity = {
    ...STATION_ACTIVITIES[station][actIdx],
    desc: currentGuidance.desc,
    hint: currentGuidance.hint
  };
  const say = list => narrate(list, !muted);
  const lastNarratedStationRef = useRef(null);

  useEffect(() => {
    setShowHint(false);
    setFeedback(null);
    setTrials([]);
    setLast(null);
    setAns1({});
    setOk1({});
    setPick1(null);
    setTallied([]);
    setAns2({});
    setOk2({});
    setSetIdx(0);
    setShowFair(false);
    setSeen3({ 0: true });
    setAns3({});
    setOk3({});
    setPick3(null);
  }, [station, actIdx]);

  useEffect(() => {
    const isNewStation = lastNarratedStationRef.current !== station;
    lastNarratedStationRef.current = station;
    say(simulateActivityNarration(station, actIdx, isNewStation));
    return () => stopNarration();
  }, [station, actIdx, muted]);

  /* ---------- Station 1: Trial Lab ---------- */
  const s1 = station === 1 ? currentActivity : null;
  const n1 = trials.length;
  const f1 = s1 ? trials.filter(t => t === s1.event).length : 0;
  const rf1 = n1 ? f1 / n1 : 0;
  const enough1 = s1 ? n1 >= s1.minTrials : false;
  const points1 = [];
  if (s1) {
    let c = 0;
    const step = Math.max(1, Math.ceil(n1 / 300));
    trials.forEach((t, i) => { if (t === s1.event) c++; if ((i + 1) % step === 0 || i === n1 - 1) points1.push([i + 1, c / (i + 1)]); });
  }
  const maxN1 = s1 ? Math.max(s1.minTrials, Math.ceil(n1 / 50) * 50) : 100;
  const runTrials = k => {
    const o = s1.outcomes;
    const add = [];
    let li = 0;
    for (let i = 0; i < k; i++) { li = Math.floor(Math.random() * o.length); add.push(o[li]); }
    setTrials(t => (t.length + k > 2000 ? t : [...t, ...add]));
    setLast(add[add.length - 1]);
    if (s1.kind === 'spinner') setSpinTurn(r => r + 720 + (li + 0.5) * (360 / o.length) - (r % 360));
    setFeedback(null);
  };
  const closeAns1 = Math.abs(rf1 - (s1 ? s1.theory : 0)) <= 0.05 ? 'Close' : 'Far';
  const check1 = () => {
    const ok = { exp: n1 > 0 && near(ans1.exp, rf1, 0.0051), theo: near(ans1.theo, s1.theory) };
    setOk1(ok);
    const choiceOk = pick1 === closeAns1;
    if (enough1 && ok.exp && ok.theo && choiceOk) {
      setFeedback({ success: true, text: `🎉 ${f1} ÷ ${n1} = ${dec(rf1)}. Theory says ${dec(s1.theory)}. ${closeAns1 === 'Close' ? 'Lots of trials → close to the theory!' : 'Keep going — more trials usually bring it closer!'}` });
      say(feedbackNarration.splitDone());
    } else {
      setFeedback({ success: false, text: !enough1 ? `Run at least ${s1.minTrials} trials first (you have ${n1}).` : !ok.exp ? `Experimental P = ${s1.eventName} ÷ trials = ${f1} ÷ ${n1}. Round to 2 decimal places.` : !ok.theo ? 'Check the theoretical probability: favourable outcomes ÷ total outcomes.' : `Is ${dec(rf1)} within 0.05 of ${dec(s1.theory)}? Pick a button.` });
      say(feedbackNarration.tryAgain());
    }
  };

  /* ---------- Station 2: Data Desk ---------- */
  const s2 = station === 2 ? currentActivity : null;
  const freqs2 = s2 ? s2.cats.map(c => tallied.filter(i => s2.raw[i] === c).length) : [];
  const allTallied = s2 ? tallied.length === s2.raw.length : false;
  const tf2 = s2 ? s2.raw.filter(r => r === s2.target).length : 0;
  const rf2 = s2 ? tf2 / s2.raw.length : 0;
  const fields2 = s2 ? [['f', `Frequency of ${s2.target.toLowerCase()}`, tf2], ['rf', `Relative frequency of ${s2.target.toLowerCase()}`, rf2], ['pred', `Predicted ${s2.target.toLowerCase()}s in ${s2.future}`, rf2 * s2.future]] : [];
  const tap = i => { if (!tallied.includes(i)) { setTallied(t => [...t, i]); setFeedback(null); } };
  const tallyRest = () => { setTallied(s2.raw.map((_, i) => i)); setFeedback(null); };
  const check2 = () => {
    const ok = {};
    fields2.forEach(([k, , v]) => { ok[k] = near(ans2[k], v); });
    setOk2(ok);
    if (allTallied && Object.values(ok).every(Boolean)) {
      setFeedback({ success: true, text: s2.done });
      say(feedbackNarration.buildDone());
    } else {
      setFeedback({ success: false, text: !allTallied ? `Tally every result first — ${s2.raw.length - tallied.length} left to tap.` : 'Check the red boxes. Relative frequency = frequency ÷ total; prediction = relative frequency × trials.' });
      say(feedbackNarration.tryAgain());
    }
  };

  /* ---------- Station 3: Fairness Court ---------- */
  const s3 = station === 3 ? currentActivity : null;
  const set3 = s3 ? s3.sets[setIdx] : null;
  const total3 = set3 ? set3.freqs.reduce((a, b) => a + b, 0) : 0;
  const needsBoth = s3 ? s3.sets.length > 1 : false;
  const check3 = () => {
    const ok = {};
    s3.fields.forEach(([k, , v]) => { ok[k] = near(ans3[k], v); });
    setOk3(ok);
    const viewed = !needsBoth || (seen3[0] && seen3[1]);
    if (viewed && Object.values(ok).every(Boolean) && pick3 === s3.verdict) {
      setFeedback({ success: true, text: s3.done });
      say(feedbackNarration.reverseDone());
    } else {
      setFeedback({ success: false, text: !viewed ? 'Look at both data sets first — switch to the 800 spins.' : !Object.values(ok).every(Boolean) ? 'Check the red boxes. Expected = theoretical P × trials; relative frequency = frequency ÷ trials.' : !pick3 ? 'Now give your verdict: Fair or Biased?' : 'Compare the relative frequency with the theoretical probability again. Is the difference small or large?' });
      say(feedbackNarration.tryAgain());
    }
  };

  /* ---------- Navigation ---------- */
  const nextActivity = () => {
    if (actIdx < 2) {
      setActIdx(i => i + 1);
    } else if (station < 3) {
      setStation(s => s + 1);
      setActIdx(0);
    } else {
      onNext();
    }
  };

  const prevActivity = () => {
    if (actIdx > 0) {
      setActIdx(i => i - 1);
    } else if (station > 1) {
      setStation(s => s - 1);
      setActIdx(2);
    }
  };

  const STATIONS = [
    { n: 1, icon: '🧪', name: 'Station 1: Trial Lab', sub: 'Run trials & watch' },
    { n: 2, icon: '📊', name: 'Station 2: Data Desk', sub: 'Tally, analyse, predict' },
    { n: 3, icon: '⚖️', name: 'Station 3: Fairness Court', sub: 'Fair or biased?' }
  ];

  const inputCls = ok =>
    `bg-[#14082c] border-2 rounded-xl px-3 py-2 text-white font-display font-900 text-base text-center outline-none w-24 shadow-inner ${
      ok === true ? 'border-emerald-400' : ok === false ? 'border-rose-400' : 'border-cyan-400/70 focus:border-amber-400'
    }`;

  const toggleHint = () => {
    setShowHint(prev => {
      const next = !prev;
      if (next) {
        say(simulateHintNarration(station, actIdx));
      } else {
        stopNarration();
      }
      return next;
    });
  };

  const hintBtn = (
    <button
      onClick={toggleHint}
      className="bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-purple-200 font-display font-900 text-xs px-3 py-2 rounded-xl transition cursor-pointer"
    >
      💡 Hint
    </button>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {/* Main Simulation Stations Glass Card Container */}
      <div className="w-full max-w-6xl max-h-[94vh] bg-[#160b36]/95 border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col items-center fade-in-up z-20 my-auto overflow-hidden">
        {/* Cyan Accent Bar */}
        <div className="w-24 h-2 bg-cyan-400 rounded-full mb-2.5 shadow-[0_0_18px_rgba(56,189,248,0.85)] shrink-0" />

        {/* Card Header Title */}
        <h2 className="font-display font-900 text-2xl sm:text-3xl text-white flex items-center gap-3 mb-1.5 shrink-0">
          <span className="text-3xl sm:text-4xl">🧪</span>
          <span>Simulation Stations</span>
        </h2>
        <p className="text-cyan-200/90 text-xs sm:text-sm font-bold text-center mb-3 shrink-0 max-w-3xl">
          {SIMULATE[station]}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 w-full items-stretch flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Station Sidebar Tabs */}
          <div className="md:col-span-4 flex flex-col justify-between gap-3 shrink-0">
            <div className="flex flex-col gap-3.5">
              {STATIONS.map(s => (
                <button
                  key={s.n}
                  onClick={() => {
                    setStation(s.n);
                    setActIdx(0);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                    station === s.n
                      ? 'border-cyan-400 bg-[#1e2852] text-white shadow-[0_0_22px_rgba(56,189,248,0.4)] scale-[1.02]'
                      : 'border-purple-500/25 bg-[#13082b]/80 text-slate-300 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${
                      station === s.n ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/10 text-white'
                    }`}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="font-display font-900 text-base sm:text-lg leading-tight">{s.name}</p>
                      <p className="text-xs font-extrabold text-slate-300 mt-0.5">{s.sub}</p>
                    </div>
                  </div>
                  <span className="text-base">🔓</span>
                </button>
              ))}
            </div>

            {/* Bottom Left CTA Button */}
            <button
              onClick={onNext}
              className="btn-gold font-display font-900 text-base sm:text-lg py-4 px-6 shadow-[0_0_25px_rgba(250,204,21,0.65)] hover:scale-105 transition mt-2 w-full flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Go to Practice Phase!</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Column: Interactive Simulation Box */}
          <div className="md:col-span-8 bg-[#13092e]/95 border-2 border-purple-400/35 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-inner flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 justify-between">
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3 shrink-0 gap-3">
                <h3 className="font-display font-900 text-xl sm:text-2xl text-cyan-300 flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{currentActivity.icon}</span>
                  <span>{currentActivity.title}</span>
                </h3>
                <span className="font-display font-900 text-xs sm:text-sm text-slate-200 bg-white/10 px-4 py-1 rounded-full border border-white/15 shrink-0">
                  Activity {actIdx + 1} of 3
                </span>
              </div>

              {/* Activity Description */}
              <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-extrabold mb-3 shrink-0">
                {currentActivity.desc}
              </p>


              {/* ===================== STATION 1: TRIAL LAB ===================== */}
              {station === 1 && (
                <div className="flex gap-4 bg-[#1e1342]/95 border-2 border-cyan-400/40 rounded-2xl p-3 sm:p-4 shadow-xl flex-1 min-h-0">
                  <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-2 overflow-y-auto">
                    <div className="flex items-center justify-between shrink-0 gap-2 flex-wrap">
                      <span className={`rounded-full px-3 py-1 border text-xs font-900 ${enough1 ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200' : 'bg-[#14082c] border-white/10 text-sky-200'}`}>{enough1 ? '✔' : '🎯'} Trials: {n1} / {s1.minTrials}+</span>
                      <span className="bg-[#14082c] rounded-full px-3 py-1 border border-pink-400/50 text-xs font-900 text-pink-300">{s1.eventName}: {f1} → {n1 ? `${f1}/${n1} ≈ ${rf1.toFixed(2)}` : '—'}</span>
                    </div>
                    <div className="flex gap-2 flex-1 min-h-[100px] items-stretch">
                      <svg viewBox="0 0 110 110" className="hidden xl:block w-28 shrink-0 self-center">
                        {s1.kind === 'coin' && (last ? <Coin key={n1} face={last} cx={55} cy={55} r={40} /> : <Coin face="?" cx={55} cy={55} r={40} />)}
                        {s1.kind === 'die' && <Die key={n1} value={last || 0} x={15} y={15} s={80} hot={last === 6} />}
                        {s1.kind === 'spinner' && <Spinner sectors={s1.outcomes} cx={55} cy={55} r={48} pointer={spinTurn} />}
                      </svg>
                      <svg viewBox="0 0 360 192" className="flex-1 min-w-0 min-h-[110px]">
                        <RFLine points={points1} theory={s1.theory} maxN={maxN1} x={34} y={10} w={316} h={150} label={`P(${s1.eventName}) so far`} />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-2 shrink-0 flex-wrap">
                      {[1, 10, 100].map(k => (
                        <button key={k} onClick={() => runTrials(k)} className={`h-9 px-4 rounded-xl border-2 text-sm font-900 cursor-pointer ${k === 1 ? 'bg-amber-400 hover:bg-amber-300 border-amber-200 text-slate-950' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'}`}>
                          {s1.kind === 'coin' ? 'Flip' : s1.kind === 'die' ? 'Roll' : 'Spin'} ×{k}
                        </button>
                      ))}
                      <button onClick={() => { setTrials([]); setLast(null); setFeedback(null); }} className="h-9 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-400/40 text-rose-200 text-xs font-900 cursor-pointer">↺ Reset</button>
                    </div>
                  </div>

                  <div className="w-60 sm:w-64 shrink-0 flex flex-col gap-1 min-h-0 overflow-y-auto">
                    {[['exp', `Experimental P (2 d.p.)`], ['theo', `Theoretical P`]].map(([k, lab]) => (
                      <div key={k} className="bg-[#14082c] rounded-xl px-2 py-1 border-2 border-amber-400/40 flex items-center gap-2">
                        <span className="text-xs font-900 text-amber-300 flex-1 leading-tight">{lab}</span>
                        <input type="text" inputMode="decimal" value={ans1[k] ?? ''} onChange={e => setAns1(a => ({ ...a, [k]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && check1()} className={inputCls(ok1[k]) + ' !w-20 !py-0.5'} />
                      </div>
                    ))}
                    <div className="flex gap-1">
                      {['Close', 'Far'].map(o => (
                        <button key={o} onClick={() => { setPick1(o); setFeedback(null); }} className={`flex-1 px-2 py-1 rounded-lg border-2 text-[11px] font-900 cursor-pointer ${pick1 === o ? 'bg-amber-400 text-slate-950 border-amber-200' : 'bg-white/5 text-white border-white/20'}`}>{o === 'Close' ? '🎯 Within 0.05' : '↔️ More than 0.05'}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={check1} className="btn-gold flex-1 text-sm font-900 px-3 py-1.5">Check ✨</button>
                      {hintBtn}
                    </div>
                  </div>
                </div>
              )}

              {/* ===================== STATION 2: DATA DESK ===================== */}
              {station === 2 && (
                <div className="flex gap-4 bg-[#1e1342]/95 border-2 border-cyan-400/40 rounded-2xl p-3 sm:p-4 shadow-xl flex-1 min-h-0">
                  <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-2 overflow-y-auto">
                    <div className="flex items-center justify-between shrink-0 gap-2 flex-wrap">
                      <span className="bg-[#14082c] rounded-full px-3 py-1 border border-white/10 text-xs font-900 text-sky-200">{s2.icon} Tap each result to tally it</span>
                      <span className={`rounded-full px-3 py-1 border text-xs font-900 ${allTallied ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200' : 'bg-[#14082c] border-amber-400/50 text-amber-300'}`}>Tallied {tallied.length} / {s2.raw.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center shrink-0">
                      {s2.raw.map((r, i) => {
                        const done = tallied.includes(i);
                        const col = s2.colors[s2.cats.indexOf(r)];
                        return (
                          <button key={i} onClick={() => tap(i)} disabled={done} title={r}
                            className={`w-6 h-6 rounded-full border-2 text-[9px] font-900 flex items-center justify-center transition ${done ? 'opacity-25 scale-90 cursor-default' : 'cursor-pointer hover:scale-110 shadow-md'}`}
                            style={{ background: col, borderColor: done ? 'transparent' : '#ffffff', color: '#0c0424' }}>
                            {done ? '✓' : r[0]}
                          </button>
                        );
                      })}
                    </div>
                    <svg viewBox="0 0 360 180" className="w-full flex-1 min-h-[110px]">
                      <FreqBars labels={s2.cats} freqs={freqs2} colors={s2.colors} max={Math.max(...s2.cats.map(c => s2.raw.filter(r => r === c).length))} highlight={s2.cats.indexOf(s2.target)} x={34} y={14} w={316} h={146} />
                    </svg>
                    {!allTallied && tallied.length >= 8 && (
                      <button onClick={tallyRest} className="self-center h-8 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-900 cursor-pointer shrink-0">⚡ Tally the rest</button>
                    )}
                  </div>

                  <div className="w-60 sm:w-64 shrink-0 flex flex-col gap-1 min-h-0 overflow-y-auto">
                    {fields2.map(([k, lab]) => (
                      <div key={k} className="bg-[#14082c] rounded-xl px-2 py-1 border-2 border-amber-400/40 flex items-center gap-2">
                        <span className="text-xs font-900 text-amber-300 flex-1 leading-tight">{lab}</span>
                        <input type="text" inputMode="decimal" value={ans2[k] ?? ''} onChange={e => setAns2(a => ({ ...a, [k]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && check2()} className={inputCls(ok2[k]) + ' !w-20 !py-0.5'} />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button onClick={check2} className="btn-gold flex-1 text-sm font-900 px-3 py-1.5">Check ✨</button>
                      {hintBtn}
                    </div>
                  </div>
                </div>
              )}

              {/* ===================== STATION 3: FAIRNESS COURT ===================== */}
              {station === 3 && (
                <div className="flex gap-4 bg-[#1e1342]/95 border-2 border-cyan-400/40 rounded-2xl p-3 sm:p-4 shadow-xl flex-1 min-h-0">
                  <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-2 overflow-y-auto">
                    <div className="flex items-center justify-between shrink-0 gap-2 flex-wrap">
                      {s3.sets.length > 1 ? (
                        <div className="flex gap-1">
                          {s3.sets.map((st, i) => (
                            <button key={i} onClick={() => { setSetIdx(i); setSeen3(v => ({ ...v, [i]: true })); setFeedback(null); }} className={`px-3 py-1 rounded-full border-2 text-xs font-900 cursor-pointer ${setIdx === i ? 'bg-cyan-400 text-slate-950 border-cyan-200' : 'bg-[#14082c] text-white border-white/20'}`}>📋 {st.name}</button>
                          ))}
                        </div>
                      ) : (
                        <span className="bg-[#14082c] rounded-full px-3 py-1 border border-white/10 text-xs font-900 text-sky-200">{s3.icon} Evidence: {set3.name}</span>
                      )}
                      <button onClick={() => setShowFair(v => !v)} className={`rounded-full px-3 py-1 border-2 text-xs font-900 cursor-pointer ${showFair ? 'bg-amber-400 text-slate-950 border-amber-200' : 'bg-[#14082c] border-amber-400/50 text-amber-300'}`}>
                        {showFair ? '✔ Fair line shown' : '⚖️ Show “expected if fair”'}
                      </button>
                    </div>
                    <svg viewBox="0 0 360 186" className="w-full flex-1 min-h-[110px]">
                      <FreqBars key={setIdx} labels={set3.labels} freqs={set3.freqs} expected={showFair ? s3.theory * total3 : null} highlight={s3.suspect} x={34} y={18} w={316} h={146} />
                    </svg>
                    <p className="text-[11px] font-900 text-slate-300 text-center shrink-0">Total trials: {total3} · fair chance of each result: {s3.theory === 1 / 6 ? '1/6' : dec(s3.theory)}</p>
                  </div>

                  <div className="w-60 sm:w-64 shrink-0 flex flex-col gap-1 min-h-0 overflow-y-auto">
                    {s3.fields.map(([k, lab]) => (
                      <div key={k} className="bg-[#14082c] rounded-xl px-2 py-1 border-2 border-amber-400/40 flex items-center gap-2">
                        <span className="text-xs font-900 text-amber-200 flex-1 leading-tight">{lab}</span>
                        <input type="text" inputMode="decimal" value={ans3[k] ?? ''} onChange={e => setAns3(a => ({ ...a, [k]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && check3()} className={inputCls(ok3[k]) + ' !w-20 !py-0.5'} />
                      </div>
                    ))}
                    <p className="text-xs font-900 text-cyan-300 uppercase tracking-wider">② Your verdict</p>
                    <div className="flex gap-1">
                      {['Fair', 'Biased'].map(o => (
                        <button key={o} onClick={() => { setPick3(o); setFeedback(null); }} className={`flex-1 px-2 py-1.5 rounded-lg border-2 text-xs font-900 cursor-pointer ${pick3 === o ? 'bg-amber-400 text-slate-950 border-amber-200' : 'bg-white/5 text-white border-white/20'}`}>{o === 'Fair' ? '⚖️ Fair' : '🎯 Biased'}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={check3} className="btn-gold flex-1 text-sm font-900 px-3 py-1.5">Check ✨</button>
                      {hintBtn}
                    </div>
                  </div>
                </div>
              )}

              {/* Hint + feedback strip */}
              {showHint && (
                <div className="p-2.5 mt-2 bg-amber-950/90 border border-amber-400/50 text-amber-200 rounded-xl text-xs sm:text-sm font-bold w-full text-center fade-in-up shrink-0">
                  💡 {currentActivity.hint}
                </div>
              )}
              {feedback && (
                <div className={`p-2.5 mt-2 rounded-2xl text-sm font-900 w-full text-center shadow-xl shrink-0 fade-in-up ${
                  feedback.success ? 'bg-emerald-950/90 text-emerald-300 border-2 border-emerald-400/60' : 'bg-rose-950/90 text-rose-300 border-2 border-rose-400/60'
                }`}>
                  {feedback.text}
                </div>
              )}
            </div>

            {/* Bottom Activity Step Buttons */}
            <div className="flex items-center justify-between border-t border-white/15 pt-3 mt-3 shrink-0">
              <button
                onClick={prevActivity}
                disabled={station === 1 && actIdx === 0}
                className="bg-[#1c0d3a]/90 hover:bg-[#2c1859] border-2 border-white/25 text-white font-display font-900 text-sm sm:text-base px-6 py-2.5 rounded-full cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
              >
                ← Previous Activity
              </button>

              <button
                onClick={nextActivity}
                className="btn-gold text-sm sm:text-base font-900 px-8 py-2.5 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <span>{station === 3 && actIdx === 2 ? 'Go to Practice Phase' : 'Next Activity'}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
