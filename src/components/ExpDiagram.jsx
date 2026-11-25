import React from 'react';

/* =========================================================================
   EXPERIMENTAL PROBABILITY DRAWINGS — coins, dice, spinners, frequency bar
   charts (with an optional "expected if fair" line), tally / frequency
   tables and a relative-frequency-vs-trials line graph.
   Used by the Wonder card, the simulation stations and every practice question.
   ========================================================================= */
export const COLORS = {
  Red: '#f87171', Blue: '#38bdf8', Green: '#4ade80', Yellow: '#facc15',
  Purple: '#c084fc', Gold: '#fbbf24', Grey: '#94a3b8', Pink: '#f472b6', Orange: '#fb923c'
};
const BAR_COLS = ['#38bdf8', '#f472b6', '#4ade80', '#facc15', '#c084fc', '#fb923c'];

export const dec = v => {
  const r = Math.round(v * 1000) / 1000;
  return String(r);
};

const polar = (cx, cy, r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];

export function Coin({ face, cx, cy, r = 20, dim = false }) {
  return (
    <g opacity={dim ? 0.35 : 1}>
      <circle cx={cx} cy={cy} r={r} fill={face === 'H' ? '#facc15' : '#cbd5e1'} stroke={face === 'H' ? '#fde68a' : '#f1f5f9'} strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="#0c0424" strokeOpacity="0.25" strokeWidth="2" />
      <text x={cx} y={cy + 1} fill="#0c0424" fontSize={r * 0.95} fontWeight="900" textAnchor="middle" dominantBaseline="middle">{face}</text>
    </g>
  );
}

const PIPS = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]
};

export function Die({ value, x, y, s = 40, hot = false }) {
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx={s * 0.18} fill={hot ? '#facc15' : '#f8fafc'} stroke={hot ? '#fde68a' : '#cbd5e1'} strokeWidth="3" />
      {(PIPS[value] || []).map(([dx, dy], i) => (
        <circle key={i} cx={x + s / 2 + dx * s * 0.26} cy={y + s / 2 + dy * s * 0.26} r={s * 0.085} fill="#0c0424" />
      ))}
    </g>
  );
}

/** Spinner with equal sectors; `sectors` is a list of colour names. */
export function Spinner({ sectors, cx = 60, cy = 60, r = 50, pointer = 0 }) {
  const n = sectors.length;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 5} fill="#0c0424" stroke="#e2e8f0" strokeWidth="3" />
      {sectors.map((s, i) => {
        const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI;
        const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
        return <path key={i} d={`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={COLORS[s] || s} fillOpacity="0.9" stroke="#0c0424" strokeWidth="2" />;
      })}
      <g style={{ transform: `rotate(${pointer}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
        <polygon points={`${cx},${cy - r + 4} ${cx - 6},${cy} ${cx + 6},${cy}`} fill="#ffffff" stroke="#0c0424" strokeWidth="1.5" />
      </g>
      <circle cx={cx} cy={cy} r="7" fill="#ffffff" stroke="#0c0424" strokeWidth="2" />
    </g>
  );
}

/**
 * Frequency bar chart. `expected` draws a dashed "expected if fair" line.
 * Draws inside the box (x, y, w, h).
 */
export function FreqBars({ labels, freqs, colors, expected = null, max = null, x = 30, y = 14, w = 316, h = 150, highlight = null, showValues = true }) {
  const top = Math.max(max || 0, ...freqs, expected || 0, 1);
  const n = labels.length;
  const slot = w / n;
  const bw = Math.min(54, slot * 0.66);
  const Y = v => y + h - (v / top) * h;
  const ticks = [0, top / 2, top].map(v => Math.round(v));
  return (
    <g>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={x} x2={x + w} y1={Y(t)} y2={Y(t)} stroke="#ffffff" strokeOpacity="0.1" />
          <text x={x - 5} y={Y(t)} fill="#94a3b8" fontSize="9" fontWeight="800" textAnchor="end" dominantBaseline="middle">{t}</text>
        </g>
      ))}
      <line x1={x} x2={x + w} y1={y + h} y2={y + h} stroke="#e2e8f0" strokeWidth="2" />
      {labels.map((l, i) => {
        const cx = x + slot * i + slot / 2;
        const f = freqs[i];
        const col = (colors && colors[i]) || COLORS[l] || BAR_COLS[i % BAR_COLS.length];
        const hl = highlight == null || highlight === i;
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={Y(f)} width={bw} height={Math.max(0, y + h - Y(f))} rx="4" fill={col} fillOpacity={hl ? 0.9 : 0.35}
              style={{ transition: 'y 0.35s ease, height 0.35s ease' }} />
            {showValues && <text x={cx} y={Y(f) - 7} fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">{f}</text>}
            <text x={cx} y={y + h + 13} fill="#e2e8f0" fontSize="10.5" fontWeight="900" textAnchor="middle">{l}</text>
          </g>
        );
      })}
      {expected != null && (
        <g>
          <line x1={x} x2={x + w} y1={Y(expected)} y2={Y(expected)} stroke="#facc15" strokeWidth="2.5" strokeDasharray="7 5" />
          <rect x={x + w - 92} y={Y(expected) - 17} width="92" height="14" rx="7" fill="#0c0424" fillOpacity="0.85" />
          <text x={x + w - 46} y={Y(expected) - 9.5} fill="#facc15" fontSize="9" fontWeight="900" textAnchor="middle" dominantBaseline="middle">expected if fair: {dec(expected)}</text>
        </g>
      )}
    </g>
  );
}

