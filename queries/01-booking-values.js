// ============================================================
// Booking Values, PPH, Values by Category, Spend by Industry
// ============================================================
// SOURCE: Snowflake — HIRE_SPACE.CORE_DATA.CONTRACT + BOOKINGS
// METHOD: Fully signed contracts, latest per booking (deduped),
//         joined to BOOKINGS for event date, people, category.
// COVERAGE: ~19-23% of bookings (2023-2025). 2022 omitted (1.1%).
// UPDATED: 27 March 2026 — switched from BOOKING_LINES to BOOKINGS
//
// Why CONTRACT? MongoDB has no reliable actual-spend field.
// - manualPrice: deprecated, only ~4K pre-2020 docs
// - budget: enquiry budget, not actual spend
// - invoices: commission amounts (~10%), only ~6% coverage
// - proposal-costs: venue proposals, mostly cost=0
//
// Why fully signed + latest? A booking can have multiple contracts
// (drafts, revisions). We take STATUS = 'fully signed' and pick
// the most recently signed one per booking.

// ── SNOWFLAKE: Booking Values ──────────────────────────────

/*
WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX AS val,
           ROW_NUMBER() OVER (
               PARTITION BY BOOKINGID
               ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC
           ) AS rn
    FROM HIRE_SPACE.CORE_DATA.CONTRACT
    WHERE STATUS = 'fully signed' AND TOTALCOSTEXCTAX > 0
)
SELECT EXTRACT(YEAR FROM b.EVENTDATE) AS yr,
       COUNT(*) AS n,
       MEDIAN(lc.val) AS med,
       PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY lc.val) AS p25,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lc.val) AS p75,
       AVG(lc.val) AS mean
FROM latest_contract lc
JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
WHERE lc.rn = 1
  AND b.STATUS = 'won'
  AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2022 AND 2025
GROUP BY yr ORDER BY yr;
*/

// Results (25 March 2026 — TO BE RE-RUN):
// 2022: n=12,  median=£3,306   (omitted — too few)
// 2023: n=252, median=£8,562,  p25=£3,395, p75=£16,875
// 2024: n=336, median=£10,922, p25=£4,032, p75=£19,450
// 2025: n=310, median=£11,500, p25=£4,167, p75=£21,122
//
// data.js bookingValues:
//   years: [2023, 2024, 2025]
//   median: [8562, 10922, 11500]
//   p25: [3395, 4032, 4167]
//   p75: [16875, 19450, 21122]


// ── SNOWFLAKE: Price Per Head ──────────────────────────────

/*
WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX AS val,
           ROW_NUMBER() OVER (
               PARTITION BY BOOKINGID
               ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC
           ) AS rn
    FROM HIRE_SPACE.CORE_DATA.CONTRACT
    WHERE STATUS = 'fully signed' AND TOTALCOSTEXCTAX > 0
)
SELECT EXTRACT(YEAR FROM b.EVENTDATE) AS yr,
       COUNT(*) AS n,
       MEDIAN(lc.val / b.PEOPLE) AS med,
       PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY lc.val / b.PEOPLE) AS p25,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lc.val / b.PEOPLE) AS p75
FROM latest_contract lc
JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
WHERE lc.rn = 1
  AND b.STATUS = 'won'
  AND b.PEOPLE > 0
  AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2022 AND 2025
  AND lc.val / b.PEOPLE > 1 AND lc.val / b.PEOPLE < 5000
GROUP BY yr ORDER BY yr;
*/

// Results (TO BE RE-RUN):
// 2023: n=204, median=£101, p25=£62, p75=£142
// 2024: n=320, median=£108, p25=£56, p75=£166
// 2025: n=304, median=£108, p25=£56, p75=£170
//
// data.js pricePerHead:
//   years: [2023, 2024, 2025]
//   median: [101, 108, 108]


// ── SNOWFLAKE: Values by Category ──────────────────────────

