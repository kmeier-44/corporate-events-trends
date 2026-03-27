// ============================================================
// Day of Week — Event day distribution
// ============================================================
// SOURCE: MongoDB — bookings collection
// METHOD: Won bookings, % by day of week
// NOTE: MongoDB dayOfWeek: 1=Sunday, 2=Monday, ..., 7=Saturday
//       Output is reordered to Mon-Sun for data.js.
// UPDATED: 27 March 2026 — switched from bookinglines to bookings

db.bookings.aggregate([
  { $match: {
    status: "won",
    eventdate: { $gt: 0 }
  }},
  { $addFields: {
    eventDOW: { $dayOfWeek: { $toDate: { $toLong: "$eventdate" } } }
  }},
  { $group: { _id: "$eventDOW", count: { $sum: 1 } }},
  { $sort: { _id: 1 }}
])

// Results (Mon-Sun, 25 March 2026 — from bookinglines, TO BE RE-RUN):
// [8.3, 13.3, 17.9, 28.8, 19.4, 8.9, 3.4]
//
// data.js dayOfWeek:
//   [8.3, 13.3, 17.9, 28.8, 19.4, 8.9, 3.4]
//
// Pattern: Thu dominant (28.8%), Fri second (19.4%), Wed third (17.9%)
