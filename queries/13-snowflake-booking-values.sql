-- ⚠️  DEPRECATED — 27 March 2026
-- These CONTRACT-based queries have been replaced by run_bookinglines.py
-- which uses MongoDB booking lines (99.5% coverage vs ~20% here).
-- Kept for reference only. See README.md for current methodology.
--
-- Original description:
-- Snowflake queries for booking values, PPH, values by category,
-- spend by industry, and conversion by lead time
-- Database: HIRE_SPACE.CORE_DATA
-- Source: CONTRACT table joined to BOOKINGS (for category, eventdate, people)
-- Coverage: ~19-23% of bookings (2023-2025). 2022 omitted (1.1% coverage).

-- =====================================================
-- 1. BOOKING VALUES (fully signed, latest per booking)
-- =====================================================
-- data.js updated: median [8562, 10922, 11500] for 2023-2025

WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX AS val,
           ROW_NUMBER() OVER (PARTITION BY BOOKINGID ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC) AS rn
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

-- Results (TO BE RE-RUN):
-- 2022: n=12, median=£3,306  (too few — omitted from data.js)
-- 2023: n=252, median=£8,562, p25=£3,395, p75=£16,875
-- 2024: n=336, median=£10,922, p25=£4,032, p75=£19,450
-- 2025: n=310, median=£11,500, p25=£4,167, p75=£21,122


-- =====================================================
-- 2. PRICE PER HEAD
-- =====================================================
-- data.js updated: median [101, 108, 108] for 2023-2025

WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX AS val,
           ROW_NUMBER() OVER (PARTITION BY BOOKINGID ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC) AS rn
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

-- Results (TO BE RE-RUN):
-- 2023: n=204, median=£101, p25=£62, p75=£142
-- 2024: n=320, median=£108, p25=£56, p75=£166
-- 2025: n=304, median=£108, p25=£56, p75=£170


-- =====================================================
-- 3. VALUES BY CATEGORY
-- =====================================================

WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX AS val,
           ROW_NUMBER() OVER (PARTITION BY BOOKINGID ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC) AS rn
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

-- Results (TO BE RE-RUN):
-- Exhibition: n=6, median=£22,582, pph=£127
-- Product Launch: n=10, median=£15,916, pph=£134
-- Gala Dinner: n=13, median=£15,000, pph=£66
-- Award Ceremony: n=33, median=£14,327, pph=£82
-- Private Event: n=13, median=£14,143, pph=£91
-- Networking: n=70, median=£13,332, pph=£125
-- Christmas Party: n=100, median=£13,150, pph=£113
-- Conference: n=187, median=£11,688, pph=£97
-- Meeting: n=70, median=£4,454, pph=£125


-- =====================================================
-- 4. SPEND BY INDUSTRY
-- =====================================================

WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX AS val,
           ROW_NUMBER() OVER (PARTITION BY BOOKINGID ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC) AS rn
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

-- Key results (TO BE RE-RUN):
-- Technology: median=£10,958–£17,388 (startup/medium/giant)
-- Professional Services: median=£2,996–£12,834 (consultants–financial)
-- Associations: median=£6,650–£19,070 (other–charity)
-- Agencies: median=£5,935–£16,000 (events–pr)


-- =====================================================
-- 5. CONVERSION BY LEAD TIME
-- =====================================================
-- NOTE: This query correctly uses BOOKING_LINES because it measures
--       venue-line-level conversion rates (a booking line is won or lost
--       independently per venue). Lead time is BL creation to event date.

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

-- Results (TO BE RE-RUN):
-- Under 2 weeks: 9.6%
-- 2-4 weeks: 12.4%
-- 1-2 months: 24.3%
-- 2-3 months: 36.1%
-- 3-6 months: 43.5%
-- 6+ months: 44.0%


-- =====================================================
-- 6. COVERAGE
-- =====================================================

SELECT EXTRACT(YEAR FROM b.EVENTDATE) AS yr,
       COUNT(DISTINCT b."_ID") AS total,
       COUNT(DISTINCT CASE WHEN lc.rn = 1 THEN b."_ID" END) AS with_contract
FROM HIRE_SPACE.CORE_DATA.BOOKINGS b
LEFT JOIN (
    SELECT BOOKINGID,
           ROW_NUMBER() OVER (PARTITION BY BOOKINGID ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC) AS rn
    FROM HIRE_SPACE.CORE_DATA.CONTRACT
    WHERE STATUS = 'fully signed' AND TOTALCOSTEXCTAX > 0
) lc ON b."_ID" = lc.BOOKINGID
WHERE b.STATUS = 'won'
  AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2022 AND 2025
GROUP BY yr ORDER BY yr;

-- Results (TO BE RE-RUN):
-- 2022: 12/1135 (1.1%) — omitted from data.js
-- 2023: 252/1349 (18.7%)
-- 2024: 336/1534 (21.9%)
-- 2025: 310/1345 (23.0%)
