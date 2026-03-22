-- CyclicalIQ — 74 GICS Industries Seed Data
-- Run AFTER 001_initial_schema.sql

insert into industries (gics_code, gics_level, name, sector, industry_group, constituents, etf_proxy, etf_proxy_name, news_keywords, cyclical_drivers) values

-- ── ENERGY ──────────────────────────────────────────────────────────────────
('101010', 'industry', 'Energy Equipment & Services', 'Energy', 'Energy',
 ARRAY['SLB','HAL','BKR','NOV','OIS'], 'OIH', 'VanEck Oil Services ETF',
 'oilfield services OR SLB OR Schlumberger OR Halliburton OR Baker Hughes OR oil drilling',
 'Oil price, E&P capex cycles, rig count, offshore activity'),

('101020', 'industry', 'Oil, Gas & Consumable Fuels', 'Energy', 'Energy',
 ARRAY['XOM','CVX','COP','EOG','DVN'], 'XLE', 'Energy Select Sector SPDR',
 'oil price OR natural gas OR crude oil OR XOM OR Exxon OR Chevron OR ConocoPhillips',
 'WTI crude price, natural gas price, OPEC decisions, global demand'),

('101021', 'industry', 'Oil & Gas Exploration & Production', 'Energy', 'Energy',
 ARRAY['PXD','OVV','FANG','CLR','MRO'], 'XOP', 'SPDR S&P Oil & Gas E&P ETF',
 'oil exploration OR E&P OR shale OR fracking OR Diamondback OR Ovintiv',
 'Oil price, breakeven costs, hedging programs, DUC wells'),

('101022', 'industry', 'Coal & Consumable Fuels', 'Energy', 'Energy',
 ARRAY['BTU','ARCH','AMR','CEIX','HCC'], 'KOL', 'VanEck Coal ETF',
 'coal OR thermal coal OR metallurgical coal OR BTU OR Arch Coal OR Alpha Metallurgical',
 'Steel demand, thermal coal power demand, ESG pressure, China imports'),

-- ── MATERIALS ────────────────────────────────────────────────────────────────
('151010', 'industry', 'Chemicals', 'Materials', 'Materials',
 ARRAY['LIN','APD','DOW','DD','LYB'], NULL, NULL,
 'chemicals OR specialty chemicals OR fertilizer OR LIN OR Dow OR DuPont',
 'Natural gas feedstock costs, agricultural demand, construction cycle'),

('151020', 'industry', 'Construction Materials', 'Materials', 'Materials',
 ARRAY['VMC','MLM','EXP','SUM','CRH'], NULL, NULL,
 'construction materials OR aggregates OR cement OR Vulcan Materials OR Martin Marietta',
 'Housing starts, infrastructure spending, residential construction cycle'),

('151030', 'industry', 'Containers & Packaging', 'Materials', 'Materials',
 ARRAY['IP','PKG','SEE','BALL','CCK'], NULL, NULL,
 'packaging OR containers OR cardboard OR corrugated OR International Paper OR Sealed Air',
 'E-commerce demand, consumer staples volumes, pulp & paper pricing'),

('151040', 'industry', 'Metals & Mining — Diversified', 'Materials', 'Materials',
 ARRAY['RIO','BHP','FCX','VALE','TECK'], 'PICK', 'iShares MSCI Global Metals & Mining ETF',
 'mining OR metals OR copper OR iron ore OR BHP OR Rio Tinto OR Freeport',
 'China demand, commodity supercycles, infrastructure investment, USD strength'),

('151041', 'industry', 'Gold & Silver Mining', 'Materials', 'Materials',
 ARRAY['NEM','AEM','GOLD','KGC','AGI'], 'GDX', 'VanEck Gold Miners ETF',
 'gold mining OR silver OR gold price OR GDX OR Newmont OR Agnico Eagle OR Kinross',
 'Gold price, real interest rates, USD strength, inflation expectations, central bank buying'),

('151042', 'industry', 'Uranium Mining', 'Materials', 'Materials',
 ARRAY['CCJ','UEC','NXE','DNN','URG'], 'URA', 'Global X Uranium ETF',
 'uranium OR nuclear energy OR nuclear power OR CCJ OR Cameco OR uranium mining',
 'Nuclear power demand, utility contracting cycles, geopolitical supply disruption'),