/** Relative frequency of one event against the number of trials. */
export function RFLine({ points, theory, maxN = 100, x = 34, y = 12, w = 312, h = 150, label = 'relative frequency' }) {
  const X = n => x + (n / Math.max(1, maxN)) * w;
  const Y = p => y + h - p * h;
  const path = points.map(([n, p], i) => `${i ? 'L' : 'M'}${X(n).toFixed(1)} ${Y(p).toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  return (
    <g>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <g key={p}>
          <line x1={x} x2={x + w} y1={Y(p)} y2={Y(p)} stroke="#ffffff" strokeOpacity="0.1" />
          <text x={x - 5} y={Y(p)} fill="#94a3b8" fontSize="9" fontWeight="800" textAnchor="end" dominantBaseline="middle">{p}</text>
        </g>
      ))}
      <line x1={x} x2={x} y1={y} y2={y + h} stroke="#e2e8f0" strokeWidth="2" />
      <line x1={x} x2={x + w} y1={y + h} y2={y + h} stroke="#e2e8f0" strokeWidth="2" />
      {[0, 0.5, 1].map(f => (
        <text key={f} x={x + f * w} y={y + h + 12} fill="#94a3b8" fontSize="9" fontWeight="800" textAnchor="middle">{Math.round(f * maxN)}</text>
      ))}
      <text x={x + w / 2} y={y + h + 24} fill="#cbd5e1" fontSize="9.5" fontWeight="900" textAnchor="middle">number of trials</text>
      {theory != null && (
        <g>
          <line x1={x} x2={x + w} y1={Y(theory)} y2={Y(theory)} stroke="#facc15" strokeWidth="2.5" strokeDasharray="7 5" />
          <text x={x + w - 2} y={Y(theory) - 7} fill="#facc15" fontSize="9.5" fontWeight="900" textAnchor="end">theoretical {dec(theory)}</text>
        </g>
      )}
      {points.length > 1 && <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round" />}
      {last && (
        <g>
          <circle cx={X(last[0])} cy={Y(last[1])} r="5" fill="#f472b6" stroke="#ffffff" strokeWidth="2" />
          <text x={x + 6} y={y + 8} fill="#7dd3fc" fontSize="9.5" fontWeight="900">{label}</text>
        </g>
      )}
    </g>
  );
}

/** Tally marks: groups of five (four strokes and a slash). */
export function Tally({ f, cx, cy, h = 16, maxW = 110 }) {
  const groups = Math.floor(f / 5), rest = f % 5;
  const gw = h * 1.05, sp = h * 0.24;
  const total = groups * gw + rest * sp;
  const k = total > maxW ? maxW / total : 1;
  let x0 = cx - (total * k) / 2;
  const out = [];
  for (let g = 0; g < groups; g++) {
    const gx = x0 + g * gw * k;
    for (let j = 0; j < 4; j++) out.push(<line key={`g${g}${j}`} x1={gx + j * sp * k} x2={gx + j * sp * k} y1={cy - h / 2} y2={cy + h / 2} stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />);
    out.push(<line key={`s${g}`} x1={gx - 2} x2={gx + 3 * sp * k + 2} y1={cy + h / 2 - 2} y2={cy - h / 2 + 2} stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round" />);
  }
  const rx = x0 + groups * gw * k;
  for (let j = 0; j < rest; j++) out.push(<line key={`r${j}`} x1={rx + j * sp * k} x2={rx + j * sp * k} y1={cy - h / 2} y2={cy + h / 2} stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />);
  return <g>{out}</g>;
}

/** Tally / frequency table. `hide` replaces one cell with "?". */
export function FreqTable({ labels, freqs, x = 20, y = 10, w = 320, title = 'Outcome', hideIndex = null, showRF = false, total = null }) {
  const rows = labels.length + 1;
  const rh = Math.min(30, 170 / (rows + 1));
  const cw = showRF ? [w * 0.32, w * 0.36, w * 0.32] : [w * 0.36, w * 0.4, w * 0.24];
  const head = showRF ? [title, 'Frequency', 'Rel. freq.'] : [title, 'Tally', 'Frequency'];
  const sum = total ?? freqs.reduce((a, b) => a + b, 0);
  return (
    <g>
      <rect x={x} y={y} width={w} height={rh * (rows + 1)} rx="10" fill="#140a35" stroke="#a78bfa" strokeOpacity="0.6" strokeWidth="2" />
      {head.map((t, i) => (
        <text key={i} x={x + cw.slice(0, i).reduce((a, b) => a + b, 0) + cw[i] / 2} y={y + rh / 2} fill="#7dd3fc" fontSize="11" fontWeight="900" textAnchor="middle" dominantBaseline="middle">{t}</text>
      ))}
      {labels.map((l, r) => {
        const yy = y + rh * (r + 1);
        const f = freqs[r];
        const cells = showRF ? [l, hideIndex === r ? '?' : String(f), hideIndex === r ? '?' : dec(f / sum)] : [l, hideIndex === r ? '?' : 'TALLY', hideIndex === r ? '?' : String(f)];
        return (
          <g key={r}>
            <line x1={x + 6} x2={x + w - 6} y1={yy} y2={yy} stroke="#ffffff" strokeOpacity="0.15" />
            {cells.map((c, i) => c === 'TALLY' ? (
              <Tally key={i} f={f} cx={x + cw[0] + cw[1] / 2} cy={yy + rh / 2} h={rh * 0.6} maxW={cw[1] - 10} />
            ) : (
              <text key={i} x={x + cw.slice(0, i).reduce((a, b) => a + b, 0) + cw[i] / 2} y={yy + rh / 2} fill={c === '?' ? '#f472b6' : i === 0 ? '#e2e8f0' : '#ffffff'} fontSize={i === 1 && !showRF ? 12 : 12} fontWeight="900" textAnchor="middle" dominantBaseline="middle">{c}</text>
            ))}
          </g>
        );
      })}
      <line x1={x + 6} x2={x + w - 6} y1={y + rh * rows} y2={y + rh * rows} stroke="#facc15" strokeOpacity="0.6" />
      <text x={x + cw[0] / 2} y={y + rh * rows + rh / 2} fill="#facc15" fontSize="11.5" fontWeight="900" textAnchor="middle" dominantBaseline="middle">Total</text>
      <text x={x + cw[0] + (showRF ? cw[1] / 2 : cw[1] + cw[2] / 2)} y={y + rh * rows + rh / 2} fill="#facc15" fontSize="12" fontWeight="900" textAnchor="middle" dominantBaseline="middle">{hideIndex === 'total' ? '?' : sum}</text>
      {showRF && <text x={x + cw[0] + cw[1] + cw[2] / 2} y={y + rh * rows + rh / 2} fill="#facc15" fontSize="12" fontWeight="900" textAnchor="middle" dominantBaseline="middle">1</text>}
    </g>
  );
}

/** Row of coin results, e.g. Leo's 10 flips. */
export function CoinRow({ faces, x = 20, y = 20, r = 15, gap = 4, perRow = 10 }) {
  return (
    <g>
      {faces.map((f, i) => (
        <Coin key={i} face={f} cx={x + r + (i % perRow) * (2 * r + gap)} cy={y + r + Math.floor(i / perRow) * (2 * r + gap)} r={r} />
      ))}
    </g>
  );
}

/** Students' results compared as horizontal bars of relative frequency. */
function Compare({ rows, theory }) {
  const x = 104, w = 232;
  return (
    <g>
      <line x1={x + theory * w} x2={x + theory * w} y1={8} y2={176} stroke="#facc15" strokeWidth="2.5" strokeDasharray="6 4" />
      <text x={x + theory * w} y={190} fill="#facc15" fontSize="10" fontWeight="900" textAnchor="middle">theory {dec(theory)}</text>
      {rows.map((r, i) => {
        const yy = 14 + i * (160 / rows.length);
        return (
          <g key={i}>
            <text x={x - 8} y={yy + 12} fill="#e2e8f0" fontSize="11" fontWeight="900" textAnchor="end" dominantBaseline="middle">{r.name}</text>
            <rect x={x} y={yy + 2} width={w} height="20" rx="6" fill="#ffffff" fillOpacity="0.06" />
            <text x={x + 6} y={yy + 12} fill="#ffffff" fontSize="10.5" fontWeight="900" dominantBaseline="middle">{r.f} out of {r.n}</text>
          </g>
        );
      })}
    </g>
  );
}

/** Generic practice diagram, drawn in a 360 × 200 box. */
export function ExpDiagram({ diagramData, size = 180 }) {
  if (!diagramData) return null;
  const d = diagramData;
  let body = null;
  if (d.type === 'bars') {
    body = <FreqBars labels={d.labels} freqs={d.freqs} expected={d.expected ?? null} highlight={d.highlight ?? null} x={40} y={22} w={300} h={142} />;
  } else if (d.type === 'table') {
    body = <FreqTable labels={d.labels} freqs={d.freqs} title={d.title || 'Outcome'} hideIndex={d.hide ?? null} x={30} y={6} w={300} total={d.total ?? null} />;
  } else if (d.type === 'coins') {
    body = (
      <g>
        <CoinRow faces={d.faces} x={180 - (Math.min(10, d.faces.length) * 34) / 2} y={60} r={15} />
        <text x="180" y="40" fill="#e2e8f0" fontSize="13" fontWeight="900" textAnchor="middle">{d.caption || ''}</text>
      </g>
    );
  } else if (d.type === 'spinner') {
    body = (
      <g>
        <Spinner sectors={d.sectors} cx={180} cy={100} r={82} pointer={25} />
      </g>
    );
  } else if (d.type === 'dice') {
    body = (
      <g>
        {[1, 2, 3, 4, 5, 6].map((v, i) => <Die key={v} value={v} x={36 + i * 50} y={78} s={40} hot={d.hot ? d.hot.includes(v) : false} />)}
      </g>
    );
  } else if (d.type === 'compare') {
    body = <Compare rows={d.rows} theory={d.theory} />;
  } else if (d.type === 'line') {
    body = <RFLine points={d.points} theory={d.theory} maxN={d.maxN} x={44} y={12} w={296} h={150} />;
  }
  return (
    <svg viewBox="0 0 360 200" style={{ height: size, width: 'auto', maxWidth: '100%' }}>
      {body}
    </svg>
  );
}
