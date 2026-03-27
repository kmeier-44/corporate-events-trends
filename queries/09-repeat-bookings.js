// ============================================================
// Repeat Bookings — Company and company-venue rebooking rates
// ============================================================
// SOURCE: MongoDB — bookings + bookinglines collections
// METHOD: Returning companies uses bookings (one per enquiry).
//         Same-venue rebooking uses bookinglines (need venue-level detail).
// UPDATED: 27 March 2026 — returning companies switched to bookings,
//          same-venue rebooking stays on bookinglines but uses status: "won"

// ── QUERY: Returning companies (booked in 2+ years) ────────
// Uses bookings collection — one record per enquiry.

db.bookings.aggregate([
  { $match: {
    status: "won",
    eventdate: { $gt: 0 },
    "companyData.name": { $exists: true, $ne: null }
  }},
  { $addFields: {
    eventYear: { $year: { $toDate: { $toLong: "$eventdate" } } }
  }},
  { $group: {
    _id: "$companyData.name",
    years: { $addToSet: "$eventYear" }
  }},
  { $addFields: { yearCount: { $size: "$years" } }},
  { $group: {
    _id: null,
    total: { $sum: 1 },
    multi: { $sum: { $cond: [{ $gte: ["$yearCount", 2] }, 1, 0] } }
  }}
])

// Results (25 March 2026 — from bookinglines, TO BE RE-RUN):
// Companies booking 2+ years: 3273/13755 = 23.8%
//
// data.js repeatBookings.returningCompanyRate: 23.8


// ── QUERY: Same venue rebooking ────────────────────────────
// Uses bookinglines — need venueId to know which venue was confirmed.

db.bookinglines.aggregate([
  { $match: {
    status: "won",
    venueId: { $type: "int" },
    eventdate: { $gt: 0 }
  }},
  { $addFields: {
    eventYear: { $year: { $toDate: { $toLong: "$eventdate" } } }
  }},
  { $group: {
    _id: { venue: "$venueId", company: "$companyData.name" },
    years: { $addToSet: "$eventYear" }
  }},
  { $addFields: { yearCount: { $size: "$years" } }},
  { $group: {
    _id: null,
    total: { $sum: 1 },
    multi: { $sum: { $cond: [{ $gte: ["$yearCount", 2] }, 1, 0] } }
  }}
])

// Results (from bookinglines, TO BE RE-RUN):
// Company-venue pairs booking 2+ years: 11843/228437 = 5.2%
//
// data.js repeatBookings.sameVenueRate: 5.2
