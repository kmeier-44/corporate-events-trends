import pymongo, statistics, sys
from datetime import datetime, timezone

sys.stdout.reconfigure(line_buffering=True)
import os
_mongo_pw = os.environ.get("MONGO_PASSWORD", "")
client = pymongo.MongoClient(f"mongodb+srv://GrowthRO:{_mongo_pw}@bookings-live.99kmc.mongodb.net/")
db = client["live"]
bk = db["bookings"]
bl = db["bookinglines"]

def yf(year):
    s = datetime(year, 1, 1, tzinfo=timezone.utc).timestamp() * 1000
    e = datetime(year + 1, 1, 1, tzinfo=timezone.utc).timestamp() * 1000
    return {"eventdate": {"$gte": s, "$lt": e}}

WON = {"status": "won"}
WON_BL = {"status": "won"}
HV = {"venueId": {"$type": "int"}}

# Exclude non-corporate categories from aggregate queries
EXCLUDE_CATS = {"category": {"$nin": [
    "category-birthdayParty", "category-wedding", "category-other", None
]}}
# Combined filter for won corporate bookings
WON_CORP = {**WON, **EXCLUDE_CATS}

# Category mapping: data.js name -> MongoDB slug
CAT_MAP = {
    "Conference": "category-conference",
    "Meeting": "category-meeting",
    "Corporate Party": "category-corporateParty",
    "Christmas Party": "category-christmasParty",
    "Screening": "category-screening",
    "Networking": "category-networkingEvent",
    "Private Dining": "category-corporatePrivateDining",
    "Summer Party": "category-summerParty",
    "Pop-Up": "category-popUp",
    "Ticketed Event": "category-ticketedEvent",
    "Award Ceremony": "category-awardCeremony",
    "Gala Dinner": "category-galaDinner",
    "Private Event": "category-privateEvent",
    "Presentation": "category-presentation",
    "Product Launch": "category-productLaunch",
}

# ── 1. BOOKING VALUES (from Snowflake CONTRACT — not runnable here) ──
print("=== 1. BOOKING VALUES ===")
print("  Source: Snowflake CONTRACT table — see 13-snowflake-booking-values.sql")
print("  data.js bookingValues: median [8562, 10922, 11500] for 2023-2025")

# ── 2. GROUP SIZES (from bookings collection) ──
print("\n=== 2. GROUP SIZES (booking level, corporate only) ===")
for year in [2022, 2023, 2024, 2025]:
    results = list(bk.aggregate([
        {"$match": {**WON_CORP, **yf(year), "people": {"$exists": True, "$gt": 0}}},
        {"$sort": {"people": 1}},
        {"$group": {"_id": None, "sizes": {"$push": "$people"}, "count": {"$sum": 1}}}
    ]))
    if results:
        sizes = results[0]["sizes"]
        print(f"  {year}: n={len(sizes)}, median={statistics.median(sizes):.0f}, p25={statistics.quantiles(sizes,n=4)[0]:.0f}, p75={statistics.quantiles(sizes,n=4)[2]:.0f}")

# ── 3. LEAD TIMES (from bookings collection) ──
print("\n=== 3. LEAD TIMES (booking level, corporate only) ===")
for year in [2022, 2023, 2024, 2025]:
    docs = bk.find({**WON_CORP, **yf(year), "timestamp": {"$exists": True, "$gt": 0}}, {"eventdate":1, "timestamp":1, "category":1})
    leads = []
    for d in docs:
        try:
            days = (d["eventdate"] - d["timestamp"]) / 86400000
            if 0 < days < 730:
                leads.append(days)
        except: pass
    if leads:
        leads.sort()
        print(f"  {year}: n={len(leads)}, median={statistics.median(leads):.0f}, p25={statistics.quantiles(leads,n=4)[0]:.0f}, p75={statistics.quantiles(leads,n=4)[2]:.0f}")