('151043', 'industry', 'Steel', 'Materials', 'Materials',
 ARRAY['NUE','STLD','CLF','X','CMC'], 'SLX', 'VanEck Steel ETF',
 'steel OR steel production OR US Steel OR Nucor OR Cleveland-Cliffs OR flat-rolled steel',
 'Construction demand, auto production, infrastructure spending, China steel exports'),

('151044', 'industry', 'Copper Mining', 'Materials', 'Materials',
 ARRAY['FCX','SCCO','HBM','TECK','ERO'], 'COPX', 'Global X Copper Miners ETF',
 'copper OR copper mining OR FCX OR Freeport OR SCCO OR Southern Copper OR copper demand',
 'EV adoption, grid electrification, China construction, supply constraints'),

('151045', 'industry', 'Agricultural Chemicals & Fertilizers', 'Materials', 'Materials',
 ARRAY['MOS','NTR','CF','ICL','SQM'], 'SOIL', 'Global X Fertilizers/Potash ETF',
 'fertilizer OR potash OR nitrogen OR MOS OR Mosaic OR Nutrien OR CF Industries',
 'Crop prices, natural gas costs, global food demand, sanctions on Belarus/Russia'),

('151050', 'industry', 'Paper & Forest Products', 'Materials', 'Materials',
 ARRAY['WY','PCH','PCA','IP','CLW'], 'WOOD', 'iShares Global Timber & Forestry ETF',
 'lumber OR timber OR paper OR forest products OR Weyerhaeuser OR housing lumber',
 'Housing starts, pulp demand, e-commerce packaging, wood supply'),

('151060', 'industry', 'Lithium & Battery Materials', 'Materials', 'Materials',
 ARRAY['ALB','SQM','LAC','PLL','LTHM'], 'LIT', 'Global X Lithium & Battery Tech ETF',
 'lithium OR battery materials OR EV batteries OR Albemarle OR SQM OR lithium carbonate',
 'EV adoption rate, battery cost curves, new mine supply, China EV policy'),

('151070', 'industry', 'Rare Earth Mining', 'Materials', 'Materials',
 ARRAY['MP','UCORE','NioCorp'], 'REMX', 'VanEck Rare Earth/Strategic Metals ETF',
 'rare earth OR rare earth mining OR MP Materials OR neodymium OR dysprosium',
 'Defense demand, EV motors, wind turbines, China supply concentration'),

-- ── INDUSTRIALS ──────────────────────────────────────────────────────────────
('201010', 'industry', 'Aerospace & Defense', 'Industrials', 'Industrials',
 ARRAY['LMT','RTX','NOC','GD','BA'], 'ITA', 'iShares U.S. Aerospace & Defense ETF',
 'aerospace OR defense OR defense spending OR Lockheed OR Raytheon OR Boeing OR Northrop',
 'Defense budgets, geopolitical conflict, commercial aerospace cycle, supply chains'),

('201020', 'industry', 'Building Products', 'Industrials', 'Industrials',
 ARRAY['MAS','TREX','FBHS','AZEK','PGTI'], NULL, NULL,
 'building products OR windows OR doors OR Masco OR Trex OR AZEK OR Fortune Brands',
 'Housing starts, R&R activity, mortgage rates, home prices'),

('201030', 'industry', 'Construction & Engineering', 'Industrials', 'Industrials',
 ARRAY['PWR','MTZ','EME','MYRG','ROAD'], NULL, NULL,
 'construction OR infrastructure OR EPC OR Quanta Services OR MYR Group OR Mastec',
 'Infrastructure bill spending, grid investment, renewable buildout, data center construction'),

('201040', 'industry', 'Electrical Equipment', 'Industrials', 'Industrials',
 ARRAY['ETN','ROK','GNRC','HUBB','REZI'], NULL, NULL,
 'electrical equipment OR transformers OR switchgear OR Eaton OR Rockwell OR Hubbell',
 'Grid modernization, industrial capex, data center demand, electrification'),

('201050', 'industry', 'Industrial Machinery', 'Industrials', 'Industrials',
 ARRAY['CAT','DE','IR','PH','ITW'], NULL, NULL,
 'industrial machinery OR Caterpillar OR Deere OR manufacturing OR Parker Hannifin',
 'Global GDP, mining capex, agricultural demand, factory automation'),

