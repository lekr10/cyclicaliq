import type { ResearchItem, MacroSnapshot, MacroBackdrop } from '@/types'

export function buildAiBriefPrompt(
  item: ResearchItem,
  macro: MacroSnapshot | null,
  macroScore: number
): string {
  const catalysts = item.catalysts ?? []
  const upcomingCatalysts = catalysts
    .filter(c => c.event_date && new Date(c.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())
    .slice(0, 5)
    .map(c => `- ${c.title}${c.event_date ? ` (${c.event_date})` : ''}${c.expected_impact ? ` — ${c.expected_impact}` : ''}`)
    .join('\n')

  const backdrop = item.macro_backdrop

  return `You are a cyclical investment analyst. I'm researching a potential contrarian investment opportunity. Please give me a structured research brief.

**Sector / Company:** ${item.name}
**Type:** ${item.type}
**Current Pain Index:** ${item.pain_index ?? 'N/A'}/100
**Key Companies / Tickers:** ${item.key_companies?.join(', ') ?? 'N/A'}
**My Current Thesis:** ${item.thesis ?? 'Not yet written'}
**Stage:** ${item.stage}
**Upcoming Catalysts:**
${upcomingCatalysts || '- None recorded'}

**Current Macro Environment:**
- Fed Funds Rate: ${macro?.fed_funds_rate?.toFixed(2) ?? 'N/A'}%
- CPI YoY: ${macro?.cpi_yoy?.toFixed(1) ?? 'N/A'}%
- Core PCE YoY: ${macro?.core_pce_yoy?.toFixed(1) ?? 'N/A'}%
- Unemployment: ${macro?.unemployment_rate?.toFixed(1) ?? 'N/A'}%
- 10yr Yield: ${macro?.yield_10yr?.toFixed(2) ?? 'N/A'}%
- 2yr Yield: ${macro?.yield_2yr?.toFixed(2) ?? 'N/A'}%
- Yield Curve (10-2): ${macro?.yield_curve_spread?.toFixed(2) ?? 'N/A'}%
- Macro Match Score: ${macroScore}/5 conditions met

**My Ideal Macro Backdrop for this trade:** ${backdrop?.notes ?? 'Not configured'}

Please provide:
1. **Bull case** — what would need to be true for this to be a 300-500% return over 3-5 years?
2. **Bear case** — what are the 3 biggest risks / reasons this stays depressed?
3. **Historical analog** — name the closest comparable cyclical setup from history and what happened
4. **Macro timing** — given the current macro backdrop (${macroScore}/5 conditions met), are we too early, right on time, or has the window passed? What macro shift would be the most important catalyst?
5. **Inflection signals** — what specific indicators would tell me the sentiment is shifting from "hated" to "tolerated"?
6. **Key questions** — what are the 3 most important things I need to research or verify before making a position?`
}
