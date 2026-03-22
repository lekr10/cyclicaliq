// Pain Index computation — single source of truth
// Called from Supabase Edge Function (proxy) and /api/refresh
// 4-case null safety as specified in engineering review

export interface TickerData {
  ticker: string
  currentPrice: number | null
  peakPrice5yr: number | null
  shortPercentOfFloat: number | null  // 0-1 scale from yahoo-finance2
  recommendationMean: number | null   // 1=Strong Buy → 5=Strong Sell
}

export interface PainIndexResult {
  painIndex: number | null
  drawdownScore: number | null
  shortInterestScore: number | null
  analystScore: number | null
  drawdownRaw: number | null         // 0-100 pct from peak
  shortInterestRaw: number | null   // 0-100 pct of float
  analystRaw: number | null         // 1-5 scale
  return1yr: number | null
  return3yr: number | null
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function computeDrawdownScore(currentPrice: number, peakPrice5yr: number): number {
  if (peakPrice5yr <= 0) return 0
  const drawdown = (peakPrice5yr - currentPrice) / peakPrice5yr
  return clamp(drawdown * 100, 0, 100)
}

export function computeShortInterestScore(shortPercentOfFloat: number): number {
  // shortPercentOfFloat from yahoo-finance2 is 0–1 (e.g. 0.35 = 35%)
  return clamp(shortPercentOfFloat * 100 * 2.5, 0, 100)
}

export function computeAnalystScore(recommendationMean: number): number {
  // 1=Strong Buy (loved) → 5=Strong Sell (hated)
  // Map to 0–100: score = (mean - 1) / 4 * 100
  return clamp((recommendationMean - 1) / 4 * 100, 0, 100)
}

export function computePainIndex(
  drawdownScore: number | null,
  shortInterestScore: number | null,
  analystScore: number | null
): number | null {
  // Case 4: all null → Yahoo Finance down
  if (drawdownScore === null) return null

  // Case 0: all 3 available
  if (shortInterestScore !== null && analystScore !== null) {
    return Math.round(drawdownScore * 0.60 + shortInterestScore * 0.25 + analystScore * 0.15)
  }

  // Case 1: short_interest null → renormalize drawdown + analyst
  if (shortInterestScore === null && analystScore !== null) {
    return Math.round(drawdownScore * 0.80 + analystScore * 0.20)
  }

  // Case 2: analyst null → renormalize drawdown + short interest
  if (shortInterestScore !== null && analystScore === null) {
    return Math.round(drawdownScore * 0.706 + shortInterestScore * 0.294)
  }

  // Case 3: both null → drawdown only
  return Math.round(drawdownScore * 1.0)
}

export function aggregateTickersForIndustry(tickers: TickerData[]): PainIndexResult {
  const validDrawdown = tickers.filter(t => t.currentPrice !== null && t.peakPrice5yr !== null && t.peakPrice5yr > 0)
  const validShortInterest = tickers.filter(t => t.shortPercentOfFloat !== null)
  const validAnalyst = tickers.filter(t => t.recommendationMean !== null)

  // Need at least 1 valid ticker for drawdown
  if (validDrawdown.length === 0) {
    return { painIndex: null, drawdownScore: null, shortInterestScore: null, analystScore: null, drawdownRaw: null, shortInterestRaw: null, analystRaw: null, return1yr: null, return3yr: null }
  }

  const drawdownScores = validDrawdown.map(t => computeDrawdownScore(t.currentPrice!, t.peakPrice5yr!))
  const drawdownScore = drawdownScores.reduce((a, b) => a + b, 0) / drawdownScores.length
  const drawdownRaw = drawdownScore

  // Need at least 2 tickers for short interest (as per engineering spec)
  let shortInterestScore: number | null = null
  let shortInterestRaw: number | null = null
  if (validShortInterest.length >= 2) {
    const scores = validShortInterest.map(t => computeShortInterestScore(t.shortPercentOfFloat!))
    shortInterestScore = scores.reduce((a, b) => a + b, 0) / scores.length
    shortInterestRaw = validShortInterest.map(t => t.shortPercentOfFloat! * 100).reduce((a, b) => a + b, 0) / validShortInterest.length
  }

  let analystScore: number | null = null
  let analystRaw: number | null = null
  if (validAnalyst.length >= 1) {
    const scores = validAnalyst.map(t => computeAnalystScore(t.recommendationMean!))
    analystScore = scores.reduce((a, b) => a + b, 0) / scores.length
    analystRaw = validAnalyst.map(t => t.recommendationMean!).reduce((a, b) => a + b, 0) / validAnalyst.length
  }

  const painIndex = computePainIndex(drawdownScore, shortInterestScore, analystScore)

  return {
    painIndex,
    drawdownScore,
    shortInterestScore,
    analystScore,
    drawdownRaw,
    shortInterestRaw,
    analystRaw,
    return1yr: null,  // populated by caller from market_snapshots
    return3yr: null,
  }
}
