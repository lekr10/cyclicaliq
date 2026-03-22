// CyclicalIQ — Shared TypeScript Types

export type Stage = 'watching' | 'researching' | 'accumulating' | 'full_position' | 'trimming' | 'exited'
export type ItemType = 'sector' | 'industry' | 'company'
export type MacroDirection = 'falling' | 'rising' | 'flat' | 'any'
export type CatalystImpact = 'bullish' | 'bearish' | 'neutral' | 'unknown'

export interface Industry {
  id: string
  gics_code: string | null
  gics_level: string | null
  name: string
  sector: string | null
  industry_group: string | null
  constituents: string[]
  etf_proxy: string | null
  etf_proxy_name: string | null
  news_keywords: string | null
  cyclical_drivers: string | null
  is_active: boolean
  current_pain_index: number | null
  current_return_1yr: number | null
  current_return_3yr: number | null
  current_snapshot_date: string | null
  last_fetched_at: string | null
  sentiment_velocity: number | null
}

export interface ResearchItem {
  id: string
  user_id: string
  name: string
  type: ItemType
  ticker: string | null
  stage: Stage
  pain_index: number | null
  thesis: string | null
  key_companies: string[] | null
  industry_id: string | null
  created_at: string
  updated_at: string
  // joined
  catalysts?: Catalyst[]
  notes?: ResearchNote[]
  macro_backdrop?: MacroBackdrop | null
  industry?: Industry | null
}

export interface ResearchNote {
  id: string
  item_id: string
  content: string
  pain_index_at_time: number | null
  stage_at_time: Stage | null
  macro_score_at_time: number | null
  created_at: string
}

export interface Catalyst {
  id: string
  item_id: string
  title: string
  event_date: string | null
  expected_impact: CatalystImpact | null
  notes: string | null
  created_at: string
}

export interface MarketSnapshot {
  id: string
  ticker_or_sector: string
  return_1yr: number | null
  return_3yr: number | null
  return_5yr: number | null
  short_interest: number | null
  analyst_consensus: number | null
  pain_index: number | null
  peak_price_5yr: number | null
  peak_price_5yr_computed_at: string | null
  snapshot_date: string
  last_fetched_at: string
}

export interface NewsArticle {
  id: string
  industry_id: string
  title: string
  url: string
  source: string | null
  published_at: string | null
  description: string | null
  fetched_at: string
}

export interface MacroBackdrop {
  id: string
  item_id: string
  ideal_fed_funds_direction: MacroDirection | null
  ideal_fed_funds_max: number | null
  ideal_cpi_direction: MacroDirection | null
  ideal_cpi_max: number | null
  ideal_unemployment_direction: MacroDirection | null
  ideal_unemployment_max: number | null
  ideal_10yr_direction: MacroDirection | null
  ideal_10yr_max: number | null
  ideal_yield_curve_direction: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MacroSnapshot {
  id: string
  fed_funds_rate: number | null
  cpi_yoy: number | null
  core_pce_yoy: number | null
  unemployment_rate: number | null
  yield_10yr: number | null
  yield_2yr: number | null
  yield_curve_spread: number | null
  snapshot_date: string
  fetched_at: string
}

export interface MacroConditionResult {
  label: string
  idealDesc: string
  current: number | null
  currentLabel: string
  status: 'met' | 'watch' | 'not_met' | 'unknown'
}

// Pain Index null-safety case
export interface PainIndexComponents {
  drawdown: number | null
  shortInterest: number | null
  analyst: number | null
  painIndex: number | null
  drawdownScore: number | null
  shortInterestScore: number | null
  analystScore: number | null
}
