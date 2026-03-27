"""
Booking values from MongoDB BOOKING LINES (replaces Snowflake CONTRACT approach).

Approach:
- Join won bookings with their won booking lines
- Sum price per booking (use localPrice converted to GBP as fallback when price=0/null)
- 99.5% coverage vs ~20% from CONTRACT table

Currency conversion: approximate mid-market rates (March 2026)
"""
import pymongo, os, statistics, sys
from datetime import datetime, timezone
from collections import defaultdict

sys.stdout.reconfigure(line_buffering=True)

_mongo_pw = os.environ.get("MONGO_PASSWORD", "")
client = pymongo.MongoClient(f"mongodb+srv://GrowthRO:{_mongo_pw}@bookings-live.99kmc.mongodb.net/")
db = client["live"]
bk = db["bookings"]
bl = db["bookinglines"]

# Approximate exchange rates to GBP (as of March 2026)
FX_TO_GBP = {
    'GBP': 1.0,
    'EUR': 0.84,
    'USD': 0.79,
    'CHF': 0.88,
    'SEK': 0.074,
    'DKK': 0.113,
    'CAD': 0.57,
    'AED': 0.215,
    'NOK': 0.074,
    'SGD': 0.59,
    'PLN': 0.198,
    'INR': 0.0093,
    'HUF': 0.0022,
    'JPY': 0.0053,
    'CZK': 0.034,
    'RON': 0.17,
    'SAR': 0.21,
    'KRW': 0.00055,
    'KZT': 0.0016,
    'HKD': 0.10,
    'GEL': 0.29,
    'ARS': 0.00074,
    'TRY': 0.022,
    'BRL': 0.14,
    'UZS': 0.000062,
    'BGN': 0.43,
    'PKR': 0.0028,
    'ZAR': 0.043,
}

EXCLUDE_CATS = ["category-birthdayParty", "category-wedding", "category-other"]

CAT_MAP = {
    "category-conference": "Conference",
    "category-meeting": "Meeting",
    "category-corporateParty": "Corporate Party",
    "category-christmasParty": "Christmas Party",
    "category-screening": "Screening",
    "category-networkingEvent": "Networking",
    "category-corporatePrivateDining": "Private Dining",
    "category-summerParty": "Summer Party",
    "category-popUp": "Pop-Up",
    "category-ticketedEvent": "Ticketed Event",
    "category-awardCeremony": "Award Ceremony",
    "category-galaDinner": "Gala Dinner",
    "category-privateEvent": "Private Event",
    "category-presentation": "Presentation",
    "category-productLaunch": "Product Launch",
    "category-exhibition": "Exhibition",
}

def yf(year):
    s = datetime(year, 1, 1, tzinfo=timezone.utc).timestamp() * 1000
    e = datetime(year + 1, 1, 1, tzinfo=timezone.utc).timestamp() * 1000
    return {"eventdate": {"$gte": s, "$lt": e}}


def get_bl_value_gbp(bl_doc):
    """Get the GBP value of a booking line. Use price if > 0, else convert localPrice."""
    price = bl_doc.get("price")
    if price and price > 0:
        return price  # Already in GBP

    local_price = bl_doc.get("localPrice")
    local_currency = bl_doc.get("localCurrency")
    if local_price and local_price > 0 and local_currency:
        rate = FX_TO_GBP.get(local_currency)
        if rate:
            return local_price * rate
        else:
            print(f"  WARNING: Unknown currency {local_currency}, skipping")
            return None
    return None


