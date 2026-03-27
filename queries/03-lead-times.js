// ============================================================
// Lead Times — Days between enquiry creation and event date
// ============================================================
// SOURCE: MongoDB — bookings collection
// METHOD: Won bookings, lead time = (eventdate - timestamp) / 86400000
//         Filtered to 0-730 days (exclude negatives and >2yr outliers)
// UPDATED: 27 March 2026 — switched from bookinglines to bookings

// ── QUERY: Lead times by year ──────────────────────────────
// Change the eventdate range for each year.

db.bookings.aggregate([
  { $match: {
    status: "won",
    eventdate: { $gte: 1704067200000, $lt: 1735689600000 }, // 2024
    timestamp: { $exists: true, $gt: 0 }
  }},
  { $addFields: {
    leadDays: { $divide: [{ $subtract: ["$eventdate", "$timestamp"] }, 86400000] }
  }},
  { $match: { leadDays: { $gt: 0, $lt: 730 } }},
  { $sort: { leadDays: 1 }},
  { $group: {
    _id: null,
    leads: { $push: "$leadDays" },
    count: { $sum: 1 }
  }}
])

// Results (25 March 2026 — from bookinglines, TO BE RE-RUN):
// 2022: n=1119, median=93,  p25=57,  p75=145
// 2023: n=1346, median=100, p25=63,  p75=173
// 2024: n=1518, median=123, p25=70,  p75=206
// 2025: n=1309, median=111, p25=64,  p75=203
//
// data.js leadTimes:
//   median: [93, 100, 123, 111]
//   p25: [57, 63, 70, 64]
//   p75: [145, 173, 206, 203]


// ── QUERY: Lead times by category (all years) ──────────────

db.bookings.aggregate([
  { $match: {
    status: "won",
    timestamp: { $exists: true, $gt: 0 },
    eventdate: { $gt: 0 }
  }},
  { $addFields: {
    leadDays: { $divide: [{ $subtract: ["$eventdate", "$timestamp"] }, 86400000] }
  }},
  { $match: { leadDays: { $gt: 0, $lt: 730 } }},
  { $group: {
    _id: "$category",
    leads: { $push: "$leadDays" },
    count: { $sum: 1 }
  }},
  { $sort: { count: -1 }}
])

// Results (from bookinglines, TO BE RE-RUN):
// Award Ceremony:  n=728,  median=156, p25=78,  p75=256
// Gala Dinner:     n=368,  median=142, p25=87,  p75=241
// Christmas Party: n=2315, median=114, p25=69,  p75=196
// Conference:      n=4640, median=113, p25=64,  p75=204
// Networking:      n=850,  median=105, p25=58,  p75=206
// Summer Party:    n=802,  median=90,  p25=56,  p75=139
// Pop-Up:          n=492,  median=86,  p25=46,  p75=164
// Private Dining:  n=1448, median=83,  p25=43,  p75=157
// Corporate Party: n=2346, median=79,  p25=44,  p75=134
// Meeting:         n=955,  median=71,  p25=35,  p75=131
