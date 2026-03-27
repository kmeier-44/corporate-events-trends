// ============================================================
// Conversion Rate by Lead Time
// ============================================================
// SOURCE: Snowflake — HIRE_SPACE.CORE_DATA.BOOKING_LINES
// METHOD: % of BLs that reach 'won' status, grouped by lead time bucket
// NOTE: Correctly uses bookinglines because conversion is a venue-line-level
//       metric — each BL is independently won or lost per venue.
// UPDATED: 27 March 2026 — SITUATION = 'Con' → STATUS = 'won'
//
// Lead time = days between BL creation (META__CREATEDAT) and event date (EVENTDATE)
// Longer lead times correlate with higher conversion — organisers who plan
// ahead are more likely to confirm.

// ── SNOWFLAKE QUERY ────────────────────────────────────────

/*
WITH bl_lt AS (
    SELECT
        DATEDIFF('day', META__CREATEDAT, EVENTDATE) AS lead_days,
        STATUS
    FROM HIRE_SPACE.CORE_DATA.BOOKING_LINES
    WHERE VENUEID IS NOT NULL
      AND EXTRACT(YEAR FROM EVENTDATE) BETWEEN 2022 AND 2025
      AND STATUS IN ('won', 'lost', 'void')
      AND META__CREATEDAT IS NOT NULL AND EVENTDATE IS NOT NULL
)
SELECT
    CASE
        WHEN lead_days < 14 THEN '0-2 weeks'
        WHEN lead_days < 30 THEN '2-4 weeks'
        WHEN lead_days < 60 THEN '1-2 months'
        WHEN lead_days < 90 THEN '2-3 months'
        WHEN lead_days < 180 THEN '3-6 months'
        ELSE '6+ months'
    END AS lead_bucket,
    COUNT(*) AS total,
    SUM(CASE WHEN STATUS = 'won' THEN 1 ELSE 0 END) AS confirmed,
    ROUND(SUM(CASE WHEN STATUS = 'won' THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 1) AS conv_pct
FROM bl_lt
WHERE lead_days >= 0
GROUP BY lead_bucket
ORDER BY MIN(lead_days);
*/

// Results (25 March 2026 — TO BE RE-RUN):
// Under 2 weeks: total=23,399, confirmed=2,247,  conversion=9.6%
// 2-4 weeks:     total=24,829, confirmed=3,077,  conversion=12.4%
// 1-2 months:    total=50,539, confirmed=12,275, conversion=24.3%
// 2-3 months:    total=39,413, confirmed=14,242, conversion=36.1%
// 3-6 months:    total=60,004, confirmed=26,101, conversion=43.5%
// 6+ months:     total=43,510, confirmed=19,138, conversion=44.0%
//
// data.js leadTimes.conversionByLeadTime:
//   { bucket: 'Under 2 weeks', pct: 9.6 }
//   { bucket: '2–4 weeks',     pct: 12.4 }
//   { bucket: '1–2 months',    pct: 24.3 }
//   { bucket: '2–3 months',    pct: 36.1 }
//   { bucket: '3–6 months',    pct: 43.5 }
//   { bucket: '6+ months',     pct: 44.0 }

// ── MONGODB EQUIVALENT (for reference) ─────────────────────

// MongoDB can approximate this but has limitations:
// - 'timestamp' (BL creation) is epoch ms float, not a clean timestamp
// - Need to filter to relevant statuses and exclude Don/Unc/Fin
// - The MongoDB query in validate_all.py produced similar but less clean results

// db.bookinglines.aggregate([
//   { $match: {
//     venueId: { $type: "int" },
//     eventdate: { $gt: 0 },
//     timestamp: { $exists: true, $gt: 0 },
//     status: { $in: ["won", "lost", "void"] }
//   }},
//   { $addFields: {
//     leadDays: { $divide: [{ $subtract: ["$eventdate", "$timestamp"] }, 86400000] }
//   }},
//   { $match: { leadDays: { $gt: 0, $lt: 730 } }},
//   { $bucket: {
//     groupBy: "$leadDays",
//     boundaries: [0, 14, 30, 60, 90, 180, 730],
//     output: {
//       total: { $sum: 1 },
//       won: { $sum: { $cond: [{ $eq: ["$status", "won"] }, 1, 0] } }
//     }
//   }}
// ])