('201060', 'industry', 'Commercial Printing', 'Industrials', 'Industrials',
 ARRAY['RRD','QUAD','VPG','LSC'], NULL, NULL,
 'printing OR commercial printing OR RR Donnelley OR Quad Graphics OR direct mail',
 'Advertising spend, digital substitution, packaging demand'),

('201070', 'industry', 'Air Freight & Logistics', 'Industrials', 'Industrials',
 ARRAY['UPS','FDX','XPO','CHRW','EXPD'], NULL, NULL,
 'freight OR logistics OR UPS OR FedEx OR air freight OR supply chain OR XPO',
 'E-commerce volumes, global trade, fuel costs, inventory cycles'),

('201080', 'industry', 'Airlines', 'Industrials', 'Industrials',
 ARRAY['DAL','UAL','AAL','LUV','JBLU'], 'JETS', 'U.S. Global Jets ETF',
 'airlines OR air travel OR Delta OR United Airlines OR American Airlines OR Southwest',
 'Jet fuel costs, travel demand, capacity utilization, recession sensitivity'),

('201090', 'industry', 'Marine Shipping', 'Industrials', 'Industrials',
 ARRAY['ZIM','MATX','SBLK','GNK','GOGL'], 'BDRY', 'Breakwave Dry Bulk Shipping ETF',
 'shipping OR dry bulk OR tankers OR ZIM OR Star Bulk OR container shipping OR Baltic Dry',
 'Global trade volumes, China imports, newbuild orderbook, fuel costs'),

('201100', 'industry', 'Trucking', 'Industrials', 'Industrials',
 ARRAY['ODFL','SAIA','JBHT','KNX','WERN'], NULL, NULL,
 'trucking OR LTL OR Old Dominion OR Saia OR JB Hunt OR Werner OR freight rates',
 'Industrial production, consumer spending, spot vs contract rates, diesel costs'),

('201110', 'industry', 'Railroads', 'Industrials', 'Industrials',
 ARRAY['UNP','CSX','NSC','CP','CNI'], NULL, NULL,
 'railroad OR freight rail OR Union Pacific OR CSX OR Norfolk Southern OR intermodal',
 'Industrial output, coal volumes, grain shipments, intermodal competition'),

-- ── CONSUMER DISCRETIONARY ────────────────────────────────────────────────
('251010', 'industry', 'Auto Components', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['APTV','LEA','DAN','BWA','MGA'], NULL, NULL,
 'auto parts OR auto components OR Aptiv OR Lear OR Dana OR BorgWarner OR Magna',
 'Vehicle production, EV transition, chip supply, labor costs'),

('251020', 'industry', 'Automobiles', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['GM','F','TSLA','STLA','HMC'], NULL, NULL,
 'automobiles OR auto sales OR GM OR Ford OR Tesla OR Stellantis OR EV sales',
 'Consumer credit, incentive levels, EV adoption, production capacity'),

('251030', 'industry', 'Homebuilders', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['DHI','LEN','PHM','TOL','MDC'], 'ITB', 'iShares U.S. Home Construction ETF',
 'homebuilders OR housing starts OR new home sales OR D.R. Horton OR Lennar OR PulteGroup',
 'Mortgage rates, affordability, land costs, housing deficit, Fed rate policy'),

('251040', 'industry', 'Hotels & Resorts', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['MAR','HLT','H','CHH','IHG'], NULL, NULL,
 'hotels OR resorts OR lodging OR Marriott OR Hilton OR Hyatt OR RevPAR OR travel',
 'Business travel, leisure demand, corporate events, international inbound'),

('251050', 'industry', 'Restaurants', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['MCD','SBUX','YUM','QSR','CMG'], NULL, NULL,
 'restaurants OR fast food OR quick service OR McDonald OR Starbucks OR Chipotle OR YUM',
 'Consumer spending, labor costs, food inflation, same-store sales'),

('251060', 'industry', 'Specialty Retail', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['HD','LOW','TJX','ROST','GPS'], NULL, NULL,
 'retail OR specialty retail OR Home Depot OR Lowes OR TJX OR Ross OR Gap OR consumer',
 'Consumer confidence, housing market, discounting environment, e-commerce competition'),

('251070', 'industry', 'Cannabis', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['TLRY','CGC','ACB','CRON','GTBIF'], 'MSOS', 'AdvisorShares Pure US Cannabis ETF',
 'cannabis OR marijuana OR pot stocks OR Tilray OR Canopy Growth OR Aurora OR legalization',
 'Federal legalization, state market openings, pricing pressure, cash burn'),

