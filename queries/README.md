# Corporate Events Trends — Data Pipeline & Validation

## Overview

This report shows corporate event booking trends from 2022–2025, published at `organisers.html`. All data lives in `js/data.js` and is rendered by Chart.js via `js/charts-organisers.js`.

The data comes from two sources:
- **MongoDB** (primary) — Hire Space production `bookinglines` collection
- **Snowflake** (for financial data) — `HIRE_SPACE.CORE_DATA.CONTRACT` table

## How to Refresh the Data

When it's time to update the report (e.g. adding 2026 data), run the queries below against each source, compare with the current `data.js` values, and update.

### Prerequisites

**MongoDB:** See `.env` for connection string. Database: `live`, Collection: `bookinglines` (also: `invoices`, `companies`)

**Snowflake:** See `.env` for credentials. Warehouse: `COMPUTE_WH`, Database: `HIRE_SPACE`, Schema: `CORE_DATA`

Python dependencies: `pymongo`, `snowflake-connector-python`

## Data Sources by Section

| data.js section | Source | Query file | Notes |
|----------------|--------|------------|-------|
| `bookingValues` | Snowflake | `01-booking-values.js` | CONTRACT table, fully signed, latest per booking |
| `valuesByCategory` | Snowflake | `01-booking-values.js` | Same CONTRACT methodology |
| `pricePerHead` | Snowflake | `01-booking-values.js` | CONTRACT value / people |
| `spendByIndustry` | Snowflake | `01-booking-values.js` | CONTRACT + COMPANIES.SEGMENT |
| `conversionByLeadTime` | Snowflake | `11-conversion-by-lead-time.js` | BL creation date vs event date |
| `leadTimes` | MongoDB | `03-lead-times.js` | timestamp → eventdate, booking-level |
| `groupSizes` | MongoDB | `02-group-sizes.js` | `people` field, booking-level |
| `categoryMix` | MongoDB | `07-category-mix.js` | Confirmed BLs by category slug |
| `seasonality` | MongoDB | `05-seasonality.js` | Event month distribution |
| `dayOfWeek` | MongoDB | `06-day-of-week.js` | Event day distribution |
| `venueShopping` | MongoDB | `04-venue-shopping.js` | Distinct venues per booking |
| ~~`repeatBookings`~~ | ~~MongoDB~~ | ~~`09-repeat-bookings.js`~~ | Removed — not used in any report |
| `xmasParty` | MongoDB | `08-christmas-party.js` | Enquiry month, group sizes |
| `lostReasons` | MongoDB | `validate_all.py` | `reasonLost` field on Int BLs |
| `enquiryCounts` | MongoDB | `10-enquiry-counts.js` | Proportions (%) of bookings by category |
| `venueTypePricing` | Snowflake | — | Not yet validated from Snowflake |
| `industryProfiles` | Snowflake | `14-industry-profiles.sql` | CONTRACT + HUBSPOT.COMPANIES via HUBSPOTID |
| `eventTypeProfiles` | Snowflake | `15-event-type-profiles.sql` | CONTRACT + BOOKING_LINES, peaks from all confirmed BLs |
| `venueTypesByIndustry` | Snowflake | `16-industry-venue-types.sql` | ALL BLs + VENUES (boolean type cols) + HUBSPOT.COMPANIES; 2022–23 vs 2024–25 share |
| `eventTypesByIndustry` | Snowflake | `17-industry-event-types.sql` | ALL BLs (CATEGORY) + HUBSPOT.COMPANIES; 2022–23 vs 2024–25 share |

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

## Snowflake: Booking Value Methodology

The methodology for deriving actual booking spend:

1. **Filter contracts**: `STATUS = 'fully signed'` and `TOTALCOSTEXCTAX > 0`
2. **Deduplicate**: Take the latest signed contract per booking (by `FULLYSIGNEDTIMESTAMP DESC`, then `META__CREATEDAT DESC`)
3. **Join to BLs**: Via `BOOKINGID` to get event date, people, category
4. **Aggregate at booking level**: One BL per booking (MIN eventdate, MAX people, MIN category)

**Coverage**: ~19-23% of confirmed bookings (2023-2025). 2022 has only 1.1% coverage (contracts weren't widely used) so is omitted from financial figures.

**Bias**: Contract-based values skew toward larger/more formal bookings. This is intentional — the report targets organisers of these larger events.

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
| Slide 2 stat cards | +34% Booking Values, £8,562 → £11,500 | `bookingValues.median` |
| Slide 2 stat cards | +25% Venues Compared, 2.8 → 3.5 | `venueShopping.avgVenues` |
| Slide 2 stat cards | +7% Price Per Head, £101 → £108 | `pricePerHead.median` |
| Slide 2 stat cards | +19% Lead Times, 93 → 111 days | `leadTimes.median` |
| Slide 3 copy | "£8,562 in 2023 to £11,500 in 2025" | `bookingValues.median` |
| Slide 3 copy | "£101–£108 across 2023–2025" | `pricePerHead.median` |
| Slide 8 copy | "2.8 to 3.5 per enquiry" | `venueShopping.avgVenues` |

## Validation History

| Date | What | By |
|------|------|----|
| 25 March 2026 | Full MongoDB validation of all data sections | Claude |
| 25 March 2026 | Snowflake validation of booking values, PPH, category values, industry spend, conversion by lead time | Claude |
