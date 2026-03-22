import type { MacroBackdrop, MacroSnapshot, MacroConditionResult } from '@/types'

function evalDirection(
  direction: string | null,
  currentValue: number | null,
  maxValue: number | null
): MacroConditionResult['status'] {
  if (!direction || direction === 'any') return 'met'
  if (currentValue === null) return 'unknown'

  // Check max threshold
  if (maxValue !== null) {
    if (currentValue <= maxValue) return 'met'
    // Within 20% of threshold = 'watch'
    if (currentValue <= maxValue * 1.2) return 'watch'
    return 'not_met'
  }

  return 'met'
}

export function computeMacroMatch(
  backdrop: MacroBackdrop | null | undefined,
  macro: MacroSnapshot | null
): { score: number; conditions: MacroConditionResult[] } {
  if (!backdrop || !macro) {
    return { score: 0, conditions: [] }
  }

  const conditions: MacroConditionResult[] = []

  // Fed Funds
  const fedStatus = evalDirection(backdrop.ideal_fed_funds_direction, macro.fed_funds_rate, backdrop.ideal_fed_funds_max)
  conditions.push({
    label: 'Fed Funds Rate',
    idealDesc: backdrop.ideal_fed_funds_max ? `< ${backdrop.ideal_fed_funds_max}%` : backdrop.ideal_fed_funds_direction ?? 'any',
    current: macro.fed_funds_rate,
    currentLabel: macro.fed_funds_rate !== null ? `${macro.fed_funds_rate.toFixed(2)}%` : '—',
    status: fedStatus,
  })

  // CPI
  const cpiStatus = evalDirection(backdrop.ideal_cpi_direction, macro.cpi_yoy, backdrop.ideal_cpi_max)
  conditions.push({
    label: 'CPI YoY',
    idealDesc: backdrop.ideal_cpi_max ? `< ${backdrop.ideal_cpi_max}%` : backdrop.ideal_cpi_direction ?? 'any',
    current: macro.cpi_yoy,
    currentLabel: macro.cpi_yoy !== null ? `${macro.cpi_yoy.toFixed(1)}%` : '—',
    status: cpiStatus,
  })

  // Unemployment
  const unempStatus = evalDirection(backdrop.ideal_unemployment_direction, macro.unemployment_rate, backdrop.ideal_unemployment_max)
  conditions.push({
    label: 'Unemployment',
    idealDesc: backdrop.ideal_unemployment_max ? `< ${backdrop.ideal_unemployment_max}%` : backdrop.ideal_unemployment_direction ?? 'any',
    current: macro.unemployment_rate,
    currentLabel: macro.unemployment_rate !== null ? `${macro.unemployment_rate.toFixed(1)}%` : '—',
    status: unempStatus,
  })

  // 10yr yield
  const yieldStatus = evalDirection(backdrop.ideal_10yr_direction, macro.yield_10yr, backdrop.ideal_10yr_max)
  conditions.push({
    label: '10yr Yield',
    idealDesc: backdrop.ideal_10yr_max ? `< ${backdrop.ideal_10yr_max}%` : backdrop.ideal_10yr_direction ?? 'any',
    current: macro.yield_10yr,
    currentLabel: macro.yield_10yr !== null ? `${macro.yield_10yr.toFixed(2)}%` : '—',
    status: yieldStatus,
  })

  // Yield curve
  let curveStatus: MacroConditionResult['status'] = 'unknown'
  if (macro.yield_curve_spread !== null) {
    const dir = backdrop.ideal_yield_curve_direction
    if (dir === 'positive' || dir === 'rising') {
      curveStatus = macro.yield_curve_spread > 0 ? 'met' : macro.yield_curve_spread > -0.3 ? 'watch' : 'not_met'
    } else if (dir === 'any' || !dir) {
      curveStatus = 'met'
    } else {
      curveStatus = 'not_met'
    }
  }
  conditions.push({
    label: 'Yield Curve',
    idealDesc: backdrop.ideal_yield_curve_direction ?? 'any',
    current: macro.yield_curve_spread,
    currentLabel: macro.yield_curve_spread !== null ? `${macro.yield_curve_spread > 0 ? '+' : ''}${macro.yield_curve_spread.toFixed(2)}%` : '—',
    status: curveStatus,
  })

  const score = conditions.filter(c => c.status === 'met').length
  return { score, conditions }
}

// Preset macro backdrop templates
export const MACRO_TEMPLATES: Record<string, Partial<MacroBackdrop>> = {
  homebuilders: {
    ideal_fed_funds_direction: 'falling',
    ideal_fed_funds_max: 4.0,
    ideal_cpi_direction: 'falling',
    ideal_cpi_max: 3.0,
    ideal_10yr_direction: 'falling',
    ideal_10yr_max: 5.0,
    ideal_unemployment_max: 5.0,
    ideal_yield_curve_direction: 'positive',
    notes: 'This trade needs rate cuts to begin. Key trigger: 10yr below 5%, Fed pivoting dovish, CPI declining toward 2-3%.',
  },
  miners: {
    ideal_fed_funds_direction: 'falling',
    ideal_cpi_direction: 'rising',
    ideal_10yr_direction: 'falling',
    ideal_10yr_max: 4.5,
    notes: 'Falling real rates (nominal yields down, inflation sticky) = gold/silver tailwind. Weak USD helps.',
  },
  shipping: {
    ideal_fed_funds_direction: 'any',
    ideal_unemployment_direction: 'any',
    notes: 'Shipping is more about supply/demand balance than rates. Low orderbook + rising trade volumes = catalyst. China PMI above 50.',
  },
  uranium: {
    ideal_fed_funds_direction: 'any',
    ideal_cpi_direction: 'any',
    notes: 'Uranium is driven by utility contracting cycle + geopolitical supply risk. Rate environment secondary. Key: utilities signing 10yr contracts.',
  },
}
