-- ⚠️  DEPRECATED — 27 March 2026
-- Event type profiles now come from run_bookinglines.py using MongoDB booking lines.
-- Kept for reference only.
--
-- ============================================================
-- Event Type Profiles — Spend, PPH, group size, lead time per category
-- ============================================================
-- SOURCE: Snowflake — CONTRACT + BOOKINGS
-- PERIOD: 2023-2025 (fully signed contracts only)

WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX,
           ROW_NUMBER() OVER (PARTITION BY BOOKINGID
               ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC) as rn
    FROM HIRE_SPACE.CORE_DATA.CONTRACT
    WHERE STATUS = 'fully signed' AND TOTALCOSTEXCTAX > 0
),
booking_details AS (
    SELECT lc.BOOKINGID, lc.TOTALCOSTEXCTAX,
           b.EVENTDATE as event_date,
           b.PEOPLE as people,
           b.CATEGORY as category,
           DATEDIFF(day, b.META__CREATEDAT, b.EVENTDATE) as lead_days
    FROM latest_contract lc
    JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
    WHERE lc.rn = 1
      AND b.STATUS = 'won'
      AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2023 AND 2025
)
SELECT category,
       COUNT(*) as n,
       MEDIAN(TOTALCOSTEXCTAX) as median_spend,
       PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY TOTALCOSTEXCTAX) as p25_spend,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY TOTALCOSTEXCTAX) as p75_spend,
       MEDIAN(TOTALCOSTEXCTAX / NULLIF(people, 0)) as median_pph,
       MEDIAN(people) as median_group,
       PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY people) as p25_group,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY people) as p75_group,
       MEDIAN(lead_days) as median_lead,
       PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY lead_days) as p25_lead,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lead_days) as p75_lead
FROM booking_details
WHERE category IS NOT NULL
GROUP BY category
HAVING COUNT(*) >= 5
ORDER BY n DESC;

-- Peak months and days query (uses BOOKINGS directly now):
--   SELECT CATEGORY, EXTRACT(MONTH FROM EVENTDATE) as m, COUNT(*) as n
--   FROM HIRE_SPACE.CORE_DATA.BOOKINGS
--   WHERE STATUS = 'won'
--     AND EXTRACT(YEAR FROM EVENTDATE) BETWEEN 2022 AND 2025
--   GROUP BY CATEGORY, m ORDER BY CATEGORY, n DESC

-- Results (25 March 2026 — TO BE RE-RUN):
--
-- conference:             n=187, spend=£11,688 (£5,235–£24,918), pph=£97,  group=150 (90–225),  lead=129d (79–200d), peaks: Nov/Sep/Jun, Fri
-- christmasParty:         n=99,  spend=£13,500 (£8,170–£22,660), pph=£112, group=120 (100–200), lead=118d (82–232d), peaks: Dec/Nov, Fri
-- corporatePrivateDining: n=75,  spend=£4,975  (£2,130–£13,310), pph=£122, group=40  (20–100),  lead=87d  (54–136d), peaks: Oct/Dec/Nov, Fri
-- corporateParty:         n=74,  spend=£10,282 (£3,867–£18,830), pph=£101, group=100 (60–200),  lead=106d (68–182d), peaks: Dec/Nov/Jun, Fri
-- networkingEvent:        n=69,  spend=£13,333 (£5,630–£21,467), pph=£125, group=100 (70–150),  lead=111d (48–204d), peaks: Dec/Nov/Oct, Fri
-- meeting:                n=67,  spend=£4,542  (£1,944–£9,134),  pph=£125, group=30  (18–68),   lead=57d  (24–112d), peaks: Sep/Oct/Nov, Wed
-- screening:              n=62,  spend=£8,380  (£2,796–£15,282), pph=£98,  group=90  (39–130),  lead=98d  (56–154d), peaks: Nov/Jun/Oct, Fri
-- summerParty:            n=61,  spend=£11,452 (£5,653–£23,333), pph=£98,  group=122 (85–200),  lead=97d  (67–153d), peaks: Jul/Jun/Sep, Fri
-- ticketedEvent:          n=37,  spend=£12,019 (£3,650–£19,500), pph=£105, group=100 (60–200),  lead=119d (77–159d), peaks: Dec/Nov/Sep, Fri
-- awardCeremony:          n=33,  spend=£14,327 (£7,145–£33,865), pph=£82,  group=200 (180–300), lead=173d (100–279d), peaks: Nov/Oct/Sep, Fri
-- popUp:                  n=34,  spend=£8,948  (£4,717–£15,233), pph=£125, group=100 (32–150),  lead=84d  (59–206d), peaks: Dec/Sep/Nov, Fri
-- presentation:           n=24,  spend=£4,870  (£2,746–£12,403), pph=£106, group=60  (28–135),  lead=58d  (40–102d), peaks: Oct/Sep/Jun, Fri
-- privateEvent:           n=13,  spend=£14,143 (£7,431–£22,591), pph=£91,  group=160 (92–300),  lead=92d  (65–160d), peaks: Jun/Nov/Oct, Fri
-- galaDinner:             n=13,  spend=£15,000 (£5,000–£21,271), pph=£66,  group=200 (150–250), lead=163d (141–213d), peaks: Nov/Mar/May, Fri
-- awayDay:                n=12,  spend=£10,103 (£3,950–£17,868), pph=£84,  group=128 (82–148),  lead=76d  (50–127d), peaks: Nov/Apr/May, Fri
-- productLaunch:          n=10,  spend=£15,916 (£11,675–£18,833), pph=£134, group=90  (58–115), lead=56d  (44–88d),  peaks: Oct/Nov/Dec, Wed
-- exhibition:             n=6,   spend=£22,582 (£11,184–£45,638), pph=£127, group=200 (162–200), lead=223d (144–243d), peaks: Oct/Jun/Nov, Thu