-- ── CONSUMER STAPLES ─────────────────────────────────────────────────────────
('301010', 'industry', 'Agricultural Products', 'Consumer Staples', 'Consumer Staples',
 ARRAY['ADM','BG','TSN','HRL','SFD'], 'MOO', 'VanEck Agribusiness ETF',
 'agriculture OR agribusiness OR ADM OR Archer Daniels OR Bunge OR Tyson OR grain',
 'Crop prices, export demand, China ag imports, drought/weather, biofuel policy'),

('301020', 'industry', 'Beverages', 'Consumer Staples', 'Consumer Staples',
 ARRAY['KO','PEP','STZ','BUD','TAP'], NULL, NULL,
 'beverages OR beer OR Coca-Cola OR Pepsi OR Constellation Brands OR Anheuser Busch',
 'Consumer spending, volume trends, mix shift, pricing power, currency'),

('301030', 'industry', 'Food Products', 'Consumer Staples', 'Consumer Staples',
 ARRAY['KHC','GIS','CAG','SJM','MKC'], NULL, NULL,
 'food products OR packaged food OR Kraft Heinz OR General Mills OR ConAgra OR McCormick',
 'Input cost inflation, private label competition, consumer trade-down, pricing'),

('301040', 'industry', 'Tobacco', 'Consumer Staples', 'Consumer Staples',
 ARRAY['MO','PM','BTI','LO','VGR'], NULL, NULL,
 'tobacco OR cigarettes OR Altria OR Philip Morris OR British American Tobacco OR RRPs',
 'Volume declines, regulatory risk, pricing power, next-gen product transition'),

-- ── HEALTH CARE ───────────────────────────────────────────────────────────────
('352010', 'industry', 'Biotechnology', 'Health Care', 'Health Care',
 ARRAY['AMGN','GILD','REGN','VRTX','BIIB'], 'XBI', 'SPDR S&P Biotech ETF',
 'biotech OR biotechnology OR FDA approval OR clinical trial OR AMGN OR Gilead OR Regeneron',
 'FDA approval cycles, clinical trial outcomes, M&A activity, risk appetite'),

('352020', 'industry', 'Pharmaceuticals', 'Health Care', 'Health Care',
 ARRAY['LLY','PFE','MRK','ABBV','BMY'], NULL, NULL,
 'pharmaceuticals OR drug pricing OR Eli Lilly OR Pfizer OR Merck OR AbbVie OR GLP-1',
 'Patent cliffs, drug pricing regulation, pipeline readouts, Medicare negotiation'),

('352030', 'industry', 'Healthcare Equipment & Supplies', 'Health Care', 'Health Care',
 ARRAY['ABT','MDT','SYK','BSX','EW'], NULL, NULL,
 'medical devices OR healthcare equipment OR Abbott OR Medtronic OR Stryker OR Boston Scientific',
 'Procedure volumes, hospital capex, reimbursement rates, robotics adoption'),

('352040', 'industry', 'Managed Care & Health Insurance', 'Health Care', 'Health Care',
 ARRAY['UNH','CVS','CI','HUM','CNC'], NULL, NULL,
 'managed care OR health insurance OR UnitedHealth OR CVS OR Cigna OR Humana OR Centene',
 'Medical loss ratios, Medicare Advantage, ACA enrollment, regulatory changes'),

-- ── FINANCIALS ────────────────────────────────────────────────────────────────
('401010', 'industry', 'Banks — Regional', 'Financials', 'Financials',
 ARRAY['USB','TFC','RF','CFG','FITB'], 'KRE', 'SPDR S&P Regional Banking ETF',
 'regional banks OR community banks OR US Bancorp OR Truist OR Regions OR Citizens Financial',
 'Net interest margins, credit quality, commercial real estate exposure, Fed rate policy'),

('401020', 'industry', 'Banks — Large Cap', 'Financials', 'Financials',
 ARRAY['JPM','BAC','WFC','C','GS'], 'KBE', 'SPDR S&P Bank ETF',
 'banks OR JPMorgan OR Bank of America OR Wells Fargo OR Citigroup OR Goldman Sachs',
 'Capital markets activity, net interest income, loan growth, credit card charge-offs'),

