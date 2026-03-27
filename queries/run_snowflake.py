# ⚠️  DEPRECATED — 27 March 2026
# Financial data (booking values, PPH, category/industry spend) now comes from
# run_bookinglines.py using MongoDB booking lines (99.5% coverage).
# This script is kept for reference and for queries that still need Snowflake
# (e.g. conversion by lead time, venue type trends).

import snowflake.connector, os, statistics

pw = os.environ.get("SNOWFLAKE_PASSWORD", "")
conn = snowflake.connector.connect(
    user="claude_readonly",
    password=pw,
    account="MIMEYBX-MG03654",
    warehouse="COMPUTE_WH",
    database="HIRE_SPACE",
    schema="CORE_DATA"
)
cur = conn.cursor()

# ── 1. BOOKING VALUES (CONTRACT → BOOKINGS, won, 2023-2025) ──
print("=== 1. BOOKING VALUES ===")
cur.execute("""
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
           b.CATEGORY as category
    FROM latest_contract lc
    JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
    WHERE lc.rn = 1
      AND b.STATUS = 'won'
      AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2023 AND 2025
      AND b.CATEGORY NOT IN ('category-birthdayParty', 'category-wedding', 'category-other')
)
SELECT EXTRACT(YEAR FROM event_date) as yr,
       COUNT(*) as n,
       MEDIAN(TOTALCOSTEXCTAX) as med,
       PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY TOTALCOSTEXCTAX) as p25,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY TOTALCOSTEXCTAX) as p75
FROM booking_details
GROUP BY yr ORDER BY yr
""")
for row in cur.fetchall():
    print(f"  {int(row[0])}: n={row[1]}, median={row[2]:.0f}, p25={row[3]:.0f}, p75={row[4]:.0f}")

# ── 2. VALUES BY CATEGORY ──
print("\n=== 2. VALUES BY CATEGORY ===")
cur.execute("""
WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX,
           ROW_NUMBER() OVER (PARTITION BY BOOKINGID
               ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC) as rn
    FROM HIRE_SPACE.CORE_DATA.CONTRACT
    WHERE STATUS = 'fully signed' AND TOTALCOSTEXCTAX > 0
),
booking_details AS (
    SELECT lc.BOOKINGID, lc.TOTALCOSTEXCTAX,
           b.CATEGORY as category, b.PEOPLE as people
    FROM latest_contract lc
    JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
    WHERE lc.rn = 1
      AND b.STATUS = 'won'
      AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2023 AND 2025
      AND b.CATEGORY IS NOT NULL
      AND b.CATEGORY NOT IN ('category-birthdayParty', 'category-wedding', 'category-other')
)
SELECT category,
       COUNT(*) as n,
       MEDIAN(TOTALCOSTEXCTAX) as median_spend,
       MEDIAN(TOTALCOSTEXCTAX / NULLIF(people, 0)) as median_pph
FROM booking_details
GROUP BY category
HAVING COUNT(*) >= 5
ORDER BY median_spend DESC
""")
for row in cur.fetchall():
    cat = row[0].replace("category-", "") if row[0] else "?"
    pph = f"{row[3]:.0f}" if row[3] else "N/A"
    print(f"  {cat}: n={row[1]}, median={row[2]:.0f}, pph={pph}")

# ── 3. PRICE PER HEAD BY YEAR ──
print("\n=== 3. PRICE PER HEAD BY YEAR ===")
cur.execute("""
WITH latest_contract AS (
    SELECT BOOKINGID, TOTALCOSTEXCTAX,
           ROW_NUMBER() OVER (PARTITION BY BOOKINGID
               ORDER BY FULLYSIGNEDTIMESTAMP DESC NULLS LAST, META__CREATEDAT DESC) as rn
    FROM HIRE_SPACE.CORE_DATA.CONTRACT
    WHERE STATUS = 'fully signed' AND TOTALCOSTEXCTAX > 0
),
booking_details AS (
    SELECT lc.TOTALCOSTEXCTAX, b.PEOPLE, b.EVENTDATE
    FROM latest_contract lc
    JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
    WHERE lc.rn = 1
      AND b.STATUS = 'won'
      AND b.PEOPLE > 0
      AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2023 AND 2025
      AND b.CATEGORY NOT IN ('category-birthdayParty', 'category-wedding', 'category-other')
)
SELECT EXTRACT(YEAR FROM EVENTDATE) as yr,
       MEDIAN(TOTALCOSTEXCTAX / PEOPLE) as med_pph
FROM booking_details
GROUP BY yr ORDER BY yr
""")
for row in cur.fetchall():
    print(f"  {int(row[0])}: median PPH = {row[1]:.0f}")

