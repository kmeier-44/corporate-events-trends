"""
Cross-tabulate median spend by industry group AND event type.
Produces data for the personalised "How [industry] compares" cards,
so we can show e.g. "Financial Services spends £X on meetings" vs "£Y overall for meetings".

Uses the same BL-based methodology as run_bookinglines.py.
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

# Segment -> industry group mapping (same as data.js industryProfiles)
SEGMENT_TO_INDUSTRY = {}
_seg_map = {
    'Financial Services': ['profServices-financial', 'profServices-insurance', 'profServices-accountancy'],
    'Professional Services': ['profServices-law', 'profServices-consultants', 'profServices-other', 'profServices-property'],
    'Technology': ['tech-medium', 'tech-startup', 'tech-giant'],
    'Education & Training': ['association-education', 'association-charity', 'association-government',
                             'association-arts', 'association-health', 'association-other'],
    'Retail & Consumer': ['b2c-media', 'b2c-fashion', 'b2c-hospitality', 'b2c-food', 'b2c-retail',
                          'b2c-automotive', 'b2c-other'],
    'Property & Construction': ['profServices-property', 'b2b-constructionEngineeringManufacturing'],
    'Media & Marketing': ['agency-advertisingMarketingCreative', 'agency-events', 'agency-pr',
                          'agency-other', 'agency-supplier'],
    'Healthcare & Pharma': ['b2b-pharma'],
}
for industry, segs in _seg_map.items():
    for seg in segs:
        SEGMENT_TO_INDUSTRY[seg] = industry

# Also map B2B segments
for seg in ['b2b-transport', 'b2b-other']:
    SEGMENT_TO_INDUSTRY[seg] = 'B2B Other'

FX_TO_GBP = {
    'GBP': 1.0, 'EUR': 0.84, 'USD': 0.79, 'CHF': 0.88, 'SEK': 0.074,
    'DKK': 0.113, 'CAD': 0.57, 'AED': 0.215, 'NOK': 0.074, 'SGD': 0.59,
    'PLN': 0.198, 'INR': 0.0093, 'HUF': 0.0022, 'JPY': 0.0053, 'CZK': 0.034,
    'RON': 0.17, 'SAR': 0.21, 'KRW': 0.00055, 'KZT': 0.0016, 'HKD': 0.10,
    'GEL': 0.29, 'ARS': 0.00074, 'TRY': 0.022, 'BRL': 0.14, 'UZS': 0.000062,
    'BGN': 0.43, 'MXN': 0.039, 'ZAR': 0.044,
}


def get_bl_value_gbp(bl_doc):
    price = bl_doc.get("price")
    if price and price > 0:
        return price
    local_price = bl_doc.get("localPrice")
    local_currency = bl_doc.get("localCurrency")
    if local_price and local_price > 0 and local_currency:
        rate = FX_TO_GBP.get(local_currency)
        if rate:
            return local_price * rate
    return None


def main():
    print("=== INDUSTRY x EVENT TYPE CROSS-TAB ===\n")

    # Step 1: Get won bookings 2022-2025
    won_bookings = {}
    for doc in bk.find(
        {
            "status": "won",
            "eventdate": {"$gt": 0},
            "category": {"$nin": EXCLUDE_CATS + [None]},
        },
        {"_id": 1, "eventdate": 1, "category": 1, "people": 1, "companyData._id": 1}
    ):
        ed = doc["eventdate"]
        year = datetime.utcfromtimestamp(ed / 1000).year
        if 2022 <= year <= 2025:
            cid = doc.get("companyData", {}).get("_id")
            won_bookings[doc["_id"]] = {
                "year": year,
                "category": doc.get("category"),
                "people": doc.get("people", 0),
                "company_id": cid,
                "total_value": 0,
                "bl_count": 0,
            }

    print(f"Won bookings 2022-2025: {len(won_bookings)}")

    # Step 2: Get won BL values
    booking_ids = list(won_bookings.keys())
    chunk_size = 5000
    for i in range(0, len(booking_ids), chunk_size):
        chunk = booking_ids[i:i+chunk_size]
        for bl_doc in bl.find(
            {"bookingId": {"$in": chunk}, "status": "won",
             "$or": [{"price": {"$gt": 0}}, {"localPrice": {"$gt": 0}}]},
            {"bookingId": 1, "price": 1, "localPrice": 1, "localCurrency": 1}
        ):
            bid = bl_doc.get("bookingId")
            if bid in won_bookings:
                val = get_bl_value_gbp(bl_doc)
                if val:
                    won_bookings[bid]["total_value"] += val
                    won_bookings[bid]["bl_count"] += 1

    priced = {k: v for k, v in won_bookings.items() if v["bl_count"] > 0}
    print(f"With priced BLs: {len(priced)}")

    # Step 3: Look up company segments
    company_ids = list(set(v["company_id"] for v in priced.values() if v["company_id"]))
    print(f"Unique companies: {len(company_ids)}")

    company_segment = {}
    for i in range(0, len(company_ids), 5000):
        chunk = company_ids[i:i+5000]
        for doc in db["companies"].find({"_id": {"$in": chunk}}, {"_id": 1, "segment": 1}):
            seg = doc.get("segment")
            if seg:
                company_segment[doc["_id"]] = seg

    print(f"Companies with segment: {len(company_segment)}")

    # Step 4: Cross-tabulate by industry x event type
    # Also collect overall event type medians and industry overall medians for comparison
    industry_cat = defaultdict(lambda: defaultdict(list))  # industry -> category -> [values]
    cat_overall = defaultdict(list)  # category -> [values]
    industry_overall = defaultdict(list)  # industry -> [values]

    for bid, b in priced.items():
        cat = b["category"]
        cat_name = CAT_MAP.get(cat, cat.replace("category-", "") if cat else "Unknown")

        # Overall event type
        cat_overall[cat_name].append(b["total_value"])

        # Industry-specific
        cid = b.get("company_id")
        if cid:
            seg = company_segment.get(cid)
            if seg:
                industry = SEGMENT_TO_INDUSTRY.get(seg)
                if industry:
                    industry_cat[industry][cat_name].append(b["total_value"])
                    industry_overall[industry].append(b["total_value"])

    # Print results
    print("\n\n=== EVENT TYPE MEDIANS (overall) ===")
    for cat in sorted(cat_overall.keys(), key=lambda x: -statistics.median(cat_overall[x]) if len(cat_overall[x]) >= 3 else 0):
        vals = cat_overall[cat]
        if len(vals) >= 3:
            med = statistics.median(vals)
            pph_vals = []
            for bid, b in priced.items():
                cat_name = CAT_MAP.get(b["category"], "")
                if cat_name == cat and b["people"] and b["people"] > 0:
                    pph_vals.append(b["total_value"] / b["people"])
            pph = statistics.median(pph_vals) if len(pph_vals) >= 3 else None
            pph_str = f", PPH=£{pph:,.0f}" if pph else ""
            print(f"  {cat}: n={len(vals)}, median=£{med:,.0f}{pph_str}")

    print("\n\n=== INDUSTRY x EVENT TYPE CROSS-TAB ===")
    industries = ['Financial Services', 'Professional Services', 'Technology',
                  'Education & Training', 'Retail & Consumer', 'Property & Construction',
                  'Media & Marketing', 'Healthcare & Pharma']

    # Top event types to show
    top_cats = ['Conference', 'Meeting', 'Christmas Party', 'Corporate Party',
                'Summer Party', 'Award Ceremony', 'Networking', 'Private Dining',
                'Gala Dinner', 'Screening']

    for industry in industries:
        ind_med = statistics.median(industry_overall[industry]) if len(industry_overall[industry]) >= 3 else None
        ind_str = f"£{ind_med:,.0f}" if ind_med else "n/a"
        print(f"\n--- {industry} (overall median: {ind_str}, n={len(industry_overall[industry])}) ---")

        for cat in top_cats:
            vals = industry_cat[industry].get(cat, [])
            overall_vals = cat_overall.get(cat, [])
            if len(vals) >= 3:
                med = statistics.median(vals)
                overall_med = statistics.median(overall_vals) if len(overall_vals) >= 3 else None
                pct = ""
                if overall_med:
                    diff = round((med - overall_med) / overall_med * 100)
                    pct = f" ({'+' if diff >= 0 else ''}{diff}% vs overall)"
                print(f"  {cat}: n={len(vals)}, median=£{med:,.0f}{pct}")
            elif len(vals) > 0:
                print(f"  {cat}: n={len(vals)} (too few for median)")
            # else: skip entirely

    # Also output PPH cross-tab
    print("\n\n=== INDUSTRY x EVENT TYPE PPH ===")
    for industry in industries:
        print(f"\n--- {industry} ---")
        for cat in top_cats:
            vals = []
            for bid, b in priced.items():
                cat_name = CAT_MAP.get(b["category"], "")
                if cat_name != cat:
                    continue
                cid = b.get("company_id")
                if not cid:
                    continue
                seg = company_segment.get(cid)
                if not seg:
                    continue
                ind = SEGMENT_TO_INDUSTRY.get(seg)
                if ind != industry:
                    continue
                if b["people"] and b["people"] > 0:
                    vals.append(b["total_value"] / b["people"])

            if len(vals) >= 3:
                med = statistics.median(vals)
                print(f"  {cat}: n={len(vals)}, PPH=£{med:,.0f}")
            elif len(vals) > 0:
                print(f"  {cat}: n={len(vals)} (too few)")

    # Output group sizes cross-tab
    print("\n\n=== INDUSTRY x EVENT TYPE GROUP SIZE ===")
    for industry in industries:
        print(f"\n--- {industry} ---")
        for cat in top_cats:
            vals = []
            for bid, b in priced.items():
                cat_name = CAT_MAP.get(b["category"], "")
                if cat_name != cat:
                    continue
                cid = b.get("company_id")
                if not cid:
                    continue
                seg = company_segment.get(cid)
                if not seg:
                    continue
                ind = SEGMENT_TO_INDUSTRY.get(seg)
                if ind != industry:
                    continue
                if b["people"] and b["people"] > 0:
                    vals.append(b["people"])

            if len(vals) >= 3:
                med = statistics.median(vals)
                print(f"  {cat}: n={len(vals)}, median group={med:.0f}")
            elif len(vals) > 0:
                print(f"  {cat}: n={len(vals)} (too few)")

    client.close()
    print("\n=== DONE ===")


if __name__ == "__main__":
    main()