('401030', 'industry', 'Insurance — P&C', 'Financials', 'Financials',
 ARRAY['PGR','ALL','TRV','CB','HIG'], NULL, NULL,
 'insurance OR property casualty OR Progressive OR Allstate OR Travelers OR Chubb',
 'Catastrophe losses, pricing cycles, investment portfolio yields, combined ratio'),

('401040', 'industry', 'Life Insurance', 'Financials', 'Financials',
 ARRAY['MET','PRU','LNC','UNM','PFG'], NULL, NULL,
 'life insurance OR annuities OR MetLife OR Prudential OR Lincoln National OR Principal',
 'Interest rate sensitivity, mortality trends, annuity demand, equity market performance'),

('401050', 'industry', 'Asset Management', 'Financials', 'Financials',
 ARRAY['BLK','TROW','IVZ','BEN','WDR'], NULL, NULL,
 'asset management OR fund flows OR BlackRock OR T. Rowe Price OR Invesco OR Franklin Templeton',
 'AUM flows, market performance, fee compression, passive vs active shift'),

('401060', 'industry', 'Consumer Finance', 'Financials', 'Financials',
 ARRAY['COF','DFS','SYF','AXP','MA'], NULL, NULL,
 'consumer finance OR credit cards OR Capital One OR Discover OR Synchrony OR American Express',
 'Consumer credit quality, charge-off rates, revolving credit growth, unemployment'),

('401070', 'industry', 'Mortgage REITs', 'Financials', 'Financials',
 ARRAY['NLY','AGNC','MFA','IVR','TWO'], NULL, NULL,
 'mortgage REIT OR mREIT OR AGNC OR Annaly OR MFA Financial OR prepayment OR spread',
 'Interest rate volatility, prepayment speeds, spread between agency MBS and borrowing costs'),

-- ── UTILITIES ─────────────────────────────────────────────────────────────────
('551010', 'industry', 'Electric Utilities', 'Utilities', 'Utilities',
 ARRAY['NEE','SO','DUK','AEP','PCG'], 'XLU', 'Utilities Select Sector SPDR',
 'electric utilities OR power grid OR NEE OR NextEra OR Southern Company OR Duke Energy',
 'Regulatory environment, interest rates, renewable capex, data center load growth'),

('551020', 'industry', 'Natural Gas Utilities', 'Utilities', 'Utilities',
 ARRAY['EQT','SWX','NJR','ATO','NWN'], NULL, NULL,
 'natural gas OR gas utility OR EQT OR Southwest Gas OR Atmos Energy OR New Jersey Resources',
 'Gas prices, pipeline regulations, LNG export demand, heating demand'),

('551030', 'industry', 'Solar Energy', 'Utilities', 'Utilities',
 ARRAY['ENPH','SEDG','FSLR','RUN','ARRY'], 'TAN', 'Invesco Solar ETF',
 'solar energy OR solar panels OR Enphase OR SolarEdge OR First Solar OR Sunrun OR rooftop solar',
 'IRA incentives, module pricing, interest rates (affects residential demand), utility PPA rates'),

('551040', 'industry', 'Wind Energy', 'Utilities', 'Utilities',
 ARRAY['VWSYF','ORSTED','CWEN','BEP','NRGV'], 'FAN', 'First Trust Global Wind Energy ETF',
 'wind energy OR offshore wind OR Orsted OR Vestas OR wind turbines OR renewable energy',
 'Offshore permitting, supply chain costs, power purchase agreement pricing, IRA credits'),

-- ── REAL ESTATE ───────────────────────────────────────────────────────────────
('601010', 'industry', 'Data Centers & Cell Tower REITs', 'Real Estate', 'Real Estate',
 ARRAY['EQIX','DLR','AMT','CCI','SBAC'], NULL, NULL,
 'data center REIT OR cell tower OR Equinix OR Digital Realty OR American Tower OR Crown Castle',
 'AI infrastructure demand, cloud adoption, tower leasing escalators, interest rates'),

('601020', 'industry', 'Office REITs', 'Real Estate', 'Real Estate',
 ARRAY['BXP','VNO','SLG','HIW','PDM'], NULL, NULL,
 'office REIT OR office real estate OR BXP OR Vornado OR SL Green OR Highwoods OR vacancy',
 'Remote work adoption, lease expirations, financing costs, urban vs suburban flight'),

