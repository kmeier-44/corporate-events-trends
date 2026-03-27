# Corporate Events Trends — Data Pipeline & Validation

## Overview

This report shows corporate event booking trends from 2022–2025, published at `organisers.html`. All data lives in `js/data.js` and is rendered by Chart.js via `js/charts-organisers.js`.

The data comes from two sources:
- **MongoDB** (primary) — Hire Space production `bookings` + `bookinglines` collections
- **Snowflake** — Used for venue type trends, industry venue/event type breakdowns, and conversion by lead time

**Financial data (booking values, PPH, spend by category/industry)** was switched from Snowflake CONTRACT table (~20% coverage) to MongoDB booking lines (99.5% coverage) on 27 March 2026. See `run_bookinglines.py` for the current methodology.

## How to Refresh the Data

When it's time to update the report (e.g. adding 2026 data), run the queries below against each source, compare with the current `data.js` values, and update.

### Prerequisites

**MongoDB:** See `.env` for connection string. Database: `live`, Collection: `bookinglines` (also: `invoices`, `companies`)

**Snowflake:** See `.env` for credentials. Warehouse: `COMPUTE_WH`, Database: `HIRE_SPACE`, Schema: `CORE_DATA`

Python dependencies: `pymongo`, `snowflake-connector-python`

## Data Sources by Section

| data.js section | Source | Query file | Notes |
|----------------|--------|------------|-------|
| `bookingValues` | MongoDB | `run_bookinglines.py` | Sum of won BL prices per won booking (99.5% coverage) |
| `valuesByCategory` | MongoDB | `run_bookinglines.py` | Same BL methodology, by category |
| `pricePerHead` | MongoDB | `run_bookinglines.py` | BL total value / people |
| `spendByIndustry` | MongoDB | `run_bookinglines.py` | BL values + companies.segment mapping |
| `industryProfiles` | MongoDB | `run_bookinglines.py` | BL values + companies.segment → industry group |
| `eventTypeProfiles` | MongoDB | `run_bookinglines.py` | BL values per category with spend, PPH, group, lead |
| `conversionByLeadTime` | Snowflake | `11-conversion-by-lead-time.js` | BL creation date vs event date |
| `leadTimes` | MongoDB | `03-lead-times.js` | timestamp → eventdate, booking-level |
| `groupSizes` | MongoDB | `02-group-sizes.js` | `people` field, booking-level |
| `categoryMix` | MongoDB | `07-category-mix.js` | Confirmed BLs by category slug |
| `seasonality` | MongoDB | `05-seasonality.js` | Event month distribution |
| `dayOfWeek` | MongoDB | `06-day-of-week.js` | Event day distribution |
| `venueShopping` | MongoDB | `04-venue-shopping.js` | Distinct venues per booking |
| `xmasParty` | MongoDB | `08-christmas-party.js` | Enquiry month, group sizes |
| `lostReasons` | MongoDB | `validate_all.py` | `reasonLost` field on Int BLs |
| `marketVolume` | MongoDB | `run_bookinglines.py` | Total market enquiry + won indexes (2022=100) |
| `categoryMix.enquiryIndex` | MongoDB | `run_bookinglines.py` | Enquiry volume index per category (2022=100) |
| `categoryMix.wonIndex` | MongoDB | `run_bookinglines.py` | Won booking volume index per category (2022=100) |
| `venueTypePricing` | Snowflake | — | Not yet validated from Snowflake |
| `industryProfiles.byEventType` | MongoDB | `industry_event_type_spend.py` | Cross-tab: spend, PPH, group size per industry × event type |
| `venueTypeConfirmed` | Snowflake | `run_snowflake.py` | Confirmed BL volume index by venue type (2022=100) |
| `venueTypeEnquiry` | Snowflake | `run_snowflake.py` | Enquiry BL volume index by venue type (2022=100) |
| `venueTypesByIndustry` | Snowflake | `16-industry-venue-types.sql` | ALL BLs + VENUES (boolean type cols) + HUBSPOT.COMPANIES; 2022–23 vs 2024–25 share |
| `eventTypesByIndustry` | Snowflake | `17-industry-event-types.sql` | ALL BLs (CATEGORY) + HUBSPOT.COMPANIES; 2022–23 vs 2024–25 share |
| `repeatBookings` | MongoDB | `09-repeat-bookings.js` | Repeat booking rates by year |
| `categoryMix` (proportions) | MongoDB | `10-enquiry-counts.js` | Raw enquiry counts by category (used to derive indexes) |
| Badge count | MongoDB | `12-total-counts.js` | Total bookings/enquiries for slide 1 badge |