# ── 4. LEAD TIMES BY CATEGORY ──
print("\n=== 4. LEAD TIMES BY CATEGORY (all years) ===")
for name, slug in [("Award Ceremony","category-awardCeremony"), ("Gala Dinner","category-galaDinner"),
                    ("Conference","category-conference"), ("Summer Party","category-summerParty"),
                    ("Christmas Party","category-christmasParty"), ("Networking","category-networkingEvent"),
                    ("Private Dining","category-corporatePrivateDining"), ("Corporate Party","category-corporateParty"),
                    ("Pop-Up","category-popUp"), ("Meeting","category-meeting")]:
    docs = bk.find({**WON, "timestamp": {"$gt": 0}, "category": slug}, {"eventdate":1, "timestamp":1})
    leads = []
    for d in docs:
        try:
            days = (d["eventdate"] - d["timestamp"]) / 86400000
            if 0 < days < 730:
                leads.append(days)
        except: pass
    if leads:
        leads.sort()
        print(f"  {name}: n={len(leads)}, median={statistics.median(leads):.0f}, p25={statistics.quantiles(leads,n=4)[0]:.0f}, p75={statistics.quantiles(leads,n=4)[2]:.0f}")
    else:
        print(f"  {name}: n=0")

# ── 5. VENUE SHOPPING (uses bookinglines — needs BLs for venue counts) ──
print("\n=== 5. VENUE SHOPPING ===")
for year in [2022, 2023, 2024, 2025]:
    results = list(bl.aggregate([
        {"$match": {**HV, **yf(year)}},
        {"$group": {"_id": "$bookingId", "venues": {"$addToSet": "$venueId"}}},
        {"$addFields": {"vc": {"$size": "$venues"}}}
    ]))
    if results:
        counts = [r["vc"] for r in results]
        print(f"  {year}: n={len(results)}, avg={sum(counts)/len(counts):.2f}, multiVenue={sum(1 for c in counts if c>1)/len(counts)*100:.1f}%")

# ── 6. SEASONALITY (from bookings collection) ──
print("\n=== 6. SEASONALITY (event month %, corporate won bookings) ===")
results = list(bk.aggregate([
    {"$match": {**WON_CORP, "eventdate": {"$gt": 0}}},
    {"$addFields": {"em": {"$month": {"$toDate": {"$toLong": "$eventdate"}}}}},
    {"$group": {"_id": "$em", "c": {"$sum": 1}}},
    {"$sort": {"_id": 1}}
]))
total = sum(r["c"] for r in results)
pcts = {r["_id"]: round(r["c"]/total*100, 1) for r in results}
print(f"  MongoDB: {[pcts.get(m, 0) for m in range(1, 13)]}")

# ── 7. DAY OF WEEK (from bookings collection) ──
print("\n=== 7. DAY OF WEEK (corporate only) ===")
results = list(bk.aggregate([
    {"$match": {**WON_CORP, "eventdate": {"$gt": 0}}},
    {"$addFields": {"dow": {"$dayOfWeek": {"$toDate": {"$toLong": "$eventdate"}}}}},
    {"$group": {"_id": "$dow", "c": {"$sum": 1}}},
    {"$sort": {"_id": 1}}
]))
total = sum(r["c"] for r in results)
dow_map = {2:"Mon", 3:"Tue", 4:"Wed", 5:"Thu", 6:"Fri", 7:"Sat", 1:"Sun"}
dow_pcts = {}
for r in results:
    dow_pcts[dow_map.get(r["_id"], "?")] = round(r["c"]/total*100, 1)
print(f"  MongoDB: {[dow_pcts.get(d, 0) for d in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']]}")

# ── 8. CATEGORY MIX (from bookings collection) ──
print("\n=== 8. CATEGORY MIX (% won corporate bookings) ===")
for year in [2022, 2023, 2024, 2025]:
    results = list(bk.aggregate([
        {"$match": {**WON_CORP, **yf(year)}},
        {"$group": {"_id": "$category", "c": {"$sum": 1}}},
        {"$sort": {"c": -1}}
    ]))
    total = sum(r["c"] for r in results)
    print(f"\n  {year} (total={total}):")
    for r in results[:10]:
        print(f"    {r['_id']}: {r['c']/total*100:.1f}%")