('601030', 'industry', 'Retail REITs', 'Real Estate', 'Real Estate',
 ARRAY['SPG','MAC','SKT','PREIT','CBL'], NULL, NULL,
 'retail REIT OR shopping mall OR Simon Property OR Macerich OR Tanger OR mall vacancy',
 'E-commerce disruption, anchor tenant health, occupancy rates, experiential retail'),

('601040', 'industry', 'Residential REITs', 'Real Estate', 'Real Estate',
 ARRAY['EQR','AVB','MAA','UDR','NMI'], NULL, NULL,
 'apartment REIT OR residential REIT OR Equity Residential OR AvalonBay OR rent growth',
 'Rental demand, supply additions, rent control risk, single-family home affordability'),

('601050', 'industry', 'Industrial REITs', 'Real Estate', 'Real Estate',
 ARRAY['PLD','REXR','FR','EGP','TRNO'], NULL, NULL,
 'industrial REIT OR warehouse OR logistics REIT OR Prologis OR Rexford OR East Group',
 'E-commerce fulfillment demand, near-shoring, rent growth, new supply'),

('601060', 'industry', 'Hotel REITs', 'Real Estate', 'Real Estate',
 ARRAY['HST','PK','RHP','SHO','BHR'], NULL, NULL,
 'hotel REIT OR lodging REIT OR Host Hotels OR Park Hotels OR RLJ OR Braemar OR RevPAR',
 'Business and leisure travel, ADR trends, meeting/event volumes, supply growth'),

('601070', 'industry', 'Timber REITs', 'Real Estate', 'Real Estate',
 ARRAY['WY','PCH','RYN','CTT'], 'WOOD', 'iShares Global Timber & Forestry ETF',
 'timber REIT OR lumber REIT OR Weyerhaeuser OR PotlatchDeltic OR Rayonier OR lumber prices',
 'Lumber prices, housing starts, land values, carbon credit monetization'),

-- ── INFORMATION TECHNOLOGY ────────────────────────────────────────────────────
('451010', 'industry', 'Semiconductors', 'Information Technology', 'Information Technology',
 ARRAY['NVDA','AMD','AVGO','QCOM','MRVL'], 'SOXX', 'iShares Semiconductor ETF',
 'semiconductors OR chips OR NVDA OR AMD OR Broadcom OR Qualcomm OR chip shortage OR AI chips',
 'AI infrastructure demand, smartphone cycle, PC cycle, inventory normalization, China exports'),

('451020', 'industry', 'Semiconductor Equipment', 'Information Technology', 'Information Technology',
 ARRAY['AMAT','LRCX','KLAC','ASML','TER'], NULL, NULL,
 'semiconductor equipment OR wafer fabrication OR AMAT OR Applied Materials OR ASML OR KLA',
 'Capex cycles at TSMC/Samsung/Intel, EUV lithography demand, CHIPS Act funding'),

('451030', 'industry', 'IT Hardware & Storage', 'Information Technology', 'Information Technology',
 ARRAY['AAPL','HPQ','DELL','STX','WDC'], NULL, NULL,
 'IT hardware OR PC OR storage OR Apple hardware OR HP OR Dell OR Seagate OR Western Digital',
 'PC replacement cycles, enterprise refresh cycles, cloud storage demand'),

('451040', 'industry', 'Software', 'Information Technology', 'Information Technology',
 ARRAY['MSFT','ORCL','CRM','NOW','ADBE'], NULL, NULL,
 'software OR SaaS OR Microsoft OR Oracle OR Salesforce OR ServiceNow OR enterprise software',
 'IT budgets, cloud migration, AI integration demand, seat expansion'),

('451050', 'industry', 'IT Services & Consulting', 'Information Technology', 'Information Technology',
 ARRAY['ACN','IBM','CTSH','DXC','EPAM'], NULL, NULL,
 'IT services OR consulting OR Accenture OR IBM OR Cognizant OR DXC OR outsourcing OR AI services',
 'Enterprise IT budgets, offshoring trends, AI automation displacement, labor arbitrage'),

-- ── COMMUNICATION SERVICES ────────────────────────────────────────────────────
('501010', 'industry', 'Internet & eCommerce', 'Communication Services', 'Communication Services',
 ARRAY['META','GOOGL','AMZN','NFLX','SNAP'], NULL, NULL,
 'internet OR social media OR Meta OR Google OR Amazon OR Netflix OR advertising OR digital ad',
 'Digital advertising cycles, streaming penetration, regulatory antitrust risk'),

