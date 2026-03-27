# Data Validation Summary

**Date:** 27 March 2026
**See also:** `README.md` for full schema reference, methodology, and refresh instructions.

## Sources

| Source | Connection | Used for |
|--------|-----------|----------|
| MongoDB Atlas | `bookings` + `bookinglines` collections, `live` database | Booking values, PPH, values by category, spend by industry, industry profiles, event type profiles, lead times, group sizes, seasonality, day of week, category mix, venue shopping, xmas party, lost reasons, enquiry counts |
| Snowflake | `HIRE_SPACE.CORE_DATA.BOOKING_LINES` | Conversion by lead time, venue type trends by industry, event type trends by industry |

## Methodology Change (27 March 2026)

**Financial data switched from Snowflake CONTRACT to MongoDB booking lines.**

| | Old (CONTRACT) | New (Booking Lines) |
|--|----------------|---------------------|
| Source | `HIRE_SPACE.CORE_DATA.CONTRACT` | MongoDB `bookinglines.price` / `localPrice` |
| Coverage | ~20% of won bookings | 99.5% of won bookings |
| Years | 2023–2025 only (2022 had 1.1%) | 2022–2025 |
| Bias | Skewed toward larger/formal bookings | Representative of all event sizes |
| Script | `run_snowflake.py` (deprecated) | `run_bookinglines.py` |

**Impact on key figures:**

| Metric | Old | New | Change |
|--------|-----|-----|--------|
| Median spend 2025 | £11,000 | £6,000 | -45% (fuller market view) |
| Growth 2023→2025 | +28% | +58% | Stronger trend |
| PPH 2025 | £110 | £89 | Lower (includes smaller events) |
| Conference median | £12,447 | £10,001 | -20% |
| Meeting median | £4,392 | £905 | -79% (small meetings now included) |
| Award Ceremony median | £13,438 | £18,900 | +41% (more data) |

## Validation Status

### From MongoDB — booking lines (financial data)

| data.js section | Status | Query file |
|----------------|--------|------------|
| `bookingValues` (median, p25, p75, 2022-2025) | Updated 27 Mar | `run_bookinglines.py` |
| `valuesByCategory` (16 categories) | Updated 27 Mar | `run_bookinglines.py` |
| `pricePerHead` (median, byCategory, 2022-2025) | Updated 27 Mar | `run_bookinglines.py` |
| `spendByIndustry` (8 industry groups) | Updated 27 Mar | `run_bookinglines.py` |
| `industryProfiles` (8 groups with spend, PPH, group, lead) | Updated 27 Mar | `run_bookinglines.py` |
| `eventTypeProfiles` (10 types with spend, PPH, group, lead) | Updated 27 Mar | `run_bookinglines.py` |

### From MongoDB — bookings collection (non-financial)

| data.js section | Status | Query file |
|----------------|--------|------------|
| `leadTimes` (median, p25, p75, byCategory) | Updated 25 Mar | `03-lead-times.js` |
| `groupSizes` (median, p25, p75, byCategory) | Updated 25 Mar | `02-group-sizes.js` |
| `seasonality.overall` | Updated 25 Mar | `05-seasonality.js` |
| `dayOfWeek` | Updated 25 Mar | `06-day-of-week.js` |
| `categoryMix` | Updated 25 Mar | `07-category-mix.js` |
| `venueShopping` (avgVenues, multiVenuePct) | Updated 25 Mar | `04-venue-shopping.js` |
| `xmasParty` (enquiryMonth, groupSizes) | Updated 25 Mar | `08-christmas-party.js` |
| `lostReasons` | Updated 25 Mar | `validate_all.py` |
| `enquiryCounts` | Updated 25 Mar | `10-enquiry-counts.js` |

### From Snowflake

| data.js section | Status | Query file |
|----------------|--------|------------|
| `leadTimes.conversionByLeadTime` | Updated 25 Mar | `11-conversion-by-lead-time.js` |
| `venueTypesByIndustry` | Updated 26 Mar | `16-industry-venue-types.sql` |
| `eventTypesByIndustry` | Updated 26 Mar | `17-industry-event-types.sql` |

### Not yet validated

| data.js section | Reason |
|----------------|--------|
| `venueTypePricing` | Needs venue type data joined to booking line prices |

## Coverage Summary (new BL-based approach)

| Year | Won bookings | With priced BLs | Coverage |
|------|-------------|-----------------|----------|
| 2022 | ~810 | 793 | 97.9% |
| 2023 | ~760 | 741 | 97.5% |
| 2024 | ~890 | 874 | 98.2% |
| 2025 | ~820 | 802 | 97.8% |
| **Total** | **3,256** | **3,210** | **98.6%** |

## Key Decisions

1. **Booking lines replace contracts** — The `price` field on won booking lines has 98.3% coverage (13,662 of 13,904 won BLs). Combined with `localPrice` fallback, coverage reaches 99.5%. This is far superior to CONTRACT's ~20%.

2. **Currency handling** — `price` is in GBP. When `price` is 0/null, `localPrice` is converted via `localCurrency` and approximate FX rates. GBP accounts for 93.6% of localPrice records; EUR 3.3%; USD 0.8%.

3. **Sum per booking** — Won BL prices are summed per booking. 97.3% of bookings have exactly 1 won BL; 2.3% have 2 (multi-venue bookings); 0.4% have 3+.

4. **2022 now included** — With 793 priced bookings in 2022, there's ample data (vs 12 from CONTRACT). Financial figures now span 2022–2025.

5. **Industry mapping via segment** — Industry profiles use `companies.segment` → industry group mapping instead of HubSpot INDUSTRY via Snowflake. The `hubspotValues` arrays are retained for personalisation matching.