def aggregate_booking_values():
    """Sum won booking line values per won booking, grouped by year."""
    print("=== BOOKING VALUES (from booking lines) ===\n")

    # Step 1: Get all won bookings with event dates 2022-2025, excluding non-corporate
    won_bookings = {}
    for doc in bk.find(
        {
            "status": "won",
            "eventdate": {"$gt": 0},
            "category": {"$nin": EXCLUDE_CATS + [None]},
        },
        {"_id": 1, "eventdate": 1, "category": 1, "people": 1}
    ):
        ed = doc["eventdate"]
        year = datetime.utcfromtimestamp(ed / 1000).year
        if 2022 <= year <= 2025:
            won_bookings[doc["_id"]] = {
                "year": year,
                "category": doc.get("category"),
                "people": doc.get("people", 0),
                "total_value": 0,
                "bl_count": 0,
            }

    print(f"Won corporate bookings 2022-2025: {len(won_bookings)}")

    # Step 2: Get all won booking lines for these bookings
    booking_ids = list(won_bookings.keys())

    # Process in chunks to avoid query size limits
    chunk_size = 5000
    for i in range(0, len(booking_ids), chunk_size):
        chunk = booking_ids[i:i+chunk_size]
        cursor = bl.find(
            {
                "bookingId": {"$in": chunk},
                "status": "won",
                "$or": [{"price": {"$gt": 0}}, {"localPrice": {"$gt": 0}}]
            },
            {"bookingId": 1, "price": 1, "localPrice": 1, "localCurrency": 1}
        )
        for bl_doc in cursor:
            bid = bl_doc.get("bookingId")
            if bid in won_bookings:
                val = get_bl_value_gbp(bl_doc)
                if val:
                    won_bookings[bid]["total_value"] += val
                    won_bookings[bid]["bl_count"] += 1

    # Step 3: Filter to bookings that have at least one priced booking line
    priced_bookings = {k: v for k, v in won_bookings.items() if v["bl_count"] > 0}
    print(f"Bookings with priced BLs: {len(priced_bookings)} ({len(priced_bookings)/len(won_bookings)*100:.1f}%)\n")

    # === BOOKING VALUES BY YEAR ===
    print("--- 1. BOOKING VALUES BY YEAR ---")
    by_year = defaultdict(list)
    for b in priced_bookings.values():
        by_year[b["year"]].append(b["total_value"])

    for year in sorted(by_year.keys()):
        vals = sorted(by_year[year])
        n = len(vals)
        med = statistics.median(vals)
        p25 = statistics.quantiles(vals, n=4)[0]
        p75 = statistics.quantiles(vals, n=4)[2]
        avg = statistics.mean(vals)
        print(f"  {year}: n={n}, median=£{med:,.0f}, p25=£{p25:,.0f}, p75=£{p75:,.0f}, avg=£{avg:,.0f}")

    # === VALUES BY CATEGORY ===
    print("\n--- 2. VALUES BY CATEGORY (all years) ---")
    by_cat = defaultdict(list)
    for b in priced_bookings.values():
        cat = b.get("category")
        if cat:
            by_cat[cat].append(b["total_value"])

    cat_results = []
    for cat, vals in by_cat.items():
        if len(vals) >= 5:
            name = CAT_MAP.get(cat, cat.replace("category-", ""))
            med = statistics.median(vals)
            cat_results.append((name, len(vals), med))

    for name, n, med in sorted(cat_results, key=lambda x: -x[2]):
        print(f"  {name}: n={n}, median=£{med:,.0f}")

    # === PRICE PER HEAD BY YEAR ===
    print("\n--- 3. PRICE PER HEAD BY YEAR ---")
    pph_by_year = defaultdict(list)
    for b in priced_bookings.values():
        people = b.get("people", 0)
        if people and people > 0:
            pph = b["total_value"] / people
            if 1 < pph < 5000:  # Filter outliers
                pph_by_year[b["year"]].append(pph)

    for year in sorted(pph_by_year.keys()):
        vals = sorted(pph_by_year[year])
        med = statistics.median(vals)
        p25 = statistics.quantiles(vals, n=4)[0]
        p75 = statistics.quantiles(vals, n=4)[2]
        print(f"  {year}: n={len(vals)}, median PPH=£{med:,.0f}, p25=£{p25:,.0f}, p75=£{p75:,.0f}")

    # === PPH BY CATEGORY ===
    print("\n--- 4. PPH BY CATEGORY ---")
    pph_by_cat = defaultdict(list)
    for b in priced_bookings.values():
        cat = b.get("category")
        people = b.get("people", 0)
        if cat and people and people > 0:
            pph = b["total_value"] / people
            if 1 < pph < 5000:
                pph_by_cat[cat].append(pph)

    pph_results = []
    for cat, vals in pph_by_cat.items():
        if len(vals) >= 5:
            name = CAT_MAP.get(cat, cat.replace("category-", ""))
            med = statistics.median(vals)
            pph_results.append((name, len(vals), med))

    for name, n, med in sorted(pph_results, key=lambda x: -x[2]):
        print(f"  {name}: n={n}, median PPH=£{med:,.0f}")

    # === EVENT TYPE PROFILES (spend, pph, group, lead time) ===
    print("\n--- 5. EVENT TYPE PROFILES ---")
    for cat, vals_list in sorted(by_cat.items(), key=lambda x: -len(x[1])):
        if len(vals_list) < 5:
            continue
        name = CAT_MAP.get(cat, cat.replace("category-", ""))
        med_spend = statistics.median(vals_list)
        p25_spend = statistics.quantiles(vals_list, n=4)[0]
        p75_spend = statistics.quantiles(vals_list, n=4)[2]

        # PPH for this category
        pph_vals = pph_by_cat.get(cat, [])
        med_pph = statistics.median(pph_vals) if len(pph_vals) >= 5 else None

        print(f"  {name}: n={len(vals_list)}, spend=£{med_spend:,.0f} (£{p25_spend:,.0f}-£{p75_spend:,.0f}), pph={'£'+str(int(med_pph)) if med_pph else 'N/A'}")

    # === COMPARISON WITH OLD CONTRACT VALUES ===
    print("\n--- 6. COMPARISON: BL-based vs CONTRACT-based ---")
    old_contract = {
        2023: {"median": 8625, "p25": 3371, "p75": 16376, "n": 252},
        2024: {"median": 10650, "p25": 3408, "p75": 20000, "n": 336},
        2025: {"median": 11000, "p25": 4201, "p75": 20603, "n": 310},
    }
    for year in [2023, 2024, 2025]:
        if year in by_year:
            new_vals = sorted(by_year[year])
            new_med = statistics.median(new_vals)
            old = old_contract.get(year, {})
            old_med = old.get("median", 0)
            diff_pct = ((new_med - old_med) / old_med * 100) if old_med else 0
            print(f"  {year}: CONTRACT median=£{old_med:,} (n={old.get('n',0)}) → BL median=£{new_med:,.0f} (n={len(new_vals)}) [{diff_pct:+.1f}%]")

    return priced_bookings


