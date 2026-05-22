const UNITS = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载'];
const BASE = 10000;

export function formatNumber(v) {
  const value = Math.floor(v);
  if (value < BASE) return String(value);
  let n = value;
  let idx = 0;
  while (n >= BASE && idx < UNITS.length - 1) {
    n /= BASE;
    idx++;
  }
  return (n < 10 ? n.toFixed(1) : String(Math.floor(n))) + UNITS[idx];
}

export function formatPercent(v) {
  return Math.floor(v * 100) + '%';
}
