// ============================================================
// Group Sizes — Median by year and category
// ============================================================
// SOURCE: MongoDB — bookings collection
// METHOD: Won bookings (enquiry-level), direct field access
// FIELD: people (integer, group size stated on enquiry)
// UPDATED: 27 March 2026 — switched from bookinglines to bookings

// ── QUERY: Group sizes by year ─────────────────────────────
// Change the eventdate range for each year.

db.bookings.aggregate([
  { $match: {
    status: "won",
    eventdate: { $gte: 1704067200000, $lt: 1735689600000 }, // 2024
    people: { $exists: true, $gt: 0 }
  }},
  { $sort: { people: 1 }},
  { $group: {
    _id: null,
    sizes: { $push: "$people" },
    count: { $sum: 1 }
  }}
])

// Results (25 March 2026 — from bookinglines, TO BE RE-RUN):
// 2022: n=1066, median=200, p25=100, p75=300
// 2023: n=1246, median=170, p25=100, p75=300
// 2024: n=1521, median=150, p25=100, p75=300
// 2025: n=1362, median=150, p25=80,  p75=250
//
// data.js groupSizes:
//   median: [200, 170, 150, 150]
//   p25: [100, 100, 100, 80]
//   p75: [300, 300, 300, 250]


// ── QUERY: Group sizes by category (all years) ─────────────

db.bookings.aggregate([
  { $match: {
    status: "won",
    people: { $gt: 0 }
  }},
  { $group: {
    _id: "$category",
    sizes: { $push: "$people" },
    count: { $sum: 1 }
  }},
  { $sort: { count: -1 }}
])

// Results (from bookinglines, TO BE RE-RUN):
// Gala Dinner:     n=346,  median=210
// Award Ceremony:  n=736,  median=200
// Conference:      n=4719, median=150
// Summer Party:    n=780,  median=150
// Networking:      n=821,  median=150
// Corporate Party: n=2318, median=150
// Pop-Up:          n=424,  median=150
// Christmas Party: n=2293, median=120
// Meeting:         n=880,  median=80
// Private Dining:  n=1439, median=75
