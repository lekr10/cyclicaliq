-- CyclicalIQ — Initial Schema
-- Run this in Supabase SQL Editor

-- ─────────────────────────────────────────
-- 1. RESEARCH ITEMS
-- ─────────────────────────────────────────
create table if not exists research_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('sector', 'industry', 'company')),
  ticker text,
  stage text not null default 'watching' check (stage in ('watching', 'researching', 'accumulating', 'full_position', 'trimming', 'exited')),
  pain_index integer,
  thesis text,
  key_companies text[],
  industry_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table research_items enable row level security;
create policy "Users own their research items"
  on research_items for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 2. RESEARCH NOTES
-- ─────────────────────────────────────────
create table if not exists research_notes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references research_items on delete cascade not null,
  content text not null,
  pain_index_at_time integer,
  stage_at_time text check (stage_at_time in ('watching', 'researching', 'accumulating', 'full_position', 'trimming', 'exited')),
  macro_score_at_time integer,
  created_at timestamptz default now()
);

alter table research_notes enable row level security;
create policy "Users own their notes"
  on research_notes for all using (
    exists (
      select 1 from research_items
      where research_items.id = research_notes.item_id
      and research_items.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 3. CATALYSTS
-- ─────────────────────────────────────────
create table if not exists catalysts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references research_items on delete cascade not null,
  title text not null,
  event_date date,
  expected_impact text check (expected_impact in ('bullish', 'bearish', 'neutral', 'unknown')),
  notes text,
  created_at timestamptz default now()
);

alter table catalysts enable row level security;
create policy "Users own their catalysts"
  on catalysts for all using (
    exists (
      select 1 from research_items
      where research_items.id = catalysts.item_id
      and research_items.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 4. MARKET SNAPSHOTS (shared cache, historical)
-- ─────────────────────────────────────────
create table if not exists market_snapshots (
  id uuid primary key default gen_random_uuid(),
  ticker_or_sector text not null,
  return_1yr float,
  return_3yr float,
  return_5yr float,
  short_interest float,
  analyst_consensus float,
  pain_index integer,
  peak_price_5yr float,
  peak_price_5yr_computed_at timestamptz,
  snapshot_date date not null,
  last_fetched_at timestamptz default now(),
  unique(ticker_or_sector, snapshot_date)
);

alter table market_snapshots enable row level security;
create policy "Anyone can read market snapshots"
  on market_snapshots for select using (true);
-- Writes are service_role only (enforced by setting insert policy to false for anon)

-- ─────────────────────────────────────────
-- 5. INDUSTRIES (74 GICS, pre-seeded, read-only from UI)
-- Denormalized current_pain_index for O(1) scanner loads
-- ─────────────────────────────────────────
create table if not exists industries (
  id uuid primary key default gen_random_uuid(),
  gics_code text,
  gics_level text,
  name text not null,
  sector text,
  industry_group text,
  constituents text[] not null,
  etf_proxy text,
  etf_proxy_name text,
  news_keywords text,
  cyclical_drivers text,
  is_active boolean default true,
  -- Denormalized for scanner O(1) load:
  current_pain_index integer,
  current_return_1yr float,
  current_return_3yr float,
  current_snapshot_date date,
  last_fetched_at timestamptz,
  sentiment_velocity integer  -- 30-day Pain Index delta; null = building history
);

alter table industries enable row level security;
create policy "Anyone can read industries"
  on industries for select using (true);

-- ─────────────────────────────────────────
-- 6. NEWS ARTICLES (6hr cache per industry)
-- ─────────────────────────────────────────
create table if not exists news_articles (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid references industries on delete cascade,
  title text not null,
  url text not null,
  source text,
  published_at timestamptz,
  description text,
  fetched_at timestamptz default now(),
  unique(url)
);

alter table news_articles enable row level security;
create policy "Anyone can read news articles"
  on news_articles for select using (true);

-- ─────────────────────────────────────────
-- 7. MACRO BACKDROPS (per research item, user-defined ideal conditions)
-- ─────────────────────────────────────────
create table if not exists macro_backdrops (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references research_items on delete cascade not null unique,
  ideal_fed_funds_direction text check (ideal_fed_funds_direction in ('falling', 'rising', 'flat', 'any')),
  ideal_fed_funds_max float,
  ideal_cpi_direction text check (ideal_cpi_direction in ('falling', 'rising', 'flat', 'any')),
  ideal_cpi_max float,
  ideal_unemployment_direction text check (ideal_unemployment_direction in ('falling', 'rising', 'flat', 'any')),
  ideal_unemployment_max float,
  ideal_10yr_direction text check (ideal_10yr_direction in ('falling', 'rising', 'flat', 'any')),
  ideal_10yr_max float,
  ideal_yield_curve_direction text check (ideal_yield_curve_direction in ('falling', 'rising', 'flat', 'any', 'positive', 'negative')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table macro_backdrops enable row level security;
create policy "Users own their macro backdrops"
  on macro_backdrops for all using (
    exists (
      select 1 from research_items
      where research_items.id = macro_backdrops.item_id
      and research_items.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 8. MACRO SNAPSHOTS (FRED daily cache)
-- ─────────────────────────────────────────
create table if not exists macro_snapshots (
  id uuid primary key default gen_random_uuid(),
  fed_funds_rate float,
  cpi_yoy float,
  core_pce_yoy float,
  unemployment_rate float,
  yield_10yr float,
  yield_2yr float,
  yield_curve_spread float,
  snapshot_date date not null,
  fetched_at timestamptz default now(),
  unique(snapshot_date)
);

alter table macro_snapshots enable row level security;
create policy "Anyone can read macro snapshots"
  on macro_snapshots for select using (true);

-- ─────────────────────────────────────────
-- HELPER: updated_at trigger
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger research_items_updated_at
  before update on research_items
  for each row execute procedure update_updated_at();

create trigger macro_backdrops_updated_at
  before update on macro_backdrops
  for each row execute procedure update_updated_at();