# ── 9. GROUP SIZES BY CATEGORY (from bookings collection) ──
print("\n=== 9. GROUP SIZES BY CATEGORY (booking level) ===")
for name, slug in [("Award Ceremony","category-awardCeremony"), ("Gala Dinner","category-galaDinner"),
                    ("Summer Party","category-summerParty"), ("Christmas Party","category-christmasParty"),
                    ("Networking","category-networkingEvent"), ("Conference","category-conference"),
                    ("Corporate Party","category-corporateParty"), ("Pop-Up","category-popUp"),
                    ("Private Dining","category-corporatePrivateDining"), ("Meeting","category-meeting")]:
    results = list(bk.aggregate([
        {"$match": {**WON, "people": {"$gt": 0}, "category": slug}},
        {"$sort": {"people": 1}},
        {"$group": {"_id": None, "sizes": {"$push": "$people"}, "count": {"$sum": 1}}}
    ]))
    if results:
        sizes = results[0]["sizes"]
        print(f"  {name}: n={len(sizes)}, median={statistics.median(sizes):.0f}")

# ── 10. CHRISTMAS PARTY DATA (from bookings collection, all bookings not just won) ──
print("\n=== 10. CHRISTMAS PARTY — Enquiry Month ===")
results = list(bk.aggregate([
    {"$match": {"category": "category-christmasParty", "timestamp": {"$gt": 0}}},
    {"$addFields": {"cm": {"$month": {"$toDate": {"$toLong": "$timestamp"}}}}},
    {"$group": {"_id": "$cm", "c": {"$sum": 1}}},
    {"$sort": {"_id": 1}}
]))
total = sum(r["c"] for r in results)
pcts = {r["_id"]: round(r["c"]/total*100, 1) for r in results}
print(f"  MongoDB: {[pcts.get(m, 0) for m in range(1, 13)]}")

# Xmas party group size by enquiry month (median, excludes outliers >1000)
print("\n=== 11. XMAS — Median Group Size by Enquiry Month ===")
results = list(bk.aggregate([
    {"$match": {"category": "category-christmasParty", "timestamp": {"$gt": 0}, "people": {"$gt": 0, "$lte": 1000}}},
    {"$addFields": {"cm": {"$month": {"$toDate": {"$toLong": "$timestamp"}}}}},
    {"$group": {"_id": "$cm", "sizes": {"$push": "$people"}, "c": {"$sum": 1}}},
    {"$sort": {"_id": 1}}
]))
sizes = {}
for r in results:
    s = sorted(r["sizes"])
    sizes[r["_id"]] = round(statistics.median(s))
print(f"  MongoDB (median): {[sizes.get(m, 0) for m in range(1, 13)]}")
print(f"  Counts:           {[next((r['c'] for r in results if r['_id']==m), 0) for m in range(1, 13)]}")

# ── 12. ENQUIRY COUNTS AS PROPORTIONS (from bookings collection) ──
print("\n=== 12. ENQUIRY PROPORTIONS BY CATEGORY ===")
# First get year totals for the tracked categories
tracked = ['Conference', 'Corporate Party', 'Meeting', 'Christmas Party', 'Networking', 'Summer Party', 'Private Dining', 'Award Ceremony']
for name in tracked:
    slug = CAT_MAP[name]
    counts = []
    for year in [2022, 2023, 2024, 2025]:
        n = bk.count_documents({**yf(year), "category": slug})
        counts.append(n)
    print(f"  {name}: raw={counts}")

# Now compute proportions
print("\n  Proportions (% of year total across tracked categories):")
year_totals = []
raw_by_cat = {}
for name in tracked:
    slug = CAT_MAP[name]
    raw_by_cat[name] = []
    for year in [2022, 2023, 2024, 2025]:
        n = bk.count_documents({**yf(year), "category": slug})
        raw_by_cat[name].append(n)

for yi in range(4):
    year_totals.append(sum(raw_by_cat[name][yi] for name in tracked))

for name in tracked:
    props = [round(raw_by_cat[name][yi] / year_totals[yi] * 100, 1) if year_totals[yi] > 0 else 0 for yi in range(4)]
    print(f"  '{name}': {props}")

