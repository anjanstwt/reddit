const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

const shortUnits: Partial<Record<Intl.RelativeTimeFormatUnit, string>> = {
  year: 'y',
  month: 'mo',
  day: 'd',
  hour: 'h',
  minute: 'm',
};

export function timeAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  for (const [unit, size] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${shortUnits[unit]} ago`;
  }
  return 'just now';
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function compactNumber(n: number) {
  return compact.format(n);
}