# ── 4. EVENT TYPE PROFILES (spend, pph, group, lead time per category) ──
print("\n=== 4. EVENT TYPE PROFILES ===")
cur.execute("""
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
           DATEDIFF(day, b."META__CREATEDAT", b.EVENTDATE) as lead_days
    FROM latest_contract lc
    JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
    WHERE lc.rn = 1
      AND b.STATUS = 'won'
      AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2023 AND 2025
      AND b.CATEGORY IS NOT NULL
      AND b.CATEGORY NOT IN ('category-birthdayParty', 'category-wedding', 'category-other')
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
ORDER BY n DESC
""")
for row in cur.fetchall():
    cat = row[0].replace("category-", "") if row[0] else "?"
    print(f"  {cat}: n={row[1]}, spend={row[2]:.0f} ({row[3]:.0f}-{row[4]:.0f}), pph={row[5]:.0f}, group={row[6]:.0f} ({row[7]:.0f}-{row[8]:.0f}), lead={row[9]:.0f}d ({row[10]:.0f}-{row[11]:.0f}d)")

# ── 5. INDUSTRY PROFILES ──
print("\n=== 5. INDUSTRY PROFILES ===")
cur.execute("""
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
           b."COMPANYDATA___ID" as company_id,
           DATEDIFF(day, b."META__CREATEDAT", b.EVENTDATE) as lead_days
    FROM latest_contract lc
    JOIN HIRE_SPACE.CORE_DATA.BOOKINGS b ON lc.BOOKINGID = b."_ID"
    WHERE lc.rn = 1
      AND b.STATUS = 'won'
      AND EXTRACT(YEAR FROM b.EVENTDATE) BETWEEN 2023 AND 2025
      AND b.CATEGORY NOT IN ('category-birthdayParty', 'category-wedding', 'category-other')
)
SELECT
    CASE
        WHEN hc.INDUSTRY IN ('ACCOUNTING','BANKING___MORTGAGE','CAPITAL_MARKETS','FINANCIAL_SERVICES','INSURANCE','VENTURE_CAPITAL___PRIVATE_EQUITY') THEN 'Financial Services'
        WHEN hc.INDUSTRY IN ('INFORMATION_TECHNOLOGY___SERVICES','COMPUTER_SOFTWARE','INTERNET','COMPUTER_HARDWARE','COMPUTER___NETWORK_SECURITY','COMPUTER_GAMES','SEMICONDUCTORS','TELECOMMUNICATIONS','WIRELESS') THEN 'Technology'
        WHEN hc.INDUSTRY IN ('MARKETING___ADVERTISING','MEDIA_PRODUCTION','ENTERTAINMENT','BROADCAST_MEDIA','MUSIC','MOTION_PICTURES___FILM','PUBLISHING','NEWSPAPERS','ONLINE_MEDIA','PRINTING') THEN 'Media & Marketing'
        WHEN hc.INDUSTRY IN ('LAW_PRACTICE','MANAGEMENT_CONSULTING','HUMAN_RESOURCES','STAFFING___RECRUITING','PROFESSIONAL_TRAINING___COACHING','BUSINESS_SUPPLIES___EQUIPMENT','OUTSOURCING_OFFSHORING','EXECUTIVE_OFFICE','PROGRAM_DEVELOPMENT','THINK_TANKS','TRANSLATION___LOCALIZATION') THEN 'Professional Services'
        WHEN hc.INDUSTRY IN ('HOSPITAL___HEALTH_CARE','MEDICAL_DEVICES','PHARMACEUTICALS','HEALTH__WELLNESS___FITNESS','MENTAL_HEALTH_CARE','VETERINARY','BIOTECHNOLOGY','ALTERNATIVE_MEDICINE','MEDICAL_PRACTICE') THEN 'Healthcare & Pharma'
        WHEN hc.INDUSTRY IN ('RETAIL','CONSUMER_GOODS','CONSUMER_ELECTRONICS','CONSUMER_SERVICES','LUXURY_GOODS___JEWELRY','FOOD___BEVERAGES','WINE___SPIRITS','COSMETICS','APPAREL___FASHION','FURNITURE','SPORTING_GOODS','SUPERMARKETS','WHOLESALE','PACKAGE_FREIGHT_DELIVERY') THEN 'Retail & Consumer'
        WHEN hc.INDUSTRY IN ('CONSTRUCTION','REAL_ESTATE','ARCHITECTURE___PLANNING','BUILDING_MATERIALS','CIVIL_ENGINEERING') THEN 'Property & Construction'
        WHEN hc.INDUSTRY IN ('LEISURE__TRAVEL___TOURISM','HOSPITALITY','AIRLINES_AVIATION','RESTAURANTS','FOOD_PRODUCTION','RECREATIONAL_FACILITIES___SERVICES','GAMBLING___CASINOS','SPORTS') THEN 'Travel & Leisure'
        WHEN hc.INDUSTRY IN ('EDUCATION_MANAGEMENT','E_LEARNING','HIGHER_EDUCATION','PRIMARY_SECONDARY_EDUCATION','RESEARCH','LIBRARIES') THEN 'Education & Training'
        ELSE NULL
    END AS industry_group,
    COUNT(*) as n,
    MEDIAN(bd.TOTALCOSTEXCTAX) as median_spend,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY bd.TOTALCOSTEXCTAX) as p25,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY bd.TOTALCOSTEXCTAX) as p75,
    MEDIAN(bd.TOTALCOSTEXCTAX / NULLIF(bd.PEOPLE, 0)) as median_pph,
    MEDIAN(bd.PEOPLE) as median_group,
    MEDIAN(bd.lead_days) as median_lead
FROM booking_details bd
JOIN HIRE_SPACE.CORE_DATA.COMPANIES c ON bd.company_id = c."_ID"
JOIN SEGMENT_EVENTS.HUBSPOT.COMPANIES hc ON c.HUBSPOTID = hc.HS_OBJECT_ID
WHERE hc.INDUSTRY IS NOT NULL
GROUP BY 1
HAVING industry_group IS NOT NULL AND COUNT(*) >= 5
ORDER BY n DESC
""")
for row in cur.fetchall():
    print(f"  {row[0]}: n={row[1]}, spend={row[2]:.0f} ({row[3]:.0f}-{row[4]:.0f}), pph={row[5]:.0f}, group={row[6]:.0f}, lead={row[7]:.0f}d")

