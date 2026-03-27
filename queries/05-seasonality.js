// ============================================================
// Seasonality — Event month distribution
// ============================================================
// SOURCE: MongoDB — bookings collection
// METHOD: Won bookings, % by event month
// UPDATED: 27 March 2026 — switched from bookinglines to bookings

db.bookings.aggregate([
  { $match: {
    status: "won",
    eventdate: { $gt: 0 }
  }},
  { $addFields: {
    eventMonth: { $month: { $toDate: { $toLong: "$eventdate" } } }
  }},
  { $group: { _id: "$eventMonth", count: { $sum: 1 } }},
  { $sort: { _id: 1 }}
])

// Results (% by month, Jan-Dec, 25 March 2026 — from bookinglines, TO BE RE-RUN):
// [4.6, 5.0, 6.6, 4.8, 6.1, 9.7, 6.6, 2.6, 9.6, 9.1, 15.3, 19.9]
//
// data.js seasonality.overall:
//   [4.6, 5.0, 6.6, 4.8, 6.1, 9.7, 6.6, 2.6, 9.6, 9.1, 15.3, 19.9]
//
// Pattern: Nov-Dec dominant (35%), Aug lowest (2.6%), Jun+Sep-Oct secondary peaks.

// ── Seasonality by event type ──────────────────────────────
// Add category filter to the $match stage above.
// data.js seasonality.byType values are from MongoDB.
//
// Conference:      [5, 7, 10, 9, 6, 14, 6, 1, 14, 12, 12, 3]
// Christmas Party: [4, 0, 2, 1, 0, 0, 1, 0, 2, 0, 10, 80]
// Summer Party:    [1, 1, 0, 5, 4, 26, 29, 10, 14, 1, 3, 6]
// Corporate Party: [3, 3, 5, 7, 6, 9, 6, 4, 9, 14, 16, 16]