## Schema Reference

### Terminology

| Term | Definition |
|------|-----------|
| **Booking** | A single enquiry from a client. One booking = one event being planned. This is the "enquiry" unit. |
| **Booking line (BL)** | A line item on a booking — one per venue contacted. A booking with 3 venues = 3 BLs. |
| **Confirmed (`situation: "Con"`)** | A booking line where the venue confirmed availability / was selected. Does NOT mean the client booked. |
| **Won (`status: "won"`)** | The client actually booked the event through Hire Space. This is a true conversion. |
| **bookingId** | Groups all BLs for the same enquiry. Use `$group` by `bookingId` to count unique bookings. |

**Important**: When counting "enquiries" or "bookings", always deduplicate by `bookingId`. Raw BL counts represent venue-enquiry lines, not unique bookings.

### MongoDB: `bookinglines` collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | BL ID (Meteor or UUID format) |
| `bookingId` | String | Parent booking ID |
| `situation` | String | `Con`=Confirmed, `Int`=Interested, `Sug`=Suggested, `Vie`=Viewing, `Don`=Done, `Unc`=Unclear, `Fin`=Final |
| `category` | String | Slug: `category-conference`, `category-christmasParty`, `category-corporateParty`, etc. |
| `eventdate` | Float | Epoch milliseconds (event date) |
| `timestamp` | Float | Epoch milliseconds (BL creation date) |
| `people` | Integer | Group size |
| `venueId` | Integer | Venue ID — **must filter with `{$type: "int"}`** to exclude nulls/strings |
| `budget` | Integer | Enquiry budget in GBP (NOT actual spend) |
| `companyData.name` | String | Company name (nested) |
| `companyData._id` | String | Company ID (nested) |
| `reasonLost` | String | Free-text lost reason (only on `Int` situation BLs) |
| `BLReference` | String | HS-XXXX format reference |
| `manualPrice` | String | "£1,000" format — **deprecated, only ~4K pre-2020 docs** |

**Key filters for confirmed BLs with venue data:**
```javascript
{ situation: "Con", venueId: { $type: "int" } }
```

**Year filter (2024 example):**
```javascript
{ eventdate: { $gte: 1704067200000, $lt: 1735689600000 } }
```

### MongoDB: Category Slug Mapping

| Display Name | MongoDB Slug |
|-------------|-------------|
| Conference | `category-conference` |
| Christmas Party | `category-christmasParty` |
| Corporate Party | `category-corporateParty` |
| Summer Party | `category-summerParty` |
| Meeting | `category-meeting` |
| Award Ceremony | `category-awardCeremony` |
| Networking | `category-networkingEvent` |
| Private Dining | `category-corporatePrivateDining` |
| Screening | `category-screening` |
| Ticketed Event | `category-ticketedEvent` |
| Pop-Up | `category-popUp` |
| Gala Dinner | `category-galaDinner` |
| Private Event | `category-privateEvent` |
| Presentation | `category-presentation` |
| Product Launch | `category-productLaunch` |
| Exhibition | `category-exhibition` |

### Snowflake: Key Tables

**`HIRE_SPACE.CORE_DATA.CONTRACT`** — The primary source for booking values.
| Column | Description |
|--------|-------------|
| `BOOKINGID` | Links to BOOKING_LINES.BOOKINGID |
| `TOTALCOSTEXCTAX` | Actual booking value (GBP, ex VAT) |
| `TOTALCOSTINCTAX` | Including VAT |
| `STATUS` | `fully signed`, `draft`, `not created`, `void` |
| `FULLYSIGNEDTIMESTAMP` | When the contract was signed |
| `META__CREATEDAT` | When the contract record was created |
| `EVENTDATE` | **Often NULL** — join to BOOKING_LINES for event date |