def spend_by_industry(priced_bookings):
    """Calculate spend by HubSpot industry group."""
    print("\n\n=== SPEND BY INDUSTRY ===")

    # Get company -> hubspotId mapping for bookings that have company data
    company_ids = set()
    booking_company = {}
    for bid, b in priced_bookings.items():
        pass  # We need to get company data from bookings

    # Re-fetch bookings with companyData
    booking_ids = list(priced_bookings.keys())
    company_bookings = defaultdict(list)

    chunk_size = 5000
    for i in range(0, len(booking_ids), chunk_size):
        chunk = booking_ids[i:i+chunk_size]
        for doc in bk.find(
            {"_id": {"$in": chunk}, "companyData._id": {"$exists": True}},
            {"_id": 1, "companyData._id": 1, "companyData.hubspotId": 1}
        ):
            cid = doc.get("companyData", {}).get("_id")
            hsid = doc.get("companyData", {}).get("hubspotId")
            if cid:
                company_bookings[doc["_id"]] = {"company_id": cid, "hubspot_id": hsid}

    print(f"  Bookings with company data: {len(company_bookings)}")

    # For industry grouping, we'd need HubSpot data which requires Snowflake or HubSpot API
    # For now, output by company segment if available from the companies collection
    companies = db["companies"]

    # Get unique company IDs
    unique_companies = set(v["company_id"] for v in company_bookings.values())
    print(f"  Unique companies: {len(unique_companies)}")

    # Look up segments
    company_segment = {}
    for i in range(0, len(list(unique_companies)), 5000):
        chunk = list(unique_companies)[i:i+5000]
        for doc in companies.find({"_id": {"$in": chunk}}, {"_id": 1, "segment": 1}):
            seg = doc.get("segment")
            if seg:
                company_segment[doc["_id"]] = seg

    print(f"  Companies with segment: {len(company_segment)}")

    # Group bookings by segment
    by_segment = defaultdict(list)
    for bid, cdata in company_bookings.items():
        seg = company_segment.get(cdata["company_id"])
        if seg and bid in priced_bookings:
            by_segment[seg].append(priced_bookings[bid]["total_value"])

    for seg, vals in sorted(by_segment.items(), key=lambda x: -statistics.median(x[1]) if len(x[1]) >= 5 else 0):
        if len(vals) >= 5:
            med = statistics.median(vals)
            print(f"  {seg}: n={len(vals)}, median=£{med:,.0f}")


if __name__ == "__main__":
    priced_bookings = aggregate_booking_values()
    spend_by_industry(priced_bookings)
    client.close()
    print("\n=== DONE ===")