/*
WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX AS val,
           ROW_NUMBER() OVER (
               PARTITION BY BOOKINGID
               ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC
           ) AS rn
    FROM HIRE_SPACE.CORE_DATA.CONTRACT
    WHERE STATUS = 'fully signed' AND TOTALCOSTEXCTAX > 0
)
SELECT b.CATEGORY, COUNT(*) AS n,
       MEDIAN(lc.val) AS med_val,
       MEDIAN(lc.val / NULLIF(b.PEOPLE, 0)) AS med_pph
FROM latest_contract lc
JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
WHERE lc.rn = 1
  AND b.STATUS = 'won'
  AND b.CATEGORY IS NOT NULL
  AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2022 AND 2025
GROUP BY b.CATEGORY
HAVING COUNT(*) >= 5
ORDER BY med_val DESC;
*/

// Results (TO BE RE-RUN):
// Exhibition:       n=6,   median=£22,582, pph=£127
// Product Launch:   n=10,  median=£15,916, pph=£134
// Gala Dinner:      n=13,  median=£15,000, pph=£66
// Award Ceremony:   n=33,  median=£14,327, pph=£82
// Private Event:    n=13,  median=£14,143, pph=£91
// Networking:       n=70,  median=£13,332, pph=£125
// Christmas Party:  n=100, median=£13,150, pph=£113
// Ticketed Event:   n=37,  median=£12,019, pph=£105
// Conference:       n=187, median=£11,688, pph=£97
// Summer Party:     n=61,  median=£11,452, pph=£98
// Corporate Party:  n=75,  median=£10,063, pph=£98
// Screening:        n=62,  median=£8,380,  pph=£98
// Pop-Up:           n=36,  median=£8,214,  pph=£125
// Private Dining:   n=76,  median=£4,851,  pph=£122
// Presentation:     n=25,  median=£4,566,  pph=£102
// Meeting:          n=70,  median=£4,454,  pph=£125


// ── SNOWFLAKE: Spend by Industry ───────────────────────────

/*
WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX AS val,
           ROW_NUMBER() OVER (
               PARTITION BY BOOKINGID
               ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC
           ) AS rn
    FROM HIRE_SPACE.CORE_DATA.CONTRACT
    WHERE STATUS = 'fully signed' AND TOTALCOSTEXCTAX > 0
)
SELECT comp.SEGMENT, COUNT(*) AS n,
       MEDIAN(lc.val) AS med,
       AVG(lc.val) AS mean
FROM latest_contract lc
JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
JOIN HIRE_SPACE.CORE_DATA.COMPANIES comp ON b."COMPANYDATA___ID" = comp."_ID"
WHERE lc.rn = 1
  AND b.STATUS = 'won'
  AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2022 AND 2025
  AND comp.SEGMENT IS NOT NULL AND comp.SEGMENT != ''
GROUP BY comp.SEGMENT
HAVING COUNT(*) >= 5
ORDER BY med DESC;
*/

// Results (TO BE RE-RUN):
// tech-startup:        n=12, median=£17,388
// profServices-financial: n=22, median=£12,676
// association-education: n=11, median=£14,363
// agency-advertisingMarketingCreative: n=35, median=£8,227
// tech-medium:         n=124, median=£10,958
// profServices-consultants: n=50, median=£2,996
//
// Grouped for data.js spendByIndustry:
// Technology:          median=£12,785 (n=165)
// Associations:        median=£14,363 (n=65)
// B2B:                 median=£12,501 (n=23)
// Professional Services: median=£11,245 (n=140)
// Agencies:            median=£10,267 (n=84)
// B2C:                 median=£10,267 (n=30)


// ── SNOWFLAKE: Coverage ────────────────────────────────────

// 2022: 12/1135  (1.1%) — omitted
// 2023: 252/1349 (18.7%)
// 2024: 336/1534 (21.9%)
// 2025: 310/1345 (23.0%)


// ── MONGODB: Budget (for reference only, NOT used in report) ──

// db.bookings.aggregate([
//   { $match: { status: "won",
//               eventdate: { $gte: 1704067200000, $lt: 1735689600000 },
//               budget: { $gt: 0 } }},
//   { $group: { _id: null, values: { $push: "$budget" } }},
//   { $project: { count: { $size: "$values" },
//                 sorted: { $sortArray: { input: "$values", sortBy: 1 } } }}
// ])
//
// Budget is the ENQUIRY budget (what the organiser says they want to spend),
// NOT the actual booking value. Coverage is ~85-97% but values cluster
// around round numbers (£10K, £15K, £20K, £30K).
