// ============================================================
// Enquiry Proportions — All bookings (not just won) by category
// ============================================================
// SOURCE: MongoDB — bookings collection
// METHOD: ALL bookings by category and year, converted to % of that
//         year's total across tracked categories.
//         Counts unique enquiries (not venue lines).
// OUTPUT: data.js categoryMix.enquiryCounts stores PROPORTIONS (%)
//         not raw counts, to avoid exposing absolute volumes publicly.
// UPDATED: 27 March 2026 — switched from bookinglines to bookings,
//          output as proportions

// Step 1: Count bookings per category per year
db.bookings.aggregate([
  { $match: {
    eventdate: { $gte: 1704067200000, $lt: 1735689600000 }, // 2024
    category: "category-conference"
  }},
  { $count: "total" }
])

// Step 2: For each year, sum totals across tracked categories, then
//         compute each category's share as a percentage.
//
// data.js categoryMix.enquiryCounts (proportions, % of year total):
//   Conference:      [12.7, 16.3, 32.5, 16.5]
//   Corporate Party: [21.0, 17.9, 19.7, 25.7]
//   Meeting:         [22.3, 11.9, 10.0, 15.9]
//   Christmas Party: [4.7, 14.6, 11.7, 4.9]
//   Networking:      [17.8, 8.0, 3.3, 16.0]
//   Summer Party:    [10.5, 5.0, 9.5, 9.9]
//   Private Dining:  [8.9, 5.7, 10.3, 6.7]
//   Award Ceremony:  [1.5, 3.0, 5.5, 4.3]
