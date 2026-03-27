-- ⚠️  DEPRECATED — 27 March 2026
-- Industry profiles now come from run_bookinglines.py using MongoDB booking lines
-- + companies.segment mapping. Kept for reference only.
--
-- ============================================================
-- Industry Profiles — Spend, PPH, group size, lead time by HubSpot industry
-- ============================================================
-- SOURCE: Snowflake — CONTRACT + BOOKINGS + CORE_DATA.COMPANIES + HUBSPOT.COMPANIES
-- PERIOD: 2023-2025 (fully signed contracts only)

-- The SEGMENT_EVENTS.HUBSPOT.COMPANIES table contains HubSpot's standard
-- INDUSTRY field (e.g. COMPUTER_SOFTWARE, FINANCIAL_SERVICES, etc.).
-- Join coverage: 58,492 companies matched.

-- ── RAW INDUSTRY SPEND (ungrouped) ──

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
           b."COMPANYDATA___ID" as company_id,
           DATEDIFF(day, b.META__CREATEDAT, b.EVENTDATE) as lead_days
    FROM latest_contract lc
    JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
    WHERE lc.rn = 1
      AND b.STATUS = 'won'
      AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2023 AND 2025
)
SELECT h.INDUSTRY,
       COUNT(*) as n,
       MEDIAN(bd.TOTALCOSTEXCTAX) as median_spend,
       PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY bd.TOTALCOSTEXCTAX) as p25,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY bd.TOTALCOSTEXCTAX) as p75,
       MEDIAN(bd.TOTALCOSTEXCTAX / NULLIF(bd.PEOPLE, 0)) as median_pph,
       MEDIAN(bd.PEOPLE) as median_group_size,
       MEDIAN(bd.lead_days) as median_lead_days
FROM booking_details bd
JOIN HIRE_SPACE.CORE_DATA.COMPANIES c ON bd.company_id = c."_ID"
JOIN SEGMENT_EVENTS.HUBSPOT.COMPANIES h ON c.HUBSPOTID = h.HS_OBJECT_ID
WHERE h.INDUSTRY IS NOT NULL
GROUP BY h.INDUSTRY
HAVING COUNT(*) >= 5
ORDER BY n DESC;

-- ── GROUPED INDUSTRY PROFILES (as used in data.js) ──
-- Same CTE, but with CASE grouping:
--
-- Financial Services:      CAPITAL_MARKETS, INVESTMENT_MANAGEMENT, FINANCIAL_SERVICES, BANKING, INSURANCE, ACCOUNTING
-- Professional Services:   MANAGEMENT_CONSULTING, LAW_PRACTICE, LEGAL_SERVICES, HUMAN_RESOURCES, STAFFING_AND_RECRUITING, MARKET_RESEARCH
-- Technology:              COMPUTER_SOFTWARE, INFORMATION_TECHNOLOGY_AND_SERVICES, TELECOMMUNICATIONS
-- Education & Training:    PROFESSIONAL_TRAINING_COACHING, HIGHER_EDUCATION, EDUCATION_MANAGEMENT
-- Retail & Consumer:       RETAIL, CONSUMER_SERVICES, CONSUMER_GOODS, APPAREL_FASHION, LUXURY_GOODS_JEWELRY
-- Property & Construction: REAL_ESTATE, CONSTRUCTION, CIVIL_ENGINEERING, ARCHITECTURE_PLANNING
-- Media & Marketing:       MARKETING_AND_ADVERTISING, PUBLIC_RELATIONS_AND_COMMUNICATIONS, PUBLISHING, ENTERTAINMENT
-- Travel & Leisure:        LEISURE_TRAVEL_TOURISM, TRANSPORTATION_TRUCKING_RAILROAD, GAMBLING_CASINOS, HOSPITALITY
-- Healthcare & Pharma:     HOSPITAL_HEALTH_CARE, PHARMACEUTICALS, COSMETICS

-- Results (25 March 2026 — TO BE RE-RUN):
-- Financial Services:      n=214, median=£7,510  (p25=£3,208, p75=£16,333), pph=£114, group=70,  lead=97d
-- Professional Services:   n=133, median=£6,395  (p25=£2,516, p75=£11,500), pph=£103, group=70,  lead=96d
-- Technology:              n=93,  median=£10,706 (p25=£4,375, p75=£19,667), pph=£123, group=100, lead=100d
-- Education & Training:    n=79,  median=£11,912 (p25=£3,825, p75=£19,313), pph=£104, group=120, lead=119d
-- Retail & Consumer:       n=57,  median=£5,270  (p25=£3,275, p75=£18,975), pph=£83,  group=125, lead=119d
-- Property & Construction: n=42,  median=£13,386 (p25=£8,912, p75=£22,381), pph=£90,  group=150, lead=142d
-- Media & Marketing:       n=40,  median=£14,265 (p25=£10,000, p75=£22,060), pph=£110, group=150, lead=130d
-- Travel & Leisure:        n=28,  median=£14,680 (p25=£7,482, p75=£27,863), pph=£137, group=120, lead=110d
-- Healthcare & Pharma:     n=24,  median=£11,475 (p25=£9,500, p75=£17,918), pph=£99,  group=145, lead=150d
