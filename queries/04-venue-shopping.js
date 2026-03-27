// ============================================================
// Venue Shopping — Venues compared per booking
// ============================================================
// SOURCE: MongoDB — bookinglines collection
// METHOD: Distinct venueIds per bookingId (all BLs, not just confirmed)
// FIELDS: bookingId, venueId (must be integer type)

db.bookinglines.aggregate([
  { $match: {
    venueId: { $type: "int" },
    eventdate: { $gte: 1704067200000, $lt: 1735689600000 } // 2024
  }},
  { $group: {
    _id: "$bookingId",
    venues: { $addToSet: "$venueId" }
  }},
  { $addFields: { venueCount: { $size: "$venues" } }},
  { $group: {
    _id: null,
    totalBookings: { $sum: 1 },
    avgVenues: { $avg: "$venueCount" },
    multiVenue: { $sum: { $cond: [{ $gt: ["$venueCount", 1] }, 1, 0] } }
  }},
  { $addFields: {
    multiVenuePct: { $multiply: [{ $divide: ["$multiVenue", "$totalBookings"] }, 100] }
  }}
])

// Results (25 March 2026):
// 2022: n=23946, avgVenues=2.75, multiVenue=35.5%
// 2023: n=17272, avgVenues=3.36, multiVenue=38.2%
// 2024: n=16630, avgVenues=3.39, multiVenue=34.8%
// 2025: n=15768, avgVenues=3.51, multiVenue=31.6%
//
// data.js venueShopping:
//   avgVenues: [2.8, 3.4, 3.4, 3.5]    (rounded from above)
//   multiVenuePct: [36, 38, 35, 32]     (rounded from above)
