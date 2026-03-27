// ============================================================
// Christmas Party — Enquiry month, group sizes, close month
// ============================================================
// SOURCE: MongoDB — bookings collection
// METHOD: All bookings with category-christmasParty (not just won)
//         for enquiry pattern analysis
// UPDATED: 27 March 2026 — switched from bookinglines to bookings

// ── QUERY: Enquiry month distribution ──────────────────────
// When Christmas party enquiries are created (timestamp month).

db.bookings.aggregate([
  { $match: {
    category: "category-christmasParty",
    timestamp: { $exists: true, $gt: 0 }
  }},
  { $addFields: {
    enquiryMonth: { $month: { $toDate: { $toLong: "$timestamp" } } }
  }},
  { $group: { _id: "$enquiryMonth", count: { $sum: 1 } }},
  { $sort: { _id: 1 }}
])

// Results (% by month, Jan-Dec, 25 March 2026 — from bookinglines, TO BE RE-RUN):
// [3.3, 3.6, 3.8, 3.8, 5.0, 5.8, 9.1, 13.5, 18.8, 20.5, 10.6, 2.2]
//
// data.js xmasParty.enquiryMonth:
//   [3.3, 3.6, 3.8, 3.8, 5.0, 5.8, 9.1, 13.5, 18.8, 20.5, 10.6, 2.2]


// ── QUERY: Average group size by enquiry month ─────────────
// Shows that larger groups enquire earlier.

db.bookings.aggregate([
  { $match: {
    category: "category-christmasParty",
    timestamp: { $gt: 0 },
    people: { $gt: 0 }
  }},
  { $addFields: {
    enquiryMonth: { $month: { $toDate: { $toLong: "$timestamp" } } }
  }},
  { $group: {
    _id: "$enquiryMonth",
    avgPeople: { $avg: "$people" },
    count: { $sum: 1 }
  }},
  { $sort: { _id: 1 }}
])

// Results (avg group size by enquiry month, from bookinglines, TO BE RE-RUN):
// [223, 244, 232, 194, 184, 180, 158, 183, 171, 154, 114, 223]
//
// data.js xmasParty.groupSizeByEnquiryMonth:
//   [223, 244, 232, 194, 184, 180, 158, 183, 171, 154, 114, 223]
//
// Pattern: Early enquirers (Jan-Mar) have larger groups (~220-240),
// declining to ~150 by Oct. Nov enquirers have smallest groups (114).


// ── QUERY: Xmas group size distribution ────────────────────

db.bookings.aggregate([
  { $match: {
    category: "category-christmasParty",
    people: { $gt: 0 }
  }},
  { $bucket: {
    groupBy: "$people",
    boundaries: [1, 51, 101, 201, 501, 100000],
    output: { count: { $sum: 1 } }
  }}
])

// data.js xmasParty.groupSize.distribution (from bookinglines, TO BE RE-RUN):
//   1-50: 30.4%, 51-100: 35.1%, 101-200: 22.7%, 201-500: 9.8%, 500+: 1.9%