**`HIRE_SPACE.CORE_DATA.BOOKING_LINES`** — Mirror of MongoDB bookinglines.
| Column | Description |
|--------|-------------|
| `_ID` | BL ID |
| `BOOKINGID` | Parent booking |
| `SITUATION` | Con/Int/Sug/etc. |
| `CATEGORY` | Same slugs as MongoDB |
| `EVENTDATE` | Timestamp (proper TIMESTAMP_NTZ, not epoch ms) |
| `PEOPLE` | Group size |
| `VENUEID` | Integer venue ID |
| `COMPANYDATA___ID` | Company ID for joining to COMPANIES |
| `META__CREATEDAT` | BL creation timestamp |

**`HIRE_SPACE.CORE_DATA.COMPANIES`** — Company segment data.
| Column | Description |
|--------|-------------|
| `_ID` | Company ID |
| `SEGMENT` | e.g. `tech-medium`, `profServices-financial`, `agency-events` |

## Booking Value Methodology (current — MongoDB booking lines)

**Script:** `run_bookinglines.py`

The methodology for deriving actual booking spend:

1. **Get won bookings**: `bookings` collection, `status: 'won'`, event date 2022–2025, excluding non-corporate categories
2. **Get won booking lines**: `bookinglines` collection, `status: 'won'`, matching bookingId
3. **Price field**: Use `price` if > 0 (GBP). If `price` is 0/null, fall back to `localPrice` converted to GBP via `localCurrency` exchange rate
4. **Sum per booking**: Sum all won BL prices per booking (97.3% of bookings have exactly 1 won BL)
5. **Aggregate**: Median, p25, p75 by year, by category, by industry (via companies.segment)

**Coverage**: 99.5% of won bookings have at least one priced booking line (n=3,210 of 3,256 for 2022–2025).

**Currency**: 98.3% of won BLs have `price > 0` (already GBP). For the rest, `localPrice` is converted using approximate mid-market FX rates. Currencies: GBP (6,028), EUR (216), USD (50), plus 25 other currencies in small numbers.

### Previous methodology (Snowflake CONTRACT — deprecated)

The old approach used `HIRE_SPACE.CORE_DATA.CONTRACT` with `STATUS = 'fully signed'`, latest per booking. This had only ~20% coverage and skewed toward larger bookings. Queries preserved in `13-snowflake-booking-values.sql`, `14-industry-profiles.sql`, `15-event-type-profiles.sql` for reference.

## Snowflake: Industry Data

### HubSpot Industries (preferred — used for `industryProfiles`)

Source: `SEGMENT_EVENTS.HUBSPOT.COMPANIES.INDUSTRY`
Join: `HIRE_SPACE.CORE_DATA.COMPANIES.HUBSPOTID` = `SEGMENT_EVENTS.HUBSPOT.COMPANIES.HS_OBJECT_ID` (58,492 matches)

| Report Group | HubSpot INDUSTRY values |
|-------------|------------------------|
| Financial Services | `CAPITAL_MARKETS`, `INVESTMENT_MANAGEMENT`, `FINANCIAL_SERVICES`, `BANKING`, `INSURANCE`, `ACCOUNTING` |
| Professional Services | `MANAGEMENT_CONSULTING`, `LAW_PRACTICE`, `LEGAL_SERVICES`, `HUMAN_RESOURCES`, `STAFFING_AND_RECRUITING`, `MARKET_RESEARCH` |
| Technology | `COMPUTER_SOFTWARE`, `INFORMATION_TECHNOLOGY_AND_SERVICES`, `TELECOMMUNICATIONS` |
| Education & Training | `PROFESSIONAL_TRAINING_COACHING`, `HIGHER_EDUCATION`, `EDUCATION_MANAGEMENT` |
| Retail & Consumer | `RETAIL`, `CONSUMER_SERVICES`, `CONSUMER_GOODS`, `APPAREL_FASHION`, `LUXURY_GOODS_JEWELRY` |
| Property & Construction | `REAL_ESTATE`, `CONSTRUCTION`, `CIVIL_ENGINEERING`, `ARCHITECTURE_PLANNING` |
| Media & Marketing | `MARKETING_AND_ADVERTISING`, `PUBLIC_RELATIONS_AND_COMMUNICATIONS`, `PUBLISHING`, `ENTERTAINMENT` |
| Travel & Leisure | `LEISURE_TRAVEL_TOURISM`, `TRANSPORTATION_TRUCKING_RAILROAD`, `GAMBLING_CASINOS`, `HOSPITALITY` |
| Healthcare & Pharma | `HOSPITAL_HEALTH_CARE`, `PHARMACEUTICALS`, `COSMETICS` |

