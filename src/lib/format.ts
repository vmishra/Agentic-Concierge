import type { Money } from '@/adk/a2ui'

const symbols: Record<Money['currency'], string> = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  EUR: '€',
  AED: 'د.إ ',
}

/**
 * Format money the way a concierge would write it — compact lakh/crore for INR,
 * crisp comma-separated for everything else.
 */
export function fmtMoney(m: Money): string {
  const sym = symbols[m.currency]
  if (m.currency === 'INR') {
    if (m.amount >= 10_000_000) return `${sym}${(m.amount / 10_000_000).toFixed(2)} Cr`
    if (m.amount >= 100_000) return `${sym}${(m.amount / 100_000).toFixed(2)} L`
    return `${sym}${m.amount.toLocaleString('en-IN')}`
  }
  return `${sym}${m.amount.toLocaleString('en-US')}`
}

export function fmtRelative(ts: number, now: number = Date.now()): string {
  const d = Math.max(0, now - ts)
  if (d < 1000) return 'just now'
  if (d < 60_000) return `${Math.floor(d / 1000)}s ago`
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  return `${Math.floor(d / 3_600_000)}h ago`
}