# ── 6. PEAK MONTHS BY EVENT TYPE (all won bookings, not just contracts) ──
print("\n=== 6. PEAK MONTHS/DAYS BY EVENT TYPE ===")
cur.execute("""
SELECT CATEGORY,
       EXTRACT(MONTH FROM EVENTDATE) as m,
       COUNT(*) as n
FROM HIRE_SPACE.CORE_DATA.BOOKINGS
WHERE STATUS = 'won'
  AND EVENTDATE IS NOT NULL
  AND EXTRACT(YEAR FROM EVENTDATE) BETWEEN 2022 AND 2025
  AND CATEGORY IS NOT NULL
  AND CATEGORY NOT IN ('category-birthdayParty', 'category-wedding', 'category-other')
GROUP BY CATEGORY, m
ORDER BY CATEGORY, n DESC
""")
from collections import defaultdict
cat_months = defaultdict(list)
for row in cur.fetchall():
    cat_months[row[0]].append((int(row[1]), row[2]))
month_names = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'}
for cat, months in sorted(cat_months.items()):
    top3 = [month_names[m] for m, _ in months[:3]]
    print(f"  {cat.replace('category-','')}: {'/'.join(top3)}")

# Peak day
cur.execute("""
SELECT CATEGORY,
       DAYNAME(EVENTDATE) as d,
       COUNT(*) as n
FROM HIRE_SPACE.CORE_DATA.BOOKINGS
WHERE STATUS = 'won'
  AND EVENTDATE IS NOT NULL
  AND EXTRACT(YEAR FROM EVENTDATE) BETWEEN 2022 AND 2025
  AND CATEGORY IS NOT NULL
  AND CATEGORY NOT IN ('category-birthdayParty', 'category-wedding', 'category-other')
GROUP BY CATEGORY, d
ORDER BY CATEGORY, n DESC
""")
cat_days = defaultdict(list)
for row in cur.fetchall():
    cat_days[row[0]].append((row[1], row[2]))
for cat, days in sorted(cat_days.items()):
    print(f"  {cat.replace('category-','')}: peak day = {days[0][0]}")

# ── 7. SPEND BY INDUSTRY (same grouping as data.js spendByIndustry) ──
print("\n=== 7. SPEND BY INDUSTRY ===")
# Already covered in section 5 above

conn.close()
print("\n=== DONE ===")