For personalisation, the proxy returns a HubSpot `industry` value. Match it against the `hubspotValues` array in each `industryProfiles` entry to find the right group.

### Legacy Segment Field (used for `spendByIndustry` — to be replaced)

The `COMPANIES.SEGMENT` field uses `parentCategory-subCategory` format:

| Report Segment | Snowflake SEGMENT values |
|---------------|------------------------|
| Technology | `tech-medium`, `tech-startup`, `tech-giant` |
| Professional Services | `profServices-financial`, `profServices-law`, `profServices-consultants`, `profServices-other`, `profServices-property`, `profServices-accountancy`, `profServices-insurance` |
| Associations | `association-education`, `association-charity`, `association-government`, `association-arts`, `association-health`, `association-other` |
| Agencies | `agency-advertisingMarketingCreative`, `agency-events`, `agency-pr`, `agency-other`, `agency-supplier` |
| B2C | `b2c-media`, `b2c-fashion`, `b2c-hospitality`, `b2c-food`, `b2c-retail`, `b2c-automotive`, `b2c-other` |
| B2B | `b2b-pharma`, `b2b-constructionEngineeringManufacturing`, `b2b-transport`, `b2b-other` |

## Epoch Millisecond Reference (for MongoDB queries)

| Date | Epoch ms |
|------|----------|
| 2022-01-01 | 1640995200000 |
| 2023-01-01 | 1672531200000 |
| 2024-01-01 | 1704067200000 |
| 2025-01-01 | 1735689600000 |
| 2026-01-01 | 1767225600000 |
| 2027-01-01 | 1798761600000 |

## HTML Hardcoded Values

The following values in `organisers.html` are hardcoded (not driven by data.js) and must be updated manually when the data changes:

| Location | Current Value | data.js source |
|----------|--------------|----------------|
| Slide 2 stat cards | +58% Booking Values, £3,801 → £6,000 | `bookingValues.median` |
| Slide 2 stat cards | +25% Venues Compared, 2.8 → 3.5 | `venueShopping.avgVenues` |
| Slide 2 stat cards | +68% Price Per Head, £53 → £89 | `pricePerHead.median` |
| Slide 2 stat cards | +39% Lead Times, 57 → 79 days | `leadTimes.median` |
| Slide 3 copy | "£3,801 in 2023 to £6,000 in 2025" | `bookingValues.median` |
| Slide 3 copy | "£53 in 2022 to £89 in 2025" | `pricePerHead.median` |
| Slide 4 copy | "£19,000 median" for award ceremonies | `valuesByCategory` |
| Slide 8 copy | "2.8 to 3.5 per enquiry" | `venueShopping.avgVenues` |
| Slide 12 copy | "58% since 2023", "£18,000" | `bookingValues` |

## Validation History

| Date | What | By |
|------|------|----|
| 25 March 2026 | Full MongoDB validation of all data sections | Claude |
| 25 March 2026 | Snowflake validation of booking values, PPH, category values, industry spend, conversion by lead time | Claude |
| 27 March 2026 | Switched financial data from Snowflake CONTRACT (~20% coverage) to MongoDB booking lines (99.5% coverage) | Claude |
| 27 March 2026 | Updated data.js, organisers.html copy, industry profiles, event type profiles with BL-based values | Claude |