('501020', 'industry', 'Traditional Media', 'Communication Services', 'Communication Services',
 ARRAY['DIS','CMCSA','WBD','PARA','FOX'], NULL, NULL,
 'media OR broadcasting OR Disney OR Comcast OR Warner Bros OR Paramount OR cord cutting',
 'Cord-cutting acceleration, streaming losses, box office recovery, advertising market'),

('501030', 'industry', 'Telecom', 'Communication Services', 'Communication Services',
 ARRAY['VZ','T','TMUS','LUMN','SHEN'], NULL, NULL,
 'telecom OR telecommunications OR Verizon OR AT&T OR T-Mobile OR 5G OR broadband OR fiber',
 'ARPU trends, 5G capex, broadband competition, debt loads, dividend sustainability'),

('501040', 'industry', 'Interactive Entertainment', 'Communication Services', 'Communication Services',
 ARRAY['ATVI','EA','TTWO','RBLX','U'], 'ESPO', 'VanEck Video Gaming and eSports ETF',
 'video games OR gaming OR Activision OR EA OR Take-Two OR Roblox OR Unity OR esports',
 'Gaming console cycle, mobile gaming trends, in-game spending, streaming vs ownership'),

-- ── ADDITIONAL CYCLICAL INDUSTRIES ───────────────────────────────────────────
('302010', 'industry', 'Homebuilding Materials & Fixtures', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['BLDR','GMS','IBP','SITE','DOOR'], NULL, NULL,
 'building materials OR lumber OR Builders FirstSource OR GMS OR IBP OR SiteOne OR Jeld-Wen',
 'Housing construction starts, R&R spending, contractor demand, lumber prices'),

('302020', 'industry', 'Cruise Lines', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['CCL','RCL','NCLH','LTH'], NULL, NULL,
 'cruise lines OR cruise OR Carnival OR Royal Caribbean OR Norwegian OR cruise demand',
 'Consumer discretionary spending, fuel costs, capacity additions, booking trends'),

('302030', 'industry', 'Casino & Gaming', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['LVS','WYNN','MGM','MLCO','CZR'], NULL, NULL,
 'casino OR gaming OR Macau OR Las Vegas Sands OR Wynn OR MGM OR Melco OR gambling',
 'Macau VIP volumes, US regional gaming, online gaming expansion, China policy'),

('603010', 'industry', 'Farmland & Agricultural REITs', 'Real Estate', 'Real Estate',
 ARRAY['FPI','LAND'], NULL, NULL,
 'farmland REIT OR agricultural real estate OR Farmland Partners OR Gladstone Land',
 'Crop prices, land values, water rights, agricultural productivity'),

('903010', 'industry', 'Clean Energy & Hydrogen', 'Utilities', 'Utilities',
 ARRAY['PLUG','BE','FCEL','BLDP','ITM'], NULL, NULL,
 'hydrogen OR fuel cell OR clean energy OR Plug Power OR Bloom Energy OR FuelCell Energy',
 'IRA subsidies, green hydrogen economics, industrial decarbonization demand'),

('251080', 'industry', 'Electric Vehicles', 'Consumer Discretionary', 'Consumer Discretionary',
 ARRAY['TSLA','RIVN','LCID','NIO','XPEV'], NULL, NULL,
 'electric vehicles OR EV OR Tesla OR Rivian OR Lucid OR NIO OR EV adoption OR BEV',
 'EV demand, charging infrastructure, battery costs, IRA incentives, China competition'),

('251090', 'industry', 'Cybersecurity', 'Information Technology', 'Information Technology',
 ARRAY['CRWD','PANW','ZS','FTNT','S'], 'CIBR', 'First Trust NASDAQ Cybersecurity ETF',
 'cybersecurity OR Crowdstrike OR Palo Alto OR Zscaler OR Fortinet OR SentinelOne OR security',
 'IT security budgets, breach frequency, platform consolidation, government mandates'),

('201120', 'industry', 'Water & Environmental Services', 'Utilities', 'Utilities',
 ARRAY['AWK','XYL','WTR','CWCO','ECL'], NULL, NULL,
 'water utilities OR water infrastructure OR American Water Works OR Xylem OR water scarcity',
 'Infrastructure investment, drought, regulatory mandates, water recycling demand');
