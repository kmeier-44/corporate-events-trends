// ============================================================
// Category Mix — % of won bookings by category, by year
// ============================================================
// SOURCE: MongoDB — bookings collection
// METHOD: Won bookings, grouped by category slug per year
// NOTE: Category slugs need mapping to display names (see README.md)
// UPDATED: 27 March 2026 — switched from bookinglines to bookings

db.bookings.aggregate([
  { $match: {
    status: "won",
    eventdate: { $gte: 1704067200000, $lt: 1735689600000 } // 2024
  }},
  { $group: { _id: "$category", count: { $sum: 1 } }},
  { $sort: { count: -1 }}
])

// Results (25 March 2026 — from bookinglines, TO BE RE-RUN):
// 2022 (14415 total): Conference 12.2%, Networking 12.3%, Corp Party 10.8%, Summer 10.4%
// 2023 (20415 total): Christmas 18.4%, Conference 16.5%, Networking 8.9%
// 2024 (22068 total): Conference 34.0%, Christmas 14.8%, Priv Dining 8.2%
// 2025 (21692 total): Screening 12.4%, Conference 12.1%, Networking 11.6%
//
// data.js categoryMix.categories:
//   Conference:      [12.2, 16.5, 34.0, 12.1]
//   Christmas Party: [4.9, 18.4, 14.8, 4.0]
//   Corporate Party: [10.8, 8.2, 6.5, 10.2]
//   etc.

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
