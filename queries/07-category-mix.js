// ============================================================
// Category Mix — Confirmed bookings by category, by year
// ============================================================
// SOURCE: MongoDB — bookinglines collection
// METHOD: Confirmed BLs (situation:"Con"), grouped by category slug per year.
//         Used to understand which event types are booked most.
// NOTE: This query produces raw counts for analysis. The data.js output now uses
//       volume INDEXES (2022=100) via run_bookinglines.py and 10-enquiry-counts.js,
//       not proportions. See those files for the current methodology.
// UPDATED: 27 March 2026 — clarified role vs new index-based approach

db.bookinglines.aggregate([
  { $match: {
    situation: "Con",
    venueId: { $type: "int" },
    eventdate: { $gte: 1704067200000, $lt: 1735689600000 } // 2024
  }},
  { $group: { _id: "$category", count: { $sum: 1 } }},
  { $sort: { count: -1 }}
])

// Category slug mapping:
// Conference       → category-conference
// Meeting          → category-meeting
// Corporate Party  → category-corporateParty
// Christmas Party  → category-christmasParty
// Screening        → category-screening
// Networking       → category-networkingEvent
// Private Dining   → category-corporatePrivateDining
// Summer Party     → category-summerParty
// Pop-Up           → category-popUp
// Ticketed Event   → category-ticketedEvent
// Award Ceremony   → category-awardCeremony
// Gala Dinner      → category-galaDinner
