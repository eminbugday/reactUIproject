function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed * 9301 + offset * 49297 + 233) * 10000;
  return x - Math.floor(x);
}

export interface CreditData {
  ziraat: number;
  isBank: number;
  garanti: number;
  balance: number;
  hasHighBalance: boolean;
}

export function getCreditData(userId: number): CreditData {
  const ziraat = Math.floor(seededRandom(userId, 1) * 600) + 300;
  const isBank = Math.floor(seededRandom(userId, 2) * 600) + 300;
  const garanti = Math.floor(seededRandom(userId, 3) * 600) + 300;
  const balance = Math.floor(seededRandom(userId, 4) * 15_000_000);
  return { ziraat, isBank, garanti, balance, hasHighBalance: balance >= 5_000_000 };
}

export function scoreColor(score: number): string {
  if (score >= 750) return '#34c759';
  if (score >= 600) return '#ff9f0a';
  return '#ff3b30';
}

export function formatBalance(amount: number): string {
  return amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}
