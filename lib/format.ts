const mxnFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export function fmtMXN(n: number): string {
  return mxnFormatter.format(Math.round(n));
}

export function fmtMXNCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

export function fmtPct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtDelta(n: number): string {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}pp`;
}

export function fmtSignedPct(n: number, digits = 1): string {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(digits)}%`;
}
