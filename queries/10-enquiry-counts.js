// ============================================================
// Enquiry & Won Volume Indexes — All bookings by category (2022=100)
// ============================================================
// SOURCE: MongoDB — bookings collection (enquiries), bookinglines (won)
// METHOD: Count unique bookings per category per year, then index to 2022 baseline.
//         Enquiry index = all bookings; Won index = status:'won' bookings only.
//         Raw counts not exposed publicly — only indexed values.
// OUTPUT: data.js categoryMix.enquiryIndex and categoryMix.wonIndex
// UPDATED: 27 March 2026 — switched from proportions to volume indexes (2022=100)
//          to avoid masking absolute volume changes
// SEE ALSO: run_bookinglines.py outputs marketVolume (total market index)

// Step 1: Count ALL bookings per category for baseline year (2022)
db.bookings.aggregate([
  { $match: {
    eventdate: { $gte: 1640995200000, $lt: 1672531200000 }, // 2022
    category: { $nin: ["category-birthdayParty", "category-wedding", "category-other", null] }
  }},
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Step 2: Repeat for each year (2023, 2024, 2025), then compute index:
//   index = (year_count / 2022_count) * 100
//
// data.js categoryMix.enquiryIndex (2022 = 100):
//   'Conference':      [100, 103, 131, 95],
//   'Corporate Party': [100, 121, 152, 184],
//   'Meeting':         [100, 77, 83, 135],
//   'Christmas Party': [100, 112, 101, 103],
//   'Networking':      [100, 68, 54, 173],
//   'Summer Party':    [100, 85, 177, 185],
//   'Private Dining':  [100, 78, 128, 131],
//   'Award Ceremony':  [100, 173, 344, 338]

// Step 3: For won index, filter to status:'won' bookings only:
db.bookings.aggregate([
  { $match: {
    status: "won",
    eventdate: { $gte: 1640995200000, $lt: 1672531200000 }, // 2022
    category: { $nin: ["category-birthdayParty", "category-wedding", "category-other", null] }
  }},
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// data.js categoryMix.wonIndex (2022 = 100):
//   'Conference':      [100, 114, 155, 126],
//   'Corporate Party': [100, 101, 121, 107],
//   'Meeting':         [100, 97, 114, 89],
//   'Christmas Party': [100, 157, 132, 142],
//   'Networking':      [100, 88, 114, 100],
//   'Summer Party':    [100, 69, 166, 100],
//   'Private Dining':  [100, 95, 210, 133],
//   'Award Ceremony':  [100, 173, 282, 173]

// Step 4: Market total (sum all categories per year, index to 2022)
// data.js marketVolume.enquiryIndex: [100, 83, 100, 178]
// data.js marketVolume.wonIndex:     [100, 94, 114, 102]
