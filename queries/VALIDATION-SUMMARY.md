# Data Validation Summary

**Date:** 25 March 2026
**See also:** `README.md` for full schema reference, methodology, and refresh instructions.

## Sources

| Source | Connection | Used for |
|--------|-----------|----------|
| MongoDB Atlas | `bookinglines` collection, `live` database | Lead times, group sizes, seasonality, day of week, category mix, venue shopping, repeat bookings, xmas party, lost reasons, enquiry counts |
| Snowflake | `HIRE_SPACE.CORE_DATA.CONTRACT` + `BOOKING_LINES` | Booking values, PPH, values by category, spend by industry, conversion by lead time |

## Validation Status

### From MongoDB (validated and updated)

| data.js section | Status | Query file |
|----------------|--------|------------|
| `leadTimes` (median, p25, p75, byCategory) | Updated | `03-lead-times.js` |
| `groupSizes` (median, p25, p75, byCategory) | Updated | `02-group-sizes.js` |
| `seasonality.overall` | Updated | `05-seasonality.js` |
| `dayOfWeek` | Updated | `06-day-of-week.js` |
| `categoryMix` | Updated | `07-category-mix.js` |
| `venueShopping` (avgVenues, multiVenuePct) | Updated | `04-venue-shopping.js` |
| `repeatBookings` | Updated | `09-repeat-bookings.js` |
| `xmasParty` (enquiryMonth, groupSizes) | Updated | `08-christmas-party.js` |
| `lostReasons` | Updated | `validate_all.py` |
| `enquiryCounts` | Updated | `10-enquiry-counts.js` |

### From Snowflake (validated and updated)

| data.js section | Status | Query file |
|----------------|--------|------------|
| `bookingValues` (median, p25, p75) | Updated — now 2023-2025 only | `01-booking-values.js` |
| `valuesByCategory` | Updated — 16 categories from CONTRACT | `01-booking-values.js` |
| `pricePerHead` (median, byCategory) | Updated — now 2023-2025 only | `01-booking-values.js` |
| `spendByIndustry` | Updated — 6 segments from CONTRACT+COMPANIES | `01-booking-values.js` |
| `leadTimes.conversionByLeadTime` | Updated — 9.6%-44.0% range | `11-conversion-by-lead-time.js` |

### From Snowflake + HubSpot (validated and updated)

| data.js section | Status | Query file |
|----------------|--------|------------|
| `industryProfiles` | New — 9 industry groups from HubSpot INDUSTRY | `14-industry-profiles.sql` |
| `eventTypeProfiles` | New — 10 event types with spend, PPH, group, lead, peaks | `15-event-type-profiles.sql` |

### Not yet validated

| data.js section | Reason |
|----------------|--------|
| `venueTypePricing` | Needs venue type data joined to contracts |

## Key Decisions

1. **2022 omitted from financial figures** — Only 1.1% of 2022 bookings have fully signed contracts (contracts weren't widely used). 2023-2025 have 19-23% coverage.

2. **Contract bias is intentional** — Contract-based values skew toward larger/more formal bookings. The report targets organisers of these events, so this is the relevant dataset.

3. **Latest contract per booking** — When multiple fully signed contracts exist for one booking, we take the most recently signed one (`FULLYSIGNEDTIMESTAMP DESC`), as it represents the final agreed value.

4. **MongoDB for non-financial data** — Lead times, group sizes, seasonality, etc. come from MongoDB where coverage is near 100% of confirmed BLs.

## Coverage Summary

| Year | Confirmed bookings | With signed contract | Coverage |
|------|-------------------|---------------------|----------|
| 2022 | 1,135 | 12 | 1.1% |
| 2023 | 1,349 | 252 | 18.7% |
| 2024 | 1,534 | 336 | 21.9% |
| 2025 | 1,345 | 310 | 23.0% |