# ── 13a. SEASONALITY BY TYPE (event month %) ──
print("\n=== 13a. SEASONALITY BY TYPE (event month %, won bookings) ===")
for name, slug in [("Conference","category-conference"), ("Christmas Party","category-christmasParty"),
                    ("Summer Party","category-summerParty"), ("Corporate Party","category-corporateParty")]:
    results = list(bk.aggregate([
        {"$match": {**WON, "category": slug, "eventdate": {"$gt": 0}}},
        {"$addFields": {"em": {"$month": {"$toDate": {"$toLong": "$eventdate"}}}}},
        {"$group": {"_id": "$em", "c": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]))
    total = sum(r["c"] for r in results)
    pcts = [round(next((r["c"] for r in results if r["_id"]==m), 0)/total*100, 0) if total else 0 for m in range(1, 13)]
    print(f"  {name}: {pcts}")

# ── 13b. CLOSE MONTH BY TYPE (timestamp month %) ──
print("\n=== 13b. CLOSE MONTH BY TYPE (timestamp/creation month %, won bookings) ===")
for name, slug in [("Conference","category-conference"), ("Christmas Party","category-christmasParty"),
                    ("Summer Party","category-summerParty"), ("Corporate Party","category-corporateParty")]:
    results = list(bk.aggregate([
        {"$match": {**WON, "category": slug, "timestamp": {"$gt": 0}}},
        {"$addFields": {"cm": {"$month": {"$toDate": {"$toLong": "$timestamp"}}}}},
        {"$group": {"_id": "$cm", "c": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]))
    total = sum(r["c"] for r in results)
    pcts = [round(next((r["c"] for r in results if r["_id"]==m), 0)/total*100, 1) if total else 0 for m in range(1, 13)]
    print(f"  {name}: {pcts}")

# ── 13c. XMAS GROUP SIZE BY YEAR ──
print("\n=== 13c. XMAS GROUP SIZE BY YEAR ===")
for year in [2022, 2023, 2024, 2025]:
    results = list(bk.aggregate([
        {"$match": {"category": "category-christmasParty", **yf(year), "people": {"$gt": 0, "$lte": 1000}}},
        {"$sort": {"people": 1}},
        {"$group": {"_id": None, "sizes": {"$push": "$people"}, "c": {"$sum": 1}}}
    ]))
    if results:
        s = results[0]["sizes"]
        print(f"  {year}: n={len(s)}, median={statistics.median(s):.0f}, p25={statistics.quantiles(s,n=4)[0]:.0f}, p75={statistics.quantiles(s,n=4)[2]:.0f}")

# ── 13d. XMAS GROUP SIZE DISTRIBUTION ──
print("\n=== 13d. XMAS GROUP SIZE DISTRIBUTION ===")
results = list(bk.aggregate([
    {"$match": {"category": "category-christmasParty", "people": {"$gt": 0, "$lte": 1000}}},
    {"$bucket": {"groupBy": "$people", "boundaries": [1, 51, 101, 201, 501, 1001], "default": "other",
                 "output": {"count": {"$sum": 1}}}}
]))
total = sum(r["count"] for r in results if r["_id"] != "other")
for r in results:
    if r["_id"] != "other":
        label = {1: "1-50", 51: "51-100", 101: "101-200", 201: "201-500", 501: "500+"}[r["_id"]]
        print(f"  {label}: {r['count']/total*100:.1f}%")

# ── 14. TOTAL COUNTS ──
print("\n=== 13. TOTAL COUNTS ===")
print(f"  All bookings: {bk.count_documents({})}")
print(f"  Won bookings: {bk.count_documents(WON)}")
print(f"  Corporate non-void: {bk.count_documents({'companyData._id': {'$exists': True}, 'status': {'$ne': 'void'}})}")
print(f"  All BLs: {bl.count_documents({})}")
print(f"  Won BLs with venueId(int): {bl.count_documents({**WON_BL, **HV})}")

# ── 14. CONVERSION BY LEAD TIME (uses bookinglines — BL-level conversion) ──
print("\n=== 14. CONVERSION BY LEAD TIME (from Snowflake — see 11-conversion-by-lead-time.js) ===")
print("  BL-level conversion — run in Snowflake for accurate results")
print("  data.js: <2wk: 9.6%, 2-4wk: 12.4%, 1-2m: 24.3%, 2-3m: 36.1%, 3-6m: 43.5%, 6+m: 44.0%")

client.close()
print("\n=== DONE ===")
