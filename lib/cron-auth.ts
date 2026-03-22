import { timingSafeEqual } from 'crypto'

// Timing-safe cron secret comparison — prevents timing attacks
export function verifyCronSecret(provided: string | null): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected || !provided) return false

  try {
    const a = Buffer.from(provided, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
